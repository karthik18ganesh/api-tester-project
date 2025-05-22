const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const API_PREFIX = '/api/v1/apirepos';

// Generic API fetch function
export const api = async (path, method = "GET", body = null, headers = {}) => {
  const url = `${BASE_URL}${path}`;
  console.log(`Calling API: ${method} ${url}`);
  
  const defaultHeaders = { "Content-Type": "application/json", ...headers };

  const res = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : null,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.result?.message || "API Error");

  return json;
};

// API Repository specific endpoints
export const apiRepository = {
  // Get all APIs with pagination
  getAll: async (pageNo = 0, limit = 10, sortBy = "createdDate", sortDir = "DESC") => {
    return api(`${API_PREFIX}?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`);
  },

  // Get API details by ID
  getById: async (apiId) => {
    return api(`${API_PREFIX}/${apiId}`);
  },

  // Create new API repository (redirects to update)
  create: async (apiData) => {
    return apiRepository.update(apiData);
  },

  // Update existing API repository
  update: async (apiData) => {
    // Use the directly passed formatted payload from component
    if (apiData.requestMetaData && apiData.data) {
      // If it's a create operation (no apiId), use POST
      if (!apiData.data.apiId) {
        return api(API_PREFIX, "POST", apiData);
      }
      // If it's an update operation (has apiId), use PUT
      return api(API_PREFIX, "PUT", apiData);
    }

    // If old format is used, prepare the request body according to API documentation
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem('userId') || 'anonymous',
        transactionId: `tx-${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      data: {
        apiId: apiData.id,
        apiRepoName: apiData.name,
        envId: apiData.environment,
        method: apiData.method,
        url: apiData.url,
        description: apiData.description,
        request: {
          requestId: apiData.requestId,
          headers: apiData.headers
            .filter(h => h.enabled && h.key.trim())
            .reduce((obj, h) => ({ ...obj, [h.key]: h.value }), {}),
          queryParams: apiData.params
            .filter(p => p.enabled && p.key.trim())
            .reduce((obj, p) => ({ ...obj, [p.key]: p.value }), {}),
          pathParams: {},  // Extract from URL if available
          auth: apiData.auth.type !== "No Auth" ? {
            type: apiData.auth.type === "Bearer Token" ? "BEARER" : 
                  apiData.auth.type === "Basic Auth" ? "BASIC" : 
                  apiData.auth.type === "API Key" ? "API_KEY" : "NONE",
            token: apiData.auth.bearerToken || "",
            username: apiData.auth.username || "",
            password: apiData.auth.password || ""
          } : undefined
        }
      }
    };

    // Use POST for create (no id) and PUT for update
    const method = !apiData.id ? "POST" : "PUT";
    return api(API_PREFIX, method, requestBody);
  },

  // Execute API
  execute: async (apiData) => {
    // Prepare the request body according to API documentation
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem('userId') || 'anonymous',
        transactionId: `tx-${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      data: {
        apiId: apiData.id,
        apiRepoName: apiData.name,
        envId: apiData.environment,
        method: apiData.method,
        url: apiData.url,
        request: {
          headers: apiData.headers
            .filter(h => h.enabled && h.key.trim())
            .reduce((obj, h) => ({ ...obj, [h.key]: h.value }), {}),
          queryParams: apiData.params
            .filter(p => p.enabled && p.key.trim())
            .reduce((obj, p) => ({ ...obj, [p.key]: p.value }), {}),
          pathParams: {},  // Extract from URL if available
          auth: apiData.auth.type !== "No Auth" ? {
            type: apiData.auth.type === "Bearer Token" ? "BEARER" : 
                  apiData.auth.type === "Basic Auth" ? "BASIC" : 
                  apiData.auth.type === "API Key" ? "API_KEY" : "NONE",
            token: apiData.auth.bearerToken || "",
            username: apiData.auth.username || "",
            password: apiData.auth.password || ""
          } : undefined
        }
      }
    };

    return api(`${API_PREFIX}/executeAPI`, "POST", requestBody);
  }
};

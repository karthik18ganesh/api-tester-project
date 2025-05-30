// Parameter extraction utilities
const extractParameters = (text) => {
  if (!text) return [];
  const paramRegex = /\$\{([^}]+)\}/g;
  const params = [];
  let match;
  
  while ((match = paramRegex.exec(text)) !== null) {
    params.push(match[1]);
  }
  
  return [...new Set(params)]; // Remove duplicates
};

const extractQueryParameters = (queryParams) => {
  if (!queryParams || typeof queryParams !== 'object') return [];
  
  const params = [];
  
  Object.entries(queryParams).forEach(([key, value]) => {
    params.push(...extractParameters(key));
    params.push(...extractParameters(String(value)));
  });
  
  return [...new Set(params)];
};

const extractHeaderParameters = (headers) => {
  if (!headers || typeof headers !== 'object') return [];
  
  const params = [];
  
  Object.entries(headers).forEach(([key, value]) => {
    params.push(...extractParameters(key));
    params.push(...extractParameters(String(value)));
  });
  
  return [...new Set(params)];
};

const extractPathParameters = (pathParams) => {
  if (!pathParams || typeof pathParams !== 'object') return [];
  
  const params = [];
  
  Object.entries(pathParams).forEach(([key, value]) => {
    params.push(...extractParameters(key));
    params.push(...extractParameters(String(value)));
  });
  
  return [...new Set(params)];
};

export const detectAllParameters = (testCase) => {
  const allParams = [];
  
  // Extract from URL
  if (testCase.url) {
    allParams.push(...extractParameters(testCase.url));
  }
  
  // Extract from API's request parameters
  if (testCase.api && testCase.api.request) {
    const request = testCase.api.request;
    
    if (request.queryParams) {
      allParams.push(...extractQueryParameters(request.queryParams));
    }
    
    if (request.headers) {
      allParams.push(...extractHeaderParameters(request.headers));
    }
    
    if (request.pathParams) {
      allParams.push(...extractPathParameters(request.pathParams));
    }
  }
  
  return [...new Set(allParams)];
};

export const extractParametersFromApiDetails = (apiDetails) => {
  let apiParams = [];
  
  if (apiDetails && apiDetails.request) {
    const request = apiDetails.request;
    
    if (request.queryParams) {
      apiParams.push(...extractQueryParameters(request.queryParams));
    }
    
    if (request.headers) {
      apiParams.push(...extractHeaderParameters(request.headers));
    }
    
    if (request.pathParams) {
      apiParams.push(...extractPathParameters(request.pathParams));
    }
  }
  
  return [...new Set(apiParams)];
};

export { extractParameters }; 
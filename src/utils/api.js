// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_PREFIX = '/api/v1/apirepos';

import { useAuthStore } from '../stores/authStore';

// Debug logging utility - only logs in development
const debugLog = (message, data = null) => {
  if (import.meta.env.DEV && import.meta.env.VITE_API_DEBUG === 'true') {
    console.log(`[API Debug] ${message}`, data || '');
  }
};

// Generic API fetch function
export const api = async (path, method = "GET", body = null, headers = {}) => {
  const url = `${BASE_URL}${path}`;
  debugLog(`${method} ${url}`);
  
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

  // UPDATED: Update existing API repository - use environment from request data
  update: async (apiData) => {
    // Use the directly passed formatted payload from component
    if (apiData.requestMetaData && apiData.data) {
      // Remove the hardcoded envId = 1, use the one provided in the data
      
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
        envId: apiData.environment, // Use the environment from the request data
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
          auth: apiData.auth && apiData.auth.type !== "No Auth" ? {
            type: apiData.auth.type === "Bearer Token" ? "BEARER" : 
                  apiData.auth.type === "Basic Auth" ? "BASIC" : 
                  apiData.auth.type === "API Key" ? "API_KEY" : "NONE",
            token: apiData.auth.bearerToken || "",
            username: apiData.auth.username || "",
            password: apiData.auth.password || "",
            keyName: apiData.auth.apiKeyName || "",
            keyValue: apiData.auth.apiKeyValue || "",
            addTo: apiData.auth.apiKeyAddTo || "Header"
          } : undefined,
          body: apiData.body && apiData.body.type !== "none" ? {
            type: apiData.body.type,
            contentType: apiData.body.contentType,
            raw: apiData.body.raw,
            formData: apiData.body.formData ? apiData.body.formData
              .filter(item => item.enabled && item.key)
              .reduce((obj, item) => ({ 
                ...obj, 
                [item.key]: { value: item.value, type: item.type } 
              }), {}) : undefined,
            urlEncoded: apiData.body.urlEncoded ? apiData.body.urlEncoded
              .filter(item => item.enabled && item.key)
              .reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {}) : undefined
          } : undefined
        }
      }
    };

    // Use POST for create (no id) and PUT for update
    const method = !apiData.id ? "POST" : "PUT";
    return api(API_PREFIX, method, requestBody);
  },

  // UPDATED: Execute API - use environment from request data
  execute: async (apiData) => {
    // Prepare auth data
    let authData = undefined;
    if (apiData.auth && apiData.auth.type !== "No Auth") {
      authData = {
        type: apiData.auth.type === "Bearer Token" ? "BEARER" : 
              apiData.auth.type === "Basic Auth" ? "BASIC" : 
              apiData.auth.type === "API Key" ? "API_KEY" : "NONE"
      };
      
      if (apiData.auth.type === "Bearer Token") {
        authData.token = apiData.auth.bearerToken || "";
      } else if (apiData.auth.type === "Basic Auth") {
        authData.username = apiData.auth.username || "";
        authData.password = apiData.auth.password || "";
      } else if (apiData.auth.type === "API Key") {
        authData.keyName = apiData.auth.apiKeyName || "";
        authData.keyValue = apiData.auth.apiKeyValue || "";
        authData.addTo = apiData.auth.apiKeyAddTo || "Header";
      }
    }
    
    // Prepare body data
    let bodyData = undefined;
    if (apiData.body && apiData.body.type !== "none") {
      bodyData = {
        type: apiData.body.type,
        contentType: apiData.body.contentType
      };
      
      if (apiData.body.type === "raw") {
        bodyData.raw = apiData.body.raw;
      } else if (apiData.body.type === "form-data") {
        bodyData.formData = {};
        apiData.body.formData
          .filter(item => item.enabled && item.key)
          .forEach(item => {
            bodyData.formData[item.key] = {
              value: item.value,
              type: item.type
            };
          });
      } else if (apiData.body.type === "x-www-form-urlencoded") {
        bodyData.urlEncoded = {};
        apiData.body.urlEncoded
          .filter(item => item.enabled && item.key)
          .forEach(item => {
            bodyData.urlEncoded[item.key] = item.value;
          });
      }
    }

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
        envId: apiData.environment, // Use the environment from the request data
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
          auth: authData,
          body: bodyData
        }
      }
    };

    return api(`${API_PREFIX}/executeAPI`, "POST", requestBody);
  }
};

// Enhanced Test Execution specific endpoints with assertion support
export const testExecution = {
  // Execute test package
  executePackage: async (packageId, executedBy) => {
    // If no executedBy provided, get from auth store
    if (!executedBy) {
      const { user } = useAuthStore.getState();
      executedBy = user?.username || localStorage.getItem('userId') || 'anonymous';
    }
    
    const requestBody = {
      executedBy: executedBy
    };
    
    return api(`/api/v1/test-execution/package/${packageId}`, "POST", requestBody);
  },

  // Execute test suite
  executeSuite: async (suiteId, executedBy) => {
    // If no executedBy provided, get from auth store
    if (!executedBy) {
      const { user } = useAuthStore.getState();
      executedBy = user?.username || localStorage.getItem('userId') || 'anonymous';
    }
    
    const requestBody = {
      executedBy: executedBy
    };
    
    return api(`/api/v1/test-execution/suite/${suiteId}`, "POST", requestBody);
  },

  // Execute individual test case - FIXED ENDPOINT
  executeTestCase: async (testCaseId, executedBy) => {
    // If no executedBy provided, get from auth store
    if (!executedBy) {
      const { user } = useAuthStore.getState();
      executedBy = user?.username || localStorage.getItem('userId') || 'anonymous';
    }
    
    const requestBody = {
      executedBy: executedBy
    };
    
    return api(`/api/v1/test-execution/case/${testCaseId}`, "POST", requestBody);
  },

  // Get execution details by execution ID
  getExecutionDetails: async (executionId) => {
    return api(`/api/v1/test-execution/${executionId}`, "GET");
  },

  // Get execution history/results
  getExecutionHistory: async (pageNo = 0, limit = 10, sortBy = "executionDate", sortDir = "DESC") => {
    return api(`/api/v1/test-execution?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`, "GET");
  },

  // NEW: Get detailed assertion results for execution
  getExecutionAssertions: async (executionId) => {
    return api(`/api/v1/test-execution/${executionId}/assertions`, "GET");
  },

  // NEW: Get assertion summary for execution
  getExecutionAssertionSummary: async (executionId) => {
    return api(`/api/v1/test-execution/${executionId}/assertions/summary`, "GET");
  }
};

// Test Case specific endpoints
export const testCases = {
  // Get all test cases with pagination
  getAll: async (pageNo = 0, limit = 10, sortBy = "createdDate", sortDir = "DESC") => {
    return api(`/api/v1/test-cases?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`, "GET");
  },

  // Get test case by ID
  getById: async (testCaseId) => {
    return api(`/api/v1/test-cases/${testCaseId}`, "GET");
  },

  // Create new test case
  create: async (testCaseData) => {
    return api("/api/v1/test-cases", "POST", testCaseData);
  },

  // Update existing test case
  update: async (testCaseData) => {
    return api("/api/v1/test-cases", "PUT", testCaseData);
  },

  // Delete test cases (bulk)
  delete: async (testCaseIds) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: testCaseIds
    };
    
    return api("/api/v1/test-cases/delete", "DELETE", requestBody);
  },

  // Export test cases
  export: async (format, testCaseIds) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        format: format,
        testCaseIds: testCaseIds
      }
    };
    
    return api("/api/v1/test-cases/export", "POST", requestBody);
  }
};

// Test Suite specific endpoints
export const testSuites = {
  // Get all test suites with pagination
  getAll: async (pageNo = 0, limit = 100, sortBy = "createdDate", sortDir = "DESC") => {
    return api(`/api/v1/test-suites?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`, "GET");
  },

  // Get test suite by ID
  getById: async (suiteId) => {
    return api(`/api/v1/test-suites/${suiteId}`, "GET");
  },

  // Create new test suite
  create: async (suiteData) => {
    return api("/api/v1/test-suites", "POST", suiteData);
  },

  // Update existing test suite
  update: async (suiteData) => {
    return api("/api/v1/test-suites", "PUT", suiteData);
  },

  // Delete test suites (bulk)
  delete: async (suiteIds) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: suiteIds
    };
    
    return api("/api/v1/test-suites/delete", "DELETE", requestBody);
  },

  // Get test cases associated with a suite
  getTestCases: async (suiteId) => {
    return api(`/api/v1/test-suites/${suiteId}/test-cases`, "GET");
  },

  // Associate test cases to suite
  associateTestCases: async (suiteId, testCaseIds) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: testCaseIds
    };
    
    return api(`/api/v1/test-cases/associate-to-suite/${suiteId}`, "POST", requestBody);
  },

  // Remove test case association from suite
  removeTestCaseAssociation: async (testCaseId, testSuiteId) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        testCaseId: testCaseId,
        testSuiteId: testSuiteId
      }
    };
    
    return api("/api/v1/test-cases/remove-assoc-to-suite", "DELETE", requestBody);
  }
};

// Test Package specific endpoints
export const testPackages = {
  // Get all test packages with pagination
  getAll: async (pageNo = 0, limit = 100, sortBy = "createdDate", sortDir = "DESC") => {
    return api(`/api/v1/packages?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`, "GET");
  },

  // Get test package by ID
  getById: async (packageId) => {
    return api(`/api/v1/packages/${packageId}`, "GET");
  },

  // Create new test package
  create: async (packageData) => {
    return api("/api/v1/packages", "POST", packageData);
  },

  // Update existing test package
  update: async (packageData) => {
    return api("/api/v1/packages", "PUT", packageData);
  },

  // Delete test packages (bulk)
  delete: async (packageIds) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: packageIds
    };
    
    return api("/api/v1/packages/delete", "DELETE", requestBody);
  },

  // Get test suites associated with a package
  getTestSuites: async (packageId) => {
    return api(`/api/v1/packages/${packageId}/test-suites`, "GET");
  },

  // Associate test suites to package
  associateTestSuites: async (packageId, testSuiteIds) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: testSuiteIds
    };
    
    return api(`/api/v1/test-suites/associate-to-packages/${packageId}`, "POST", requestBody);
  },

  // Remove test suite association from package
  removeTestSuiteAssociation: async (testPackageId, testSuiteId) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        testPackageId: testPackageId,
        testSuiteId: testSuiteId
      }
    };
    
    return api("/api/v1/test-suites/remove-assoc-to-packages", "DELETE", requestBody);
  },

  // Get package hierarchy for test execution
  getHierarchy: async () => {
    return api('/api/v1/packages/hierarchy', 'GET');
  }
};

// Variables specific endpoints
export const variables = {
  // Get variables for a test case
  getByTestCase: async (testCaseId) => {
    return api(`/api/v1/variables/${testCaseId}`, "GET");
  },

  // Create new variable
  create: async (variableData) => {
    return api("/api/v1/variables", "POST", variableData);
  },

  // Update existing variable
  update: async (variableData) => {
    return api("/api/v1/variables", "PUT", variableData);
  },

  // Delete variable
  delete: async (variableId) => {
    return api(`/api/v1/variables/${variableId}`, "DELETE");
  }
};

// Project specific endpoints
export const projects = {
  // Get all projects with pagination
  getAll: async (pageNo = 0, limit = 100, sortBy = "updatedDate", sortDir = "DESC") => {
    return api(`/api/v1/projects?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`, "GET");
  },

  // Get project by ID
  getById: async (projectId) => {
    return api(`/api/v1/projects/${projectId}`, "GET");
  },

  // Create new project
  create: async (projectData) => {
    return api("/api/v1/projects", "POST", projectData);
  },

  // Update existing project
  update: async (projectData) => {
    return api("/api/v1/projects", "PUT", projectData);
  },

  // Delete project
  delete: async (projectId) => {
    return api(`/api/v1/projects/${projectId}`, "DELETE");
  }
};

// Environment specific endpoints
export const environments = {
  // Get all environments
  getAll: async () => {
    return api("/api/v1/environments", "GET");
  },

  // Get environment by ID
  getById: async (envId) => {
    return api(`/api/v1/environments/${envId}`, "GET");
  },

  // Create new environment
  create: async (envData) => {
    return api("/api/v1/environments", "POST", envData);
  },

  // Update existing environment
  update: async (envData) => {
    return api("/api/v1/environments", "PUT", envData);
  },

  // Delete environment
  delete: async (envId) => {
    return api(`/api/v1/environments/${envId}`, "DELETE");
  }
};

// Global Search endpoint
export const globalSearch = {
  // Search across all entities
  search: async (keyword) => {
    return api(`/api/v1/global-search?keyword=${encodeURIComponent(keyword)}`, "GET");
  }
};

// Assertion specific endpoints
export const assertions = {
  // Get assertions for a test case
  getByTestCase: async (testCaseId) => {
    return api(`/api/v1/test-cases/${testCaseId}/assertions`, "GET");
  },

  // Create new assertion
  create: async (assertionData) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: assertionData
    };
    return api("/api/v1/assertions", "POST", requestBody);
  },

  // Update existing assertion
  update: async (assertionId, assertionData) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        ...assertionData,
        assertionId: assertionId
      }
    };
    return api("/api/v1/assertions", "PUT", requestBody);
  },

  // Delete assertion
  delete: async (assertionId) => {
    return api(`/api/v1/assertions/${assertionId}`, "DELETE");
  },

  // Bulk delete assertions
  bulkDelete: async (assertionIds) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        assertionIds: assertionIds
      }
    };
    return api("/api/v1/assertions/bulk-delete", "DELETE", requestBody);
  },

  // Test assertion against sample response
  test: async (assertion, sampleResponse) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        assertion: assertion,
        sampleResponse: sampleResponse
      }
    };
    return api("/api/v1/assertions/test", "POST", requestBody);
  },

  // Get assertion templates
  getTemplates: async () => {
    return api("/api/v1/assertion-templates", "GET");
  },

  // Create assertion from template
  createFromTemplate: async (templateId, testCaseId, customConfig = {}) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        templateId: templateId,
        testCaseId: testCaseId,
        customConfig: customConfig
      }
    };
    return api("/api/v1/assertions/from-template", "POST", requestBody);
  },

  // Update assertion priority/order
  updatePriorities: async (testCaseId, assertionPriorities) => {
    const requestBody = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      data: {
        testCaseId: testCaseId,
        assertionPriorities: assertionPriorities // [{ assertionId, priority }]
      }
    };
    return api("/api/v1/assertions/priorities", "PUT", requestBody);
  }
};

// Dashboard specific endpoints  
export const dashboard = {
  // Utility method to convert days to date range
  getDateRangeFromDays: (days) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - parseInt(days));
    
    const dateRange = {
      fromDate: fromDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      toDate: toDate.toISOString().split('T')[0]
    };
    
    debugLog(`Date range for ${days} days:`, dateRange);
    return dateRange;
  },

  // Get unified dashboard metrics with date range
  getMetrics: async (timeRange = '7') => {
    const { fromDate, toDate } = dashboard.getDateRangeFromDays(timeRange);
    return api(`/api/v1/dashboard/metrics/range?fromDate=${fromDate}&toDate=${toDate}`, "GET");
  },

  // Legacy methods for backward compatibility - all use the unified endpoint
  getSummary: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getMetricsForRange: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getSuccessRateTrend: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getResponseTimeTrend: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getExecutionVolumeTrend: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getEnvironmentMetrics: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getRecentExecutions: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getTopPerformers: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getTopFailures: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getProjectMetrics: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  getSystemHealth: async (timeRange = '7') => {
    return dashboard.getMetrics(timeRange);
  },

  // Legacy utility method for backward compatibility - now returns days directly
  getFilterFromDays: (days) => {
    return days.toString();
  },

  // Refresh cache
  refreshCache: async () => {
    return api("/api/v1/dashboard/refresh-cache", "POST");
  },

  // Health check
  healthCheck: async () => {
    return api("/api/v1/dashboard/health", "GET");
  },

  // Get environment status for a specific project
  getEnvironmentStatus: async (projectId, timeRange = '7') => {
    const { fromDate, toDate } = dashboard.getDateRangeFromDays(timeRange);
    return api(`/api/v1/dashboard/environment-status?projectId=${projectId}&fromDate=${fromDate}&toDate=${toDate}`, "GET");
  },

  // Get suite performers for top performers and needs attention sections
  getSuitePerformers: async (timeRange = '7') => {
    const { fromDate, toDate } = dashboard.getDateRangeFromDays(timeRange);
    return api(`/api/v1/dashboard/suite-performers?fromDate=${fromDate}&toDate=${toDate}`, "GET");
  }
};

// Default export for backward compatibility
export default api;
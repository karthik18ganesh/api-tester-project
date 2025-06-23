import { nanoid } from 'nanoid';

export const testHierarchy = {
  id: 'pkg-001',
  name: 'Test Package',
  type: 'package',
  children: [
    {
      id: 'ts-001',
      name: 'Test Suite 1',
      type: 'suite',
      children: [
        {
          id: 'tc-001',
          name: 'Test Case 1.1',
          type: 'case',
        },
        {
          id: 'tc-002',
          name: 'Test Case 1.2',
          type: 'case',
        },
      ],
    },
    {
      id: 'ts-002',
      name: 'Test Suite 2',
      type: 'suite',
      children: [
        {
          id: 'tc-003',
          name: 'Test Case 2.1',
          type: 'case',
        },
        {
          id: 'tc-004',
          name: 'Test Case 2.2',
          type: 'case',
        },
      ],
    },
  ],
};

export const executionResults = {
  'exec-20405009-001': {
    id: 'exec-20405009-001',
    status: 'Failed',
    instanceId: 'exec-20405009-001',
    executedBy: 'karthik.g',
    environment: 'Staging',
    executedAt: 'May 9, 2025 - 10:32 AM',
    passedCount: 1,
    failedCount: 1,
    results: [
      {
        id: 'tc-001',
        name: 'Test Case 1.1',
        status: 'Passed',
        duration: '0.84s',
        request: {
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: {
            'Authorization': 'Bearer token'
          }
        },
        response: {
          status: 200,
          data: {
            id: 1,
            name: 'Example'
          }
        },
        assertions: [
          { id: 1, description: 'Status code is 200', status: 'Passed' },
          { id: 2, description: 'Response body contains "Example"', status: 'Passed' }
        ]
      },
      {
        id: 'tc-002',
        name: 'Test Case 1.2',
        status: 'Failed',
        duration: '1.3s',
        request: {
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: {
            'Authorization': 'Bearer token'
          }
        },
        response: {
          status: 200,
          data: {
            id: 1,
            name: 'Example'
          }
        },
        assertions: [
          { id: 1, description: 'Status code is 200', status: 'Passed' },
          { id: 2, description: 'Response body contains "Example"', status: 'Passed' },
          { id: 3, description: 'Response time is less than 500ms', status: 'Failed' }
        ]
      }
    ]
  }
};

export const executionHistory = [
  {
    id: 'exec-202505091',
    status: 'Passed',
    passedFailed: '5/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505092',
    status: 'Passed',
    passedFailed: '5/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505093',
    status: 'Passed',
    passedFailed: '5/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505094',
    status: 'Failed',
    passedFailed: '3/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505095',
    status: 'Failed',
    passedFailed: '2/10',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
];

// Enhanced mock data with comprehensive assertion results
export const createMockExecutionResult = (selectedItem, environment = 'Staging') => {
  const executionId = `exec-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Sample assertion results that showcase different types
  const createSampleAssertions = (testCaseId, responseData) => {
    return [
      {
        assertionId: nanoid(),
        assertionName: 'Status Code Validation',
        type: 'status_code',
        status: 'PASSED',
        actualValue: 200,
        expectedValue: 200,
        path: 'response.status',
        executionTime: 2
      },
      {
        assertionId: nanoid(),
        assertionName: 'Response Time Check',
        type: 'response_time', 
        status: 'PASSED',
        actualValue: '485ms',
        expectedValue: '< 2000ms',
        path: 'execution.responseTime',
        executionTime: 1
      },
      {
        assertionId: nanoid(),
        assertionName: 'User ID Exists',
        type: 'json_path',
        status: 'PASSED',
        actualValue: responseData.data?.id || 123,
        expectedValue: 'exists',
        path: 'response.body.data.id',
        executionTime: 3
      },
      {
        assertionId: nanoid(),
        assertionName: 'Email Format Validation',
        type: 'json_path',
        status: Math.random() > 0.3 ? 'PASSED' : 'FAILED',
        actualValue: responseData.data?.email || 'user@example.com',
        expectedValue: 'valid email format',
        path: 'response.body.data.email',
        executionTime: 4,
        ...(Math.random() > 0.3 ? {} : {
          error: 'Email format does not match expected pattern ^[^@]+@[^@]+\\.[^@]+$'
        })
      },
      {
        assertionId: nanoid(),
        assertionName: 'Response Content Type',
        type: 'header_validation',
        status: 'PASSED',
        actualValue: 'application/json',
        expectedValue: 'application/json',
        path: 'response.headers.content-type',
        executionTime: 1
      },
      {
        id: nanoid(),
        name: 'Data Array Not Empty',
        type: 'json_path',
        status: Math.random() > 0.2 ? 'PASSED' : 'FAILED',
        actualValue: responseData.data?.length || 5,
        expectedValue: '> 0',
        path: 'response.body.data.length',
        executionTime: 2,
        ...(Math.random() > 0.2 ? {} : {
          error: 'Expected data array to have length greater than 0, but got 0'
        })
      }
    ];
  };

  // Generate comprehensive test case results
  const generateTestCaseResults = () => {
    const testCases = [
      {
        testCaseId: '1001',
        testCaseName: 'GET /api/users - Retrieve User List',
        httpMethod: 'GET',
        url: 'https://api.example.com/users',
        responseData: {
          success: true,
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
          ],
          pagination: { page: 1, limit: 10, total: 2 }
        }
      },
      {
        testCaseId: '1002', 
        testCaseName: 'POST /api/users - Create New User',
        httpMethod: 'POST',
        url: 'https://api.example.com/users',
        responseData: {
          success: true,
          data: { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
          message: 'User created successfully'
        }
      },
      {
        testCaseId: '1003',
        testCaseName: 'PUT /api/users/1 - Update User',
        httpMethod: 'PUT', 
        url: 'https://api.example.com/users/1',
        responseData: {
          success: true,
          data: { id: 1, name: 'John Doe Updated', email: 'john.updated@example.com', role: 'admin' },
          message: 'User updated successfully'
        }
      },
      {
        testCaseId: '1004',
        testCaseName: 'DELETE /api/users/999 - Delete Non-existent User',
        httpMethod: 'DELETE',
        url: 'https://api.example.com/users/999',
        responseData: {
          success: false,
          error: 'User not found',
          code: 404
        },
        shouldFail: true
      },
      {
        testCaseId: '1005',
        testCaseName: 'GET /api/users/1 - Get User by ID',
        httpMethod: 'GET',
        url: 'https://api.example.com/users/1',
        responseData: {
          success: true,
          data: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: '2024-01-15T10:30:00Z' }
        }
      }
    ];

    return testCases.map((testCase, index) => {
      const executionTimeMs = Math.floor(Math.random() * 1000) + 200;
      const statusCode = testCase.shouldFail ? 404 : 200;
      const executionStatus = testCase.shouldFail ? 'FAILED' : 'PASSED';
      
      // Generate assertions for this test case
      const assertions = createSampleAssertions(testCase.testCaseId, testCase.responseData);
      
      // Calculate assertion summary
      const passedAssertions = assertions.filter(a => a.status === 'PASSED').length;
      const failedAssertions = assertions.filter(a => a.status === 'FAILED').length;
      const totalAssertions = assertions.length;
      
      // Override execution status based on assertion results
      const overallStatus = failedAssertions === 0 ? 'PASSED' : 'FAILED';
      
      return {
        testCaseId: testCase.testCaseId,
        testCaseName: testCase.testCaseName,
        httpMethod: testCase.httpMethod,
        url: testCase.url,
        statusCode: statusCode,
        executionStatus: overallStatus,
        executionTimeMs: executionTimeMs,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'User-Agent': 'API-Tester/1.0'
        },
        requestBody: testCase.httpMethod === 'POST' ? JSON.stringify({
          name: 'Bob Wilson',
          email: 'bob@example.com',
          role: 'user'
        }) : testCase.httpMethod === 'PUT' ? JSON.stringify({
          name: 'John Doe Updated',
          email: 'john.updated@example.com'
        }) : null,
        responseHeaders: {
          'content-type': 'application/json',
          'server': 'nginx/1.18.0',
          'x-response-time': `${executionTimeMs}ms`,
          'cache-control': 'no-cache'
        },
        responseBody: testCase.responseData,
        errorMessage: testCase.shouldFail ? 'HTTP 404 - User not found' : null,
        resultId: `result-${testCase.testCaseId}-${Date.now()}`,
        testSuiteId: 'suite-001',
        testSuiteName: 'User Management API Tests',
        
        // Enhanced assertion data
        assertionResults: assertions,
        assertionSummary: {
          total: totalAssertions,
          passed: passedAssertions,
          failed: failedAssertions,
          skipped: 0,
          successRate: Math.round((passedAssertions / totalAssertions) * 100)
        },
        // Legacy compatibility
        assertions: assertions.map((assertion, index) => ({
          id: index + 1,
          description: assertion.assertionName,
          status: assertion.status === 'PASSED' ? 'Passed' : 'Failed',
          error: assertion.error || null
        }))
      };
    });
  };

  const testCaseResults = generateTestCaseResults();
  
  // Calculate overall execution summary
  const totalTests = testCaseResults.length;
  const passedTests = testCaseResults.filter(tc => tc.executionStatus === 'PASSED').length;
  const failedTests = testCaseResults.filter(tc => tc.executionStatus === 'FAILED').length;
  const totalExecutionTime = testCaseResults.reduce((sum, tc) => sum + tc.executionTimeMs, 0);
  
  // Calculate overall assertion summary
  const totalAssertions = testCaseResults.reduce((sum, tc) => sum + tc.assertionSummary.total, 0);
  const passedAssertions = testCaseResults.reduce((sum, tc) => sum + tc.assertionSummary.passed, 0);
  const failedAssertions = testCaseResults.reduce((sum, tc) => sum + tc.assertionSummary.failed, 0);

  return {
    executionId: executionId,
    executionStatus: failedTests > 0 ? 'FAILED' : 'PASSED',
    executionDate: timestamp,
    executedBy: 'current.user',
    environmentName: environment,
    
    // Test case summary
    totalTests: totalTests,
    passed: passedTests,
    failed: failedTests,
    error: 0,
    successRate: Math.round((passedTests / totalTests) * 100),
    executionTimeMs: totalExecutionTime,
    
    // Enhanced assertion summary
    assertionSummary: {
      total: totalAssertions,
      passed: passedAssertions,
      failed: failedAssertions,
      skipped: 0,
      successRate: Math.round((passedAssertions / totalAssertions) * 100)
    },
    
    // Detailed test case results
    testCaseResult: testCaseResults,
    
    // Execution metadata
    selectedItem: selectedItem,
    settings: {
      environment: environment,
      stopOnFailure: false,
      notifyOnCompletion: true,
      retryCount: 1
    }
  };
};

// Mock assertion templates for demonstration
export const mockAssertionTemplates = [
  {
    id: 'template-api-health',
    name: 'API Health Check',
    description: 'Basic API health validation with status code and response time checks',
    category: 'health',
    assertions: [
      {
        name: 'Status Code 200',
        type: 'status_code',
        config: {
          target: 'response.status',
          operator: 'equals',
          expectedValue: '200'
        }
      },
      {
        name: 'Response Time < 2s',
        type: 'response_time',
        config: {
          target: 'execution.responseTime',
          operator: 'less_than',
          expectedValue: '2000'
        }
      }
    ]
  },
  {
    id: 'template-data-validation',
    name: 'Data Validation Suite', 
    description: 'Comprehensive data structure and content validation',
    category: 'validation',
    assertions: [
      {
        name: 'Response is JSON',
        type: 'header_validation',
        config: {
          target: 'response.headers.content-type',
          operator: 'contains',
          expectedValue: 'application/json'
        }
      },
      {
        name: 'Data field exists',
        type: 'json_path',
        config: {
          target: 'response.body.data',
          operator: 'exists'
        }
      },
      {
        name: 'Success flag is true',
        type: 'json_path',
        config: {
          target: 'response.body.success',
          operator: 'equals',
          expectedValue: 'true'
        }
      }
    ]
  },
  {
    id: 'template-user-api',
    name: 'User API Validation',
    description: 'Specific validations for user management endpoints',
    category: 'user',
    assertions: [
      {
        name: 'User ID exists',
        type: 'json_path',
        config: {
          target: 'response.body.data.id',
          operator: 'exists'
        }
      },
      {
        name: 'Email format validation',
        type: 'json_path',
        config: {
          target: 'response.body.data.email',
          operator: 'regex_match',
          expectedValue: '^[^@]+@[^@]+\\.[^@]+$'
        }
      },
      {
        name: 'Role is valid',
        type: 'json_path',
        config: {
          target: 'response.body.data.role',
          operator: 'contains',
          expectedValue: 'admin,user,guest'
        }
      }
    ]
  }
];

export default {
  createMockExecutionResult,
  mockAssertionTemplates
}; 
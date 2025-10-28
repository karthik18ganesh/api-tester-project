import { api } from '../../../utils/api';
import * as XLSX from 'xlsx';

// Mock delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock response generator
const generateMockResponse = (method, url, rowId) => {
  const responses = {
    GET: {
      status: 200,
      data: {
        id: `mock-${rowId}`,
        name: `Test User ${rowId}`,
        email: `user${rowId}@example.com`,
        createdAt: new Date().toISOString(),
      },
    },
    POST: {
      status: 201,
      data: {
        id: `created-${rowId}-${Date.now()}`,
        message: 'Resource created successfully',
        timestamp: new Date().toISOString(),
      },
    },
    PUT: {
      status: 200,
      data: {
        id: `updated-${rowId}`,
        message: 'Resource updated successfully',
        updatedAt: new Date().toISOString(),
      },
    },
    PATCH: {
      status: 200,
      data: {
        id: `patched-${rowId}`,
        message: 'Resource partially updated',
        patchedAt: new Date().toISOString(),
      },
    },
    DELETE: {
      status: 204,
      data: null,
    },
  };

  return responses[method] || responses.GET;
};

export const bulkExecutionService = {
  // NEW BULK ENDPOINT - Different from single test execution
  executeBulkTestCase: async (
    testCaseId,
    bulkData,
    executionSettings,
    testCaseInfo = null
  ) => {
    console.log('Executing bulk test case with:', {
      testCaseId,
      dataRows: bulkData.length,
      settings: executionSettings,
    });

    // Mock API call for bulk execution
    // In production, this would call: POST /api/v1/test-execution/bulk/{testCaseId}
    const MOCK_BULK_EXECUTION = true; // Toggle this when backend is ready

    if (MOCK_BULK_EXECUTION) {
      // Simulate processing time
      await delay(500);

      const results = [];
      const startTime = Date.now();
      for (let i = 0; i < bulkData.length; i++) {
        const dataRow = bulkData[i];

        // Simulate execution delay
        await delay(Math.random() * 200 + 100);

        try {
          // Use the test case's URL and method (passed from the test case)
          const testCaseUrl =
            testCaseInfo?.url || 'https://api.example.com/test-case-endpoint';
          const testCaseMethod = testCaseInfo?.method || 'POST';

          // Generate mock response
          const mockResponse = generateMockResponse(
            testCaseMethod,
            testCaseUrl,
            dataRow.Row_ID
          );

          // Simulate assertion execution
          let assertionResults = [];
          if (dataRow.Assertions) {
            try {
              const assertions = JSON.parse(dataRow.Assertions);
              assertionResults = assertions.map((assertion, idx) => ({
                assertionId: `assert-${dataRow.Row_ID}-${idx}`,
                assertionName: `${assertion.type}: ${assertion.expected || assertion.field || ''}`,
                status: Math.random() > 0.2 ? 'PASSED' : 'FAILED',
                actualValue: mockResponse.data,
                expectedValue: assertion.expected,
                executionTime: Math.floor(Math.random() * 50),
              }));
            } catch (e) {
              console.error('Error parsing Assertions:', e);
            }
          }

          const executionTime = Math.floor(Math.random() * 500 + 100);
          const allAssertionsPassed = assertionResults.every(
            (a) => a.status === 'PASSED'
          );

          results.push({
            rowId: dataRow.Row_ID,
            testName: dataRow.Test_Name || `Test ${dataRow.Row_ID}`,
            status: allAssertionsPassed ? 'PASSED' : 'FAILED',
            method: testCaseMethod,
            url: processedUrl,
            statusCode: mockResponse.status,
            executionTime: executionTime,
            response: mockResponse,
            assertionResults: assertionResults,
            assertionSummary: {
              total: assertionResults.length,
              passed: assertionResults.filter((a) => a.status === 'PASSED')
                .length,
              failed: assertionResults.filter((a) => a.status === 'FAILED')
                .length,
            },
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          results.push({
            rowId: dataRow.Row_ID,
            testName: dataRow.Test_Name || `Test ${dataRow.Row_ID}`,
            status: 'FAILED',
            error: error.message,
            executionTime: 0,
            assertionResults: [],
            assertionSummary: {
              total: 0,
              passed: 0,
              failed: 0,
            },
          });
        }
      }

      const endTime = Date.now();

      // Return mock bulk execution response
      return {
        executionId: `bulk-exec-${Date.now()}`,
        testCaseId: testCaseId,
        executionType: 'BULK', // Special identifier for bulk executions
        totalTests: bulkData.length,
        passed: results.filter((r) => r.status === 'PASSED').length,
        failed: results.filter((r) => r.status === 'FAILED').length,
        totalDuration: endTime - startTime,
        averageExecutionTime: Math.floor(
          (endTime - startTime) / bulkData.length
        ),
        results: results,
        environment: executionSettings.environment,
        executedBy: executionSettings.executedBy || 'current_user',
        timestamp: new Date().toISOString(),
      };
    } else {
      // Real API call when backend is ready
      return await api('/api/v1/test-execution/bulk/' + testCaseId, 'POST', {
        executionSettings,
        testData: bulkData,
      });
    }
  },

  // Download template
  downloadTemplate: () => {
    // Template generation logic - focused on test data variations
    const templateData = [
      {
        Row_ID: 1,
        Test_Name: 'Valid User Data',
        Headers:
          '{"Content-Type": "application/json", "Authorization": "Bearer {{token}}"}',
        Query_Params: '{"page": 1, "limit": 10}',
        Request_Body:
          '{"name": "John Doe", "email": "john@example.com", "age": 30}',
        Expected_Status: 200,
        Assertions:
          '[{"type": "status", "expected": 200}, {"type": "response_contains", "field": "data.name", "expected": "John Doe"}]',
        Environment: 'DEV',
        Timeout: 5000,
        Active: 'TRUE',
      },
      {
        Row_ID: 2,
        Test_Name: 'Invalid Email Format',
        Headers:
          '{"Content-Type": "application/json", "Authorization": "Bearer {{token}}"}',
        Query_Params: '{"page": 1, "limit": 10}',
        Request_Body:
          '{"name": "Jane Doe", "email": "invalid-email", "age": 25}',
        Expected_Status: 400,
        Assertions:
          '[{"type": "status", "expected": 400}, {"type": "response_contains", "field": "error.message", "expected": "Invalid email format"}]',
        Environment: 'DEV',
        Timeout: 5000,
        Active: 'TRUE',
      },
      {
        Row_ID: 3,
        Test_Name: 'Missing Required Field',
        Headers:
          '{"Content-Type": "application/json", "Authorization": "Bearer {{token}}"}',
        Query_Params: '{"page": 1, "limit": 10}',
        Request_Body: '{"email": "test@example.com", "age": 28}',
        Expected_Status: 400,
        Assertions:
          '[{"type": "status", "expected": 400}, {"type": "response_contains", "field": "error.message", "expected": "Name is required"}]',
        Environment: 'DEV',
        Timeout: 5000,
        Active: 'TRUE',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TestData');
    XLSX.writeFile(wb, 'Bulk_Test_Data_Template.xlsx');
  },

  // Generate and download results report
  downloadBulkResults: (results, format = 'excel') => {
    if (format === 'excel') {
      const summaryData = [
        { Metric: 'Execution ID', Value: results.executionId },
        { Metric: 'Test Case ID', Value: results.testCaseId },
        { Metric: 'Total Tests', Value: results.totalTests },
        { Metric: 'Passed', Value: results.passed },
        { Metric: 'Failed', Value: results.failed },
        {
          Metric: 'Success Rate',
          Value: `${((results.passed / results.totalTests) * 100).toFixed(2)}%`,
        },
        {
          Metric: 'Total Duration',
          Value: `${(results.totalDuration / 1000).toFixed(2)}s`,
        },
        { Metric: 'Average Time', Value: `${results.averageExecutionTime}ms` },
        { Metric: 'Environment', Value: results.environment },
        { Metric: 'Executed By', Value: results.executedBy },
        { Metric: 'Timestamp', Value: results.timestamp },
      ];

      const detailsData = results.results.map((r) => ({
        'Row ID': r.rowId,
        'Test Name': r.testName,
        Status: r.status,
        Method: r.method,
        URL: r.url,
        'Status Code': r.statusCode || 'N/A',
        'Execution Time (ms)': r.executionTime,
        'Assertions Total': r.assertionSummary?.total || 0,
        'Assertions Passed': r.assertionSummary?.passed || 0,
        'Assertions Failed': r.assertionSummary?.failed || 0,
        Error: r.error || '',
      }));

      const wb = XLSX.utils.book_new();

      // Summary sheet
      const ws_summary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws_summary, 'Summary');

      // Details sheet
      const ws_details = XLSX.utils.json_to_sheet(detailsData);
      XLSX.utils.book_append_sheet(wb, ws_details, 'Test Results');

      XLSX.writeFile(wb, `bulk_execution_results_${results.executionId}.xlsx`);
    }
  },
};

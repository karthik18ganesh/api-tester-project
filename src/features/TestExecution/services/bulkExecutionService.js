import { testExecution } from '../../../utils/api';
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
  // NEW BULK ENDPOINT - Calls backend when available, falls back to mock
  executeBulkTestCase: async (
    testCaseId,
    bulkData,
    executionSettings,
    testCaseInfo = null,
    { signal } = {}
  ) => {
    console.log('Executing bulk test case with:', {
      testCaseId,
      dataRows: bulkData.length,
      settings: executionSettings,
    });

    // Try real API first; if it fails with network/404, fallback to mock
    const MOCK_BULK_EXECUTION = false;

    const toBulkRequestPayload = (rows) => {
      const mapBool = (v) => v === true || v === 'TRUE';
      return {
        executionSettings: {
          environment: executionSettings.environment,
          executionStrategy:
            executionSettings.executionStrategy?.toUpperCase?.() ||
            'SEQUENTIAL',
          executedBy: executionSettings.executedBy,
          ...(executionSettings.maxConcurrency && {
            maxConcurrency: executionSettings.maxConcurrency,
          }),
          ...(executionSettings.globalTimeout && {
            globalTimeout: executionSettings.globalTimeout,
          }),
          ...(executionSettings.stopOnFailure !== undefined && {
            stopOnFailure: executionSettings.stopOnFailure,
          }),
          ...(executionSettings.enableVariableSharing !== undefined && {
            enableVariableSharing: executionSettings.enableVariableSharing,
          }),
        },
        testData: rows.map((r) => ({
          rowId: String(r.Row_ID),
          testName: r.Test_Name,
          headers: r.Headers,
          queryParams: r.Query_Params,
          requestBody: r.Request_Body,
          expectedStatus: r.Expected_Status
            ? Number(r.Expected_Status)
            : undefined,
          assertions: r.Assertions,
          environment: r.Environment,
          timeout: r.Timeout ? Number(r.Timeout) : undefined,
          active: r.Active !== undefined ? mapBool(r.Active) : true,
          variables: r.Variables || undefined,
        })),
      };
    };

    try {
      const payload = toBulkRequestPayload(bulkData);
      const response = await testExecution.executeBulkTestCase(
        String(testCaseId).replace('case-', ''),
        payload,
        { signal }
      );

      // Backend returns BaseResponse; normalize
      const base = response;
      const metaRef = base?.responseMetaData?.referenceId;
      if (base?.result?.code !== 'SUCCESS') {
        const message = base?.result?.message || 'Bulk execution failed';
        const error = new Error(message);
        error.code = base?.result?.code;
        throw error;
      }

      const data = base.result.data;
      return {
        ...data,
        referenceId: metaRef,
      };
    } catch (e) {
      if (!MOCK_BULK_EXECUTION) {
        console.warn(
          'Bulk API not available, using mock. Reason:',
          e?.message || e
        );
      }
    }

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
      // Legacy mock fallback
      return {
        executionId: `bulk-exec-${Date.now()}`,
        testCaseId: testCaseId,
        executionType: 'BULK',
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

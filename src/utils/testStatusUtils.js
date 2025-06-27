// Utility functions for handling test status display

/**
 * Get display status for a test case based on assertions and HTTP response
 * This is a frontend-only display logic that doesn't change the underlying data
 */
export const getTestCaseDisplayStatus = (testCase) => {
  // Check if test case has any assertions
  const hasAssertions = (testCase.assertionResults && testCase.assertionResults.length > 0) ||
                       (testCase.assertions && testCase.assertions.length > 0) ||
                       (testCase.assertionSummary && testCase.assertionSummary.total > 0);

  // If has assertions, use the original status
  if (hasAssertions) {
    return {
      status: testCase.status,
      displayText: testCase.status,
      isExecutedWithoutAssertions: false
    };
  }

  // If no assertions, check HTTP status for successful execution
  const httpStatus = testCase.statusCode || testCase.response?.status;
  const isSuccessfulExecution = httpStatus >= 200 && httpStatus < 400;
  
  if (isSuccessfulExecution) {
    return {
      status: testCase.status, // Keep original status for data consistency
      displayText: 'Executed',
      isExecutedWithoutAssertions: true
    };
  }

  // For failed HTTP status or other cases, keep original status
  return {
    status: testCase.status,
    displayText: testCase.status,
    isExecutedWithoutAssertions: false
  };
};

/**
 * Get status badge styling based on display status
 */
export const getStatusBadgeClass = (displayStatus) => {
  const { displayText, isExecutedWithoutAssertions } = displayStatus;
  
  if (isExecutedWithoutAssertions) {
    return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
  
  switch (displayText) {
    case 'Passed':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'Failed':
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

/**
 * Get status icon based on display status
 */
export const getStatusIcon = (displayStatus) => {
  const { displayText, isExecutedWithoutAssertions } = displayStatus;
  
  if (isExecutedWithoutAssertions) {
    return 'FaCheck'; // Use check icon but blue color
  }
  
  switch (displayText) {
    case 'Passed':
      return 'FaCheck';
    case 'Failed':
      return 'FaTimes';
    default:
      return 'FaCircle';
  }
};

/**
 * Get subtitle text for test cases without assertions
 */
export const getAssertionSubtitle = (testCase) => {
  const hasAssertions = (testCase.assertionResults && testCase.assertionResults.length > 0) ||
                       (testCase.assertions && testCase.assertions.length > 0) ||
                       (testCase.assertionSummary && testCase.assertionSummary.total > 0);

  if (!hasAssertions) {
    return 'No assertions created';
  }
  
  if (testCase.assertionSummary) {
    return `${testCase.assertionSummary.passed}/${testCase.assertionSummary.total} assertions passed`;
  }
  
  if (testCase.assertions) {
    const passed = testCase.assertions.filter(a => a.status === 'Passed').length;
    return `${passed}/${testCase.assertions.length} assertions passed`;
  }
  
  return '';
}; 
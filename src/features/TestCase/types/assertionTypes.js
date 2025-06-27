// Assertion types enumeration - Updated to match backend enum
export const AssertionTypes = {
  STATUS_CODE: 'STATUS_CODE',
  RESPONSE_TIME: 'RESPONSE_TIME',
  JSON_PATH: 'JSON_PATH',
  CONTAINS: 'CONTAINS',
  REGEX: 'REGEX',
  HEADER_VALIDATION: 'HEADER_VALIDATION',
  CONTENT_TYPE: 'CONTENT_TYPE',
  RESPONSE_SIZE: 'RESPONSE_SIZE',
  CUSTOM_SCRIPT: 'CUSTOM_SCRIPT'
};

// Assertion operators - Updated to match backend enum
export const AssertionOperators = {
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  CONTAINS: 'CONTAINS',
  NOT_CONTAINS: 'NOT_CONTAINS',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
  REGEX_MATCH: 'REGEX_MATCH',
  EXISTS: 'EXISTS',
  NOT_EXISTS: 'NOT_EXISTS',
  IS_EMPTY: 'IS_EMPTY',
  IS_NOT_EMPTY: 'IS_NOT_EMPTY'
};

// Assertion configuration schema
export const createAssertionConfig = ({
  target = '',
  operator = AssertionOperators.EQUALS,
  expectedValue = '',
  caseSensitive = false,
  customMessage = '',
  timeout = 5000,
  retryCount = 0
} = {}) => ({
  target,
  operator,
  expectedValue,
  caseSensitive,
  customMessage,
  timeout,
  retryCount
});

// Complete assertion schema
export const createAssertion = ({
  id = null,
  testCaseId = null,
  name = '',
  description = '',
  type = AssertionTypes.JSON_PATH,
  isEnabled = true,
  priority = 1,
  config = createAssertionConfig(),
  createdBy = null,
  createdAt = null,
  updatedAt = null
} = {}) => ({
  id,
  testCaseId,
  name,
  description,
  type,
  isEnabled,
  priority,
  config,
  createdBy,
  createdAt,
  updatedAt
});

// Assertion execution result schema
export const createAssertionResult = ({
  id = null,
  assertionId = null,
  name = '',
  type = '',
  status = 'PENDING', // PENDING, PASSED, FAILED, SKIPPED, ERROR
  actualValue = null,
  expectedValue = null,
  executionTime = 0,
  error = null,
  details = null,
  path = null
} = {}) => ({
  id,
  assertionId,
  name,
  type,
  status,
  actualValue,
  expectedValue,
  executionTime,
  error,
  details,
  path
});

// Assertion templates for common use cases
export const AssertionTemplates = {
  API_HEALTH_CHECK: {
    name: 'API Health Check',
    description: 'Basic API health validation',
    assertions: [
      {
        name: 'Status Code 200',
        type: AssertionTypes.STATUS_CODE,
        config: createAssertionConfig({
          target: 'response.status',
          operator: AssertionOperators.EQUALS,
          expectedValue: '200'
        })
      },
      {
        name: 'Response Time < 2s',
        type: AssertionTypes.RESPONSE_TIME,
        config: createAssertionConfig({
          target: 'execution.responseTime',
          operator: AssertionOperators.LESS_THAN,
          expectedValue: '2000'
        })
      }
    ]
  },
  JSON_RESPONSE_VALIDATION: {
    name: 'JSON Response Validation',
    description: 'Validate JSON response structure and data',
    assertions: [
      {
        name: 'Response is JSON',
        type: AssertionTypes.HEADER_VALIDATION,
        config: createAssertionConfig({
          target: 'response.headers.content-type',
          operator: AssertionOperators.CONTAINS,
          expectedValue: 'application/json'
        })
      },
      {
        name: 'Data exists',
        type: AssertionTypes.JSON_PATH,
        config: createAssertionConfig({
          target: 'response.body.data',
          operator: AssertionOperators.EXISTS
        })
      }
    ]
  },
  USER_DATA_VALIDATION: {
    name: 'User Data Validation',
    description: 'Validate user-related API responses',
    assertions: [
      {
        name: 'User ID exists',
        type: AssertionTypes.JSON_PATH,
        config: createAssertionConfig({
          target: 'response.body.data.id',
          operator: AssertionOperators.EXISTS
        })
      },
      {
        name: 'Email format validation',
        type: AssertionTypes.JSON_PATH,
        config: createAssertionConfig({
          target: 'response.body.data.email',
          operator: AssertionOperators.REGEX_MATCH,
          expectedValue: '^[^@]+@[^@]+\\.[^@]+$'
        })
      }
    ]
  }
};

// Helper functions for assertion type metadata
export const getAssertionTypeInfo = (type) => {
  const typeInfo = {
    [AssertionTypes.STATUS_CODE]: {
      label: 'Status Code',
      description: 'Validate HTTP response status code',
      icon: 'SC',
      targetPlaceholder: 'response.status',
      supportedOperators: [
        AssertionOperators.EQUALS,
        AssertionOperators.NOT_EQUALS,
        AssertionOperators.GREATER_THAN,
        AssertionOperators.LESS_THAN
      ]
    },
    [AssertionTypes.RESPONSE_TIME]: {
      label: 'Response Time',
      description: 'Validate API response time',
      icon: 'RT',
      targetPlaceholder: 'execution.responseTime',
      supportedOperators: [
        AssertionOperators.LESS_THAN,
        AssertionOperators.GREATER_THAN,
        AssertionOperators.LESS_THAN_OR_EQUAL,
        AssertionOperators.GREATER_THAN_OR_EQUAL
      ]
    },
    [AssertionTypes.JSON_PATH]: {
      label: 'JSON Path',
      description: 'Validate specific JSON response values',
      icon: 'JP',
      targetPlaceholder: 'response.body.data.field',
      supportedOperators: Object.values(AssertionOperators)
    },
    [AssertionTypes.CONTAINS]: {
      label: 'Contains Text',
      description: 'Check if response contains specific text',
      icon: 'CT',
      targetPlaceholder: 'response.body',
      supportedOperators: [
        AssertionOperators.CONTAINS,
        AssertionOperators.NOT_CONTAINS
      ]
    },
    [AssertionTypes.HEADER_VALIDATION]: {
      label: 'Header Validation',
      description: 'Validate HTTP response headers',
      icon: 'HV',
      targetPlaceholder: 'response.headers.content-type',
      supportedOperators: [
        AssertionOperators.EQUALS,
        AssertionOperators.CONTAINS,
        AssertionOperators.EXISTS,
        AssertionOperators.NOT_EXISTS
      ]
    },
    [AssertionTypes.REGEX]: {
      label: 'Regular Expression',
      description: 'Validate using regular expressions',
      icon: 'RX',
      targetPlaceholder: 'response.body.field',
      supportedOperators: [
        AssertionOperators.REGEX_MATCH
      ]
    }
  };

  return typeInfo[type] || {
    label: type,
    description: 'Custom assertion type',
    icon: 'CA',
    targetPlaceholder: '',
    supportedOperators: [AssertionOperators.EQUALS]
  };
};

// Validation functions
export const validateAssertion = (assertion) => {
  const errors = [];

  if (!assertion.name?.trim()) {
    errors.push('Assertion name is required');
  }

  if (!assertion.type) {
    errors.push('Assertion type is required');
  }

  if (!assertion.config?.target?.trim() && assertion.type !== AssertionTypes.RESPONSE_TIME) {
    errors.push('Target path is required');
  }

  if (!assertion.config?.operator) {
    errors.push('Operator is required');
  }

  // Type-specific validations
  if (assertion.type === AssertionTypes.REGEX && !assertion.config?.expectedValue) {
    errors.push('Regular expression pattern is required');
  }

  if (assertion.type === AssertionTypes.RESPONSE_TIME && 
      !assertion.config?.expectedValue && 
      ![AssertionOperators.EXISTS, AssertionOperators.NOT_EXISTS].includes(assertion.config?.operator)) {
    errors.push('Expected value is required for response time assertions');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 
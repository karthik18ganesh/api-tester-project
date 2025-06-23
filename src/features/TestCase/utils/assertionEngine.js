import { AssertionTypes, AssertionOperators, createAssertionResult } from '../types/assertionTypes';
import { nanoid } from 'nanoid';

/**
 * JSON Path utility for extracting values from nested objects
 */
export class JSONPath {
  static getValue(obj, path) {
    if (!path || !obj) return undefined;
    
    try {
      // Handle special case paths
      if (path === 'response') return obj;
      if (path === 'response.status') return obj.status;
      if (path === 'response.body') return obj.data || obj.body;
      if (path === 'response.headers') return obj.headers;
      
      // Parse JSON path
      const keys = path.replace(/^response\./, '').split('.');
      let current = obj;
      
      for (const key of keys) {
        if (current === null || current === undefined) return undefined;
        
        // Handle array indices
        if (key.includes('[') && key.includes(']')) {
          const [arrayKey, indexStr] = key.split('[');
          const index = parseInt(indexStr.replace(']', ''));
          
          if (arrayKey) current = current[arrayKey];
          if (Array.isArray(current) && !isNaN(index)) {
            current = current[index];
          }
        } else {
          current = current[key];
        }
      }
      
      return current;
    } catch (error) {
      console.error('JSONPath evaluation error:', error);
      return undefined;
    }
  }

  static exists(obj, path) {
    const value = this.getValue(obj, path);
    return value !== undefined && value !== null;
  }
}

/**
 * Assertion evaluator functions for different operators
 */
export class AssertionEvaluator {
  static evaluate(actualValue, operator, expectedValue, caseSensitive = false) {
    // Convert values for comparison
    const actual = caseSensitive ? actualValue : String(actualValue || '').toLowerCase();
    const expected = caseSensitive ? expectedValue : String(expectedValue || '').toLowerCase();
    
    switch (operator) {
      case AssertionOperators.EQUALS:
        return actual === expected;
        
      case AssertionOperators.NOT_EQUALS:
        return actual !== expected;
        
      case AssertionOperators.CONTAINS:
        return String(actual).includes(String(expected));
        
      case AssertionOperators.NOT_CONTAINS:
        return !String(actual).includes(String(expected));
        
      case AssertionOperators.STARTS_WITH:
        return String(actual).startsWith(String(expected));
        
      case AssertionOperators.ENDS_WITH:
        return String(actual).endsWith(String(expected));
        
      case AssertionOperators.GREATER_THAN:
        return Number(actualValue) > Number(expectedValue);
        
      case AssertionOperators.LESS_THAN:
        return Number(actualValue) < Number(expectedValue);
        
      case AssertionOperators.GREATER_THAN_OR_EQUAL:
        return Number(actualValue) >= Number(expectedValue);
        
      case AssertionOperators.LESS_THAN_OR_EQUAL:
        return Number(actualValue) <= Number(expectedValue);
        
      case AssertionOperators.REGEX_MATCH:
        try {
          const regex = new RegExp(expectedValue);
          return regex.test(String(actualValue));
        } catch (error) {
          throw new Error(`Invalid regex pattern: ${expectedValue}`);
        }
        
      case AssertionOperators.EXISTS:
        return actualValue !== undefined && actualValue !== null;
        
      case AssertionOperators.NOT_EXISTS:
        return actualValue === undefined || actualValue === null;
        
      case AssertionOperators.IS_EMPTY:
        return !actualValue || 
               (Array.isArray(actualValue) && actualValue.length === 0) ||
               (typeof actualValue === 'object' && Object.keys(actualValue).length === 0) ||
               String(actualValue).trim() === '';
        
      case AssertionOperators.IS_NOT_EMPTY:
        return actualValue && 
               !(Array.isArray(actualValue) && actualValue.length === 0) &&
               !(typeof actualValue === 'object' && Object.keys(actualValue).length === 0) &&
               String(actualValue).trim() !== '';
        
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}

/**
 * Individual assertion type executors
 */
export class AssertionExecutors {
  static executeStatusCodeAssertion(assertion, response, executionContext) {
    const { config } = assertion;
    const actualStatus = response.status;
    const expectedStatus = config.expectedValue;
    
    const passed = AssertionEvaluator.evaluate(
      actualStatus, 
      config.operator, 
      expectedStatus
    );
    
    return createAssertionResult({
      id: nanoid(),
      assertionId: assertion.id,
      name: assertion.name,
      type: assertion.type,
      status: passed ? 'PASSED' : 'FAILED',
      actualValue: actualStatus,
      expectedValue: expectedStatus,
      path: 'response.status',
      error: passed ? null : `Expected status ${config.operator} ${expectedStatus}, but got ${actualStatus}`
    });
  }

  static executeResponseTimeAssertion(assertion, response, executionContext) {
    const { config } = assertion;
    const actualTime = executionContext.responseTime || executionContext.executionTimeMs || 0;
    const expectedTime = Number(config.expectedValue);
    
    const passed = AssertionEvaluator.evaluate(
      actualTime, 
      config.operator, 
      expectedTime
    );
    
    return createAssertionResult({
      id: nanoid(),
      assertionId: assertion.id,
      name: assertion.name,
      type: assertion.type,
      status: passed ? 'PASSED' : 'FAILED',
      actualValue: `${actualTime}ms`,
      expectedValue: `${expectedTime}ms`,
      path: 'execution.responseTime',
      error: passed ? null : `Expected response time ${config.operator} ${expectedTime}ms, but got ${actualTime}ms`
    });
  }

  static executeJsonPathAssertion(assertion, response, executionContext) {
    const { config } = assertion;
    
    try {
      const actualValue = JSONPath.getValue(response, config.target);
      
      // Special handling for EXISTS/NOT_EXISTS operators
      if (config.operator === AssertionOperators.EXISTS) {
        const exists = JSONPath.exists(response, config.target);
        return createAssertionResult({
          id: nanoid(),
          assertionId: assertion.id,
          name: assertion.name,
          type: assertion.type,
          status: exists ? 'PASSED' : 'FAILED',
          actualValue: exists ? 'exists' : 'not found',
          expectedValue: 'exists',
          path: config.target,
          error: exists ? null : `Path '${config.target}' does not exist in response`
        });
      }
      
      if (config.operator === AssertionOperators.NOT_EXISTS) {
        const exists = JSONPath.exists(response, config.target);
        return createAssertionResult({
          id: nanoid(),
          assertionId: assertion.id,
          name: assertion.name,
          type: assertion.type,
          status: !exists ? 'PASSED' : 'FAILED',
          actualValue: exists ? 'exists' : 'not found',
          expectedValue: 'not exists',
          path: config.target,
          error: !exists ? null : `Path '${config.target}' exists but should not`
        });
      }
      
      // For other operators, check if path exists first
      if (!JSONPath.exists(response, config.target)) {
        return createAssertionResult({
          id: nanoid(),
          assertionId: assertion.id,
          name: assertion.name,
          type: assertion.type,
          status: 'FAILED',
          actualValue: 'not found',
          expectedValue: config.expectedValue,
          path: config.target,
          error: `Path '${config.target}' does not exist in response`
        });
      }
      
      const passed = AssertionEvaluator.evaluate(
        actualValue, 
        config.operator, 
        config.expectedValue,
        config.caseSensitive
      );
      
      return createAssertionResult({
        id: nanoid(),
        assertionId: assertion.id,
        name: assertion.name,
        type: assertion.type,
        status: passed ? 'PASSED' : 'FAILED',
        actualValue: actualValue,
        expectedValue: config.expectedValue,
        path: config.target,
        error: passed ? null : this.generateErrorMessage(actualValue, config)
      });
      
    } catch (error) {
      return createAssertionResult({
        id: nanoid(),
        assertionId: assertion.id,
        name: assertion.name,
        type: assertion.type,
        status: 'ERROR',
        actualValue: null,
        expectedValue: config.expectedValue,
        path: config.target,
        error: `Assertion execution error: ${error.message}`
      });
    }
  }

  static executeHeaderValidation(assertion, response, executionContext) {
    const { config } = assertion;
    
    try {
      const headers = response.headers || {};
      const headerName = config.target.replace('response.headers.', '');
      const actualValue = headers[headerName] || headers[headerName.toLowerCase()];
      
      if (config.operator === AssertionOperators.EXISTS) {
        const exists = actualValue !== undefined;
        return createAssertionResult({
          id: nanoid(),
          assertionId: assertion.id,
          name: assertion.name,
          type: assertion.type,
          status: exists ? 'PASSED' : 'FAILED',
          actualValue: exists ? actualValue : 'not found',
          expectedValue: 'exists',
          path: config.target,
          error: exists ? null : `Header '${headerName}' does not exist`
        });
      }
      
      const passed = AssertionEvaluator.evaluate(
        actualValue, 
        config.operator, 
        config.expectedValue,
        config.caseSensitive
      );
      
      return createAssertionResult({
        id: nanoid(),
        assertionId: assertion.id,
        name: assertion.name,
        type: assertion.type,
        status: passed ? 'PASSED' : 'FAILED',
        actualValue: actualValue || 'not found',
        expectedValue: config.expectedValue,
        path: config.target,
        error: passed ? null : this.generateErrorMessage(actualValue, config)
      });
      
    } catch (error) {
      return createAssertionResult({
        id: nanoid(),
        assertionId: assertion.id,
        name: assertion.name,
        type: assertion.type,
        status: 'ERROR',
        actualValue: null,
        expectedValue: config.expectedValue,
        path: config.target,
        error: `Header validation error: ${error.message}`
      });
    }
  }

  static executeContainsAssertion(assertion, response, executionContext) {
    const { config } = assertion;
    
    try {
      let actualValue;
      
      if (config.target === 'response.body' || config.target === 'response') {
        actualValue = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      } else {
        actualValue = JSONPath.getValue(response, config.target);
      }
      
      const passed = AssertionEvaluator.evaluate(
        actualValue, 
        AssertionOperators.CONTAINS, 
        config.expectedValue,
        config.caseSensitive
      );
      
      return createAssertionResult({
        id: nanoid(),
        assertionId: assertion.id,
        name: assertion.name,
        type: assertion.type,
        status: passed ? 'PASSED' : 'FAILED',
        actualValue: actualValue,
        expectedValue: config.expectedValue,
        path: config.target,
        error: passed ? null : `Expected to contain '${config.expectedValue}' but was '${actualValue}'`
      });
      
    } catch (error) {
      return createAssertionResult({
        id: nanoid(),
        assertionId: assertion.id,
        name: assertion.name,
        type: assertion.type,
        status: 'ERROR',
        actualValue: null,
        expectedValue: config.expectedValue,
        path: config.target,
        error: `Contains assertion error: ${error.message}`
      });
    }
  }

  static generateErrorMessage(actualValue, config) {
    const { operator, expectedValue } = config;
    
    switch (operator) {
      case AssertionOperators.EQUALS:
        return `Expected '${expectedValue}' but was '${actualValue}'`;
      case AssertionOperators.NOT_EQUALS:
        return `Expected not to equal '${expectedValue}' but was '${actualValue}'`;
      case AssertionOperators.CONTAINS:
        return `Expected to contain '${expectedValue}' but was '${actualValue}'`;
      case AssertionOperators.NOT_CONTAINS:
        return `Expected not to contain '${expectedValue}' but was '${actualValue}'`;
      case AssertionOperators.GREATER_THAN:
        return `Expected greater than ${expectedValue} but was ${actualValue}`;
      case AssertionOperators.LESS_THAN:
        return `Expected less than ${expectedValue} but was ${actualValue}`;
      case AssertionOperators.REGEX_MATCH:
        return `Expected to match pattern '${expectedValue}' but was '${actualValue}'`;
      default:
        return `Assertion failed: expected ${operator} '${expectedValue}' but was '${actualValue}'`;
    }
  }
}

/**
 * Main assertion engine
 */
export class AssertionEngine {
  static async executeAssertion(assertion, response, executionContext = {}) {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (assertion.type) {
        case AssertionTypes.STATUS_CODE:
          result = AssertionExecutors.executeStatusCodeAssertion(assertion, response, executionContext);
          break;
          
        case AssertionTypes.RESPONSE_TIME:
          result = AssertionExecutors.executeResponseTimeAssertion(assertion, response, executionContext);
          break;
          
        case AssertionTypes.JSON_PATH:
          result = AssertionExecutors.executeJsonPathAssertion(assertion, response, executionContext);
          break;
          
        case AssertionTypes.HEADER_VALIDATION:
          result = AssertionExecutors.executeHeaderValidation(assertion, response, executionContext);
          break;
          
        case AssertionTypes.CONTAINS:
          result = AssertionExecutors.executeContainsAssertion(assertion, response, executionContext);
          break;
          
        default:
          result = createAssertionResult({
            id: nanoid(),
            assertionId: assertion.id,
            name: assertion.name,
            type: assertion.type,
            status: 'ERROR',
            error: `Unsupported assertion type: ${assertion.type}`
          });
      }
      
      result.executionTime = Date.now() - startTime;
      return result;
      
    } catch (error) {
      return createAssertionResult({
        id: nanoid(),
        assertionId: assertion.id,
        name: assertion.name,
        type: assertion.type,
        status: 'ERROR',
        executionTime: Date.now() - startTime,
        error: `Assertion execution error: ${error.message}`
      });
    }
  }

  static async executeAssertions(assertions, response, executionContext = {}) {
    const results = [];
    
    // Sort by priority
    const sortedAssertions = [...assertions]
      .filter(a => a.isEnabled)
      .sort((a, b) => (a.priority || 1) - (b.priority || 1));
    
    for (const assertion of sortedAssertions) {
      const result = await this.executeAssertion(assertion, response, executionContext);
      results.push(result);
      
      // If assertion failed and has stopOnFailure configured, stop execution
      if (result.status === 'FAILED' && assertion.stopOnFailure) {
        break;
      }
    }
    
    return results;
  }

  static calculateAssertionSummary(assertionResults) {
    const summary = {
      total: assertionResults.length,
      passed: 0,
      failed: 0,
      errors: 0,
      skipped: 0,
      successRate: 0,
      totalExecutionTime: 0
    };
    
    assertionResults.forEach(result => {
      switch (result.status) {
        case 'PASSED':
          summary.passed++;
          break;
        case 'FAILED':
          summary.failed++;
          break;
        case 'ERROR':
          summary.errors++;
          break;
        case 'SKIPPED':
          summary.skipped++;
          break;
      }
      
      summary.totalExecutionTime += result.executionTime || 0;
    });
    
    if (summary.total > 0) {
      summary.successRate = Math.round((summary.passed / summary.total) * 100);
    }
    
    return summary;
  }
} 
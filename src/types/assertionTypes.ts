// Assertion status enum
export type AssertionStatus = 'PASSED' | 'FAILED' | 'ERROR' | 'SKIPPED';

// Assertion execution result interface
export interface AssertionResult {
  assertionId: string;
  assertionName: string;
  status: AssertionStatus;
  actualValue?: any;
  expectedValue?: any;
  executionTime: number;
  path?: string;
  type?: string;
  error?: string;
  testCaseId?: string;
  testCaseName?: string;
}

// Assertion summary interface
export interface AssertionSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  successRate?: number;
  }

// Test execution with assertion support
export interface TestExecutionResult {
  executionId: string;
  executionStatus: 'PASSED' | 'FAILED' | 'ERROR';
  executionDate: string;
  executedBy: string;
  environmentName: string;
  totalTests: number;
  passed: number;
  failed: number;
  assertionSummary?: AssertionSummary;
  testCaseResults: TestCaseResult[];
}

// Test case result with assertions
export interface TestCaseResult {
  testCaseId: string;
  testCaseName: string;
  executionStatus: 'PASSED' | 'FAILED' | 'ERROR';
  statusCode: number;
  executionTimeMs: number;
  httpMethod: string;
  url: string;
  requestHeaders?: Record<string, any>;
  requestBody?: any;
  responseHeaders?: Record<string, any>;
  responseBody?: any;
  errorMessage?: string;
  assertionResults?: AssertionResult[];
  assertionSummary?: AssertionSummary;
}

// Enhanced execution history entry
export interface ExecutionHistoryEntry {
  id: string;
  executionId: string;
  status: 'Passed' | 'Failed';
  passedFailed: string;
  executedAt: string;
  executedBy: string;
  date: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  successRate: number;
  executionTime: number;
  environmentName: string;
  testCaseResults: any[];
  assertionSummary?: AssertionSummary;
  rawData?: any;
}

// Component props interfaces
export interface AssertionSummaryCardProps {
  summary: AssertionSummary | null;
  showDetails?: boolean;
  onToggleDetails?: (expanded: boolean) => void;
  executionTime?: number;
  compact?: boolean;
}

export interface AssertionResultsListProps {
  results: AssertionResult[];
  groupBy?: 'status' | 'testCase' | null;
  showExecutionTime?: boolean;
  compact?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
}

export interface AssertionResultsViewProps {
  assertions: AssertionResult[];
  summary?: AssertionSummary | null;
  compact?: boolean;
}

// Filter and sort options
export type AssertionFilterStatus = 'all' | 'PASSED' | 'FAILED' | 'ERROR' | 'SKIPPED';
export type AssertionSortField = 'name' | 'status' | 'executionTime';
export type SortOrder = 'asc' | 'desc';

// API response interfaces
export interface AssertionExecutionResponse {
  executionId: string;
  assertionResults: AssertionResult[];
  assertionSummary: AssertionSummary;
}

export interface ExecutionDetailsResponse extends TestExecutionResult {
  assertionSummary: AssertionSummary;
  testCaseResults: TestCaseResult[];
}

// Legacy compatibility interfaces
export interface LegacyAssertion {
  id: number;
  description: string;
  status: 'Passed' | 'Failed';
  error?: string;
}

export interface LegacyTestCaseResult {
  id: string;
  name: string;
  status: 'Passed' | 'Failed';
  duration: string;
  assertions: LegacyAssertion[];
  assertionResults?: AssertionResult[];
  assertionSummary?: AssertionSummary;
}

// Utility type guards
export const isAssertionResult = (obj: any): obj is AssertionResult => {
  return obj && 
         typeof obj.assertionId === 'string' && 
         typeof obj.assertionName === 'string' && 
         ['PASSED', 'FAILED', 'ERROR', 'SKIPPED'].includes(obj.status);
};

export const isAssertionSummary = (obj: any): obj is AssertionSummary => {
  return obj && 
         typeof obj.total === 'number' && 
         typeof obj.passed === 'number' && 
         typeof obj.failed === 'number' && 
         typeof obj.skipped === 'number';
};

// Helper functions
export const calculateAssertionSuccessRate = (summary: AssertionSummary): number => {
  return summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
};

export const getAssertionStatusColor = (status: AssertionStatus): string => {
  switch (status) {
    case 'PASSED':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'FAILED':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'ERROR':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'SKIPPED':
      return 'text-gray-700 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

export const getAssertionStatusIcon = (status: AssertionStatus): string => {
  switch (status) {
    case 'PASSED':
      return 'FiCheck';
    case 'FAILED':
      return 'FiX';
    case 'ERROR':
      return 'FiAlertTriangle';
    case 'SKIPPED':
      return 'FiSkipForward';
    default:
      return 'FiClock';
  }
}; 
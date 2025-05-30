import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useWebVitals } from '../../utils/performance';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary, errorInfo }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
              Something went wrong
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-red-700">
            We apologize for the inconvenience. The application encountered an unexpected error.
          </p>
          
          {isDevelopment && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-600">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded border-l-4 border-red-400">
                <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-auto max-h-40">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                  {errorInfo && '\n\nComponent Stack:\n' + errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reload Page
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Error ID: {Date.now().toString(36)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Error logging function
const logError = (error, errorInfo, errorId) => {
  const errorData = {
    errorId,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: localStorage.getItem('userId') || 'anonymous',
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Boundary]', errorData);
  }

  // Send to error reporting service in production
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ERROR_REPORTING_URL) {
    fetch(process.env.REACT_APP_ERROR_REPORTING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    }).catch((reportingError) => {
      console.error('Failed to report error:', reportingError);
    });
  }
};

// Main Error Boundary component
export const ErrorBoundary = ({ children, fallback: CustomFallback, onError }) => {
  // Monitor Web Vitals on error
  useWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals in Error Boundary]', metric);
    }
  });

  const handleError = (error, errorInfo) => {
    const errorId = Date.now().toString(36);
    
    // Log the error
    logError(error, errorInfo, errorId);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={CustomFallback || ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Clear any error-related state
        window.location.hash = '';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Specific error boundaries for different sections
export const APIErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                API Component Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There was an error loading the API data. Please try again.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={resetErrorBoundary}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export const TestExecutionErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Test Execution Error
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>There was an error during test execution. The test may be incomplete.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={resetErrorBoundary}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm hover:bg-yellow-200"
                >
                  Retry Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary; 
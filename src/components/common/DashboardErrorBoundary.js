import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { Button, Card } from '../UI';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
    this.setState({ error, hasError: true });

    // Report to error tracking if available
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="p-8 border-red-200 bg-red-50 m-4">
          <div className="text-center">
            <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-6">
              {this.props.message || 'Dashboard section failed to load. Please try again.'}
            </p>
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={this.handleRetry}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                <FiHome className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
            
            {this.state.retryCount > 0 && (
              <p className="text-sm text-red-500 mt-4">
                Retry attempts: {this.state.retryCount}
              </p>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export { DashboardErrorBoundary };
export default DashboardErrorBoundary; 
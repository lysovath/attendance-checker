import { Component } from 'react';
import { toast } from 'sonner';

export class GlobalErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const message = error?.message || 'A critical rendering error occurred.';
    toast.error('Render Crash', { description: message });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong in the application.</h2>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              marginTop: '10px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0B0E14',
          color: '#fff',
          padding: '40px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '700px',
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid #FF6B00',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(255, 107, 0, 0.2)'
          }}>
            <h2 style={{ color: '#FF6B00', marginBottom: '12px' }}>⚠️ Error Caught in React Component</h2>
            <p style={{ color: '#ff8888', fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
            <pre style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '12px',
              borderRadius: '8px',
              overflowX: 'auto',
              fontSize: '12px',
              marginTop: '12px'
            }}>
              {this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                background: '#FF6B00',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Перезавантажити сторінку
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


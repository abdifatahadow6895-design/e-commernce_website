import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-gray-500">An unexpected error occurred. Please refresh the page or return home.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => window.location.reload()} className="btn-secondary">Refresh</button>
            <Link to="/" className="btn-primary">Go Home</Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

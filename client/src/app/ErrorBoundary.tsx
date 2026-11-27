import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorPage from '@/pages/ErrorPage';

type State = { hasError: boolean };

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.hasError ? <ErrorPage /> : this.props.children;
  }
}

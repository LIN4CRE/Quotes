import { TriangleAlert } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last-resort boundary for render errors. Data is unaffected because it lives
 * in local storage; the user can reload without losing anything.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('LIN4CRE QUOTES render error', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="grid size-14 place-items-center rounded-2xl border border-danger/25 bg-danger/10 text-danger">
          <TriangleAlert className="size-6" aria-hidden />
        </div>
        <h1 className="display-title mt-5 text-3xl text-ink">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The page hit an unexpected error. Your saved quotes are stored separately, so they are
          still here. Reloading usually fixes it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-ink"
          >
            Reload the app
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="inline-flex h-10 items-center rounded-full border border-line bg-surface-2 px-5 text-sm font-medium text-ink"
          >
            Go to Discover
          </button>
        </div>
      </div>
    );
  }
}

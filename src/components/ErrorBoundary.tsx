import React from "react";
type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("UI crash:", error, info); }
  render() {
    return this.state.hasError
      ? <div className="p-4"><h2 className="text-lg font-semibold">Algo deu errado</h2><pre className="text-xs">{this.state.error?.message}</pre></div>
      : this.props.children;
  }
}
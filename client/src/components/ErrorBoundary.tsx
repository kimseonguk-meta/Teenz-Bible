import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Bug } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Detailed logging without PII or secrets
    try {
      const details = {
        message: error?.message || String(error),
        stack: error?.stack?.slice(0, 2000) || 'no-stack',
        componentStack: errorInfo?.componentStack?.slice(0, 2000) || 'no-component-stack',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.slice(0, 200),
        localStorageKeys: Object.keys(localStorage).length,
        url: window.location.pathname,
      };
      console.error("[ErrorBoundary] Caught error:", details, error, errorInfo);
      // Store for debugging – no user progress data included
      try {
        sessionStorage.setItem('_lastError', JSON.stringify(details));
      } catch {}
    } catch (logErr) {
      console.error("[ErrorBoundary] Logging failed", logErr);
    }
  }

  handleSafeReset = () => {
    // Only clear keys that are corrupted (fail JSON.parse when they should be JSON)
    // Never clear profile or progress blindly
    try {
      const suspectKeys = [
        "teensBible",
        "teensBibleProfile",
        "teensBibleInventory",
        "teensBibleEquipped",
        "teensBibleDailyStreak",
        "watchedVideos",
        "quizHistory",
      ];
      let cleared = 0;
      for (const k of suspectKeys) {
        const v = localStorage.getItem(k);
        if (v) {
          try {
            JSON.parse(v);
          } catch {
            // corrupted – quarantine then remove
            try {
              localStorage.setItem(`_corrupted_${k}`, v);
              localStorage.removeItem(k);
              cleared++;
            } catch {}
          }
        }
      }
      console.log(`[ErrorBoundary] Safe reset cleared ${cleared} corrupted keys`);
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md p-8 text-center">
            <AlertTriangle
              size={48}
              className="text-amber-500 mb-6 flex-shrink-0"
            />

            <h2 className="text-xl font-bold mb-2 text-foreground">Oops! Something went wrong</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Don't worry, your progress is saved. Please try reloading the app.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-3 rounded-xl w-full",
                  "bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold",
                  "shadow-[0_4px_20px_rgba(168,85,247,0.3)]",
                  "hover:opacity-90 cursor-pointer transition-transform active:scale-[0.97]"
                )}
              >
                <RotateCcw size={16} />
                Reload App
              </button>
              <button
                onClick={this.handleSafeReset}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-3 rounded-xl w-full",
                  "bg-white/10 text-white/80 text-sm font-medium",
                  "hover:bg-white/15 cursor-pointer transition-colors"
                )}
              >
                <Bug size={14} />
                Safe Reset (clear corrupted data only)
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left w-full text-xs text-white/40">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all text-[10px] max-h-32 overflow-auto">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack?.slice(0, 800)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

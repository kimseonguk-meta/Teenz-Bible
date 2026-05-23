import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to console for debugging but never show to user
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

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

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl",
                "bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold",
                "shadow-[0_4px_20px_rgba(168,85,247,0.3)]",
                "hover:opacity-90 cursor-pointer transition-transform active:scale-[0.97]"
              )}
            >
              <RotateCcw size={16} />
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

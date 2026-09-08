import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        duration: 2500,
        style: {
          marginBottom: "5rem",
        } as React.CSSProperties,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          bottom: "5rem",
          zIndex: 9999,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

import type { AppProps } from "next/app";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../hooks/useAuth";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  );
} 
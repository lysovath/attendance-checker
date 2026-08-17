// src/components/GlobalErrorListener.jsx
import { useEffect } from 'react';
import { toast } from 'sonner';

export function GlobalErrorListener() {
  useEffect(() => {
    // Synchronous errors
    const handleGlobalError = (event) => {
      const message = event.message || 'An unexpected error occurred.';
      toast.error('Error', { description: message });
    };

    // Unhandled Promise Rejections (Axios / fetch / async calls)
    const handleUnhandledRejection = (event) => {
      // Prevents the browser from printing "Uncaught (in promise)" in the console
      event.preventDefault();

      const reason = event.reason;

      // Extract backend message from Axios response (e.g., res.data.message or res.data.error)
      const apiMessage =
        reason?.response?.data?.message ||
        reason?.response?.data?.error ||
        (typeof reason?.response?.data === 'string' ? reason.response.data : null);

      const fallbackMessage =
        typeof reason === 'string'
          ? reason
          : reason?.message || 'An unhandled async error occurred.';

      const finalMessage = apiMessage || fallbackMessage;

      toast.error('Request Failed', { description: finalMessage });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
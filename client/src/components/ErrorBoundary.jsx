import React from "react";

// Error boundary para capturar errores de render en cualquier ruta/componente
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log opcional
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback, úsalo
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Fallback mínimo
      return (
        <div style={{ minHeight: '100vh' }} className="flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-xl text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ha ocurrido un error</h1>
            <p className="text-gray-600 mb-6">Intenta recargar la página o regresar al inicio.</p>
            <a href="/" className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Volver al inicio</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

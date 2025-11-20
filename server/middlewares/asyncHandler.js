// Wrapper para manejar errores en rutas asíncronas de Express
// Express 4 no captura automáticamente errores no manejados en async handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


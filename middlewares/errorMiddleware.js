// middlewares/errorMiddleware.js
export function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(err, req, res, next) {
  // If response status code is 200, change to 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message || 'Internal Server Error',
    // include stack only in development
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

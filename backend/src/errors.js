export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status === 500 ? 'Unexpected server error' : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ message });
}

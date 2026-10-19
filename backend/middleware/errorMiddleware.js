import { UniqueConstraintError, ValidationError, ForeignKeyConstraintError, DatabaseError } from 'sequelize';

export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  let status = err.statusCode || err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal server error';
  if (err instanceof UniqueConstraintError) {
    status = 409;
    message = 'A record with that value already exists';
  } else if (err instanceof ValidationError) {
    status = 400;
    message = err.errors.map((item) => item.message).join(', ');
  } else if (err instanceof ForeignKeyConstraintError) {
    status = 409;
    message = 'This record is referenced by other marketplace data';
  } else if (err instanceof DatabaseError && err.original?.code === '22P02') {
    status = 400;
    message = 'Invalid resource identifier';
  } else if (err.name === 'MulterError') {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'Uploaded image exceeds the 5 MB file size limit';
  }
  if (process.env.NODE_ENV !== 'production' && status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
}

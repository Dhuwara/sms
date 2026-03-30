const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const status = err.status || 500;

  if (isDev) {
    console.error(err.stack);
  } else {
    // In production, log minimal info (no stack traces to console)
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${status} ${err.message}`);
  }

  res.status(status).json({
    success: false,
    message: isDev ? err.message : (status < 500 ? err.message : 'An error occurred. Please try again.'),
  });
};

export default errorHandler;

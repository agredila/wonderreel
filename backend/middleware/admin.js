export function requireAdmin(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) {
    return res.status(503).json({
      success: false,
      error: { code: 'ADMIN_UNAVAILABLE', message: 'ADMIN_API_KEY is not configured on the server.' }
    });
  }

  const headerKey = req.headers['x-admin-key'];
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const provided = headerKey || bearer;

  if (!provided || provided !== configuredKey) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid admin credentials.' }
    });
  }

  next();
}

export function requireSecret(req, res, next) {
  const secret = process.env.UPLOAD_SECRET;
  if (!secret) {
    // UPLOAD_SECRET must be set — deny all requests if misconfigured
    return res.status(503).json({ error: 'Server misconfiguration.' });
  }
  const header = req.get('X-Upload-Secret');
  if (header && header === secret) return next();
  return res.status(403).json({ error: 'Unauthorized.' });
}

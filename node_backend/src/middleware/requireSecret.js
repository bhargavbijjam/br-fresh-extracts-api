import { verifyAccessToken } from '../config/jwt.js';

export function requireSecret(req, res, next) {
  // Option 1: X-Upload-Secret header (for scripts / backend-to-backend)
  const secret = process.env.UPLOAD_SECRET;
  const header = req.get('X-Upload-Secret');
  if (secret && header === secret) return next();

  // Option 2: Admin JWT Bearer token (for the admin web panel)
  const auth = req.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(auth.slice(7));
      if (payload?.role === 'admin') return next();
    } catch { /* invalid token — fall through */ }
  }

  if (!secret) return res.status(503).json({ error: 'Server misconfiguration.' });
  return res.status(403).json({ error: 'Unauthorized.' });
}

const DEFAULT_URL = 'https://lingva.ml';
const DEFAULT_LINGVA_BASE = 'https://lingva.ml';

function extractTranslatedText(payload) {
  if (!payload) return '';
  if (typeof payload.translatedText === 'string') return payload.translatedText;
  if (payload.data?.translations?.[0]?.translatedText) return payload.data.translations[0].translatedText;
  if (payload.translation) return payload.translation;
  return '';
}

export async function translateText(req, res, next) {
  try {
    const { text, target, source = 'en' } = req.body || {};
    if (!text || !target) {
      return res.status(400).json({ error: 'text and target are required' });
    }

    const provider = (process.env.TRANSLATE_PROVIDER || '').toLowerCase();
    const apiUrl = process.env.TRANSLATE_API_URL || DEFAULT_URL;
    const apiKey = process.env.TRANSLATE_API_KEY || '';

    let response;
    if (provider === 'lingva' || apiUrl.includes('lingva')) {
      const base = apiUrl.replace(/\/+$/, '') || DEFAULT_LINGVA_BASE;
      const src = source || 'auto';
      const endpoint = `${base}/api/v1/${encodeURIComponent(src)}/${encodeURIComponent(target)}/${encodeURIComponent(text)}`;
      response = await fetch(endpoint, { method: 'GET' });
    } else {
      const payload = {
        q: text,
        source,
        target,
        format: 'text',
        api_key: apiKey || undefined,
      };

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const msg = await response.text();
      return res.status(502).json({ error: 'Translation API error', details: msg });
    }

    const data = await response.json();
    const translatedText = extractTranslatedText(data) || text;
    return res.json({ translatedText });
  } catch (err) {
    return next(err);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.ANTHROPIC_API_KEY_Clinic 
                || process.env.ANTHROPIC_API_KEY 
                || process.env.ANTHROPIC_API_KEY_NAIL;

  if (!API_KEY) {
    return res.status(500).json({ error: 'No Anthropic API key found. Please set ANTHROPIC_API_KEY_Clinic or ANTHROPIC_API_KEY in Vercel environment variables.' });
  }

  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Try multiple models in order of preference
  const modelsToTry = [
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307',
    'claude-2.1'
  ];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1024,
          system: system || '',
          messages: messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        lastError = data.error?.message || `HTTP ${response.status}`;
        continue; // try next model
      }
      return res.status(200).json(data);
    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  return res.status(500).json({ error: `All models failed. Last error: ${lastError}` });
}
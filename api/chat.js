// api/chat.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Use the exact name of your environment variable
  const API_KEY = process.env.ANTHROPIC_API_KEY_Clinic;

  if (!API_KEY) {
    console.error('ANTHROPIC_API_KEY_Clinic not set');
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY_Clinic not set in environment' });
  }

  const { messages, system } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // valid model name
        max_tokens: 1024,
        system: system || '',
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errDetail = data?.error?.message || JSON.stringify(data);
      return res.status(response.status).json({ error: errDetail });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Fetch failed: ' + err.message });
  }
}
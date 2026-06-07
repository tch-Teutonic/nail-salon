export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY_Clinic;

  if (!API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY_Clinic');
    return res.status(500).json({ error: 'Missing API key. Please set ANTHROPIC_API_KEY_Clinic in Vercel.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Log the full error to Vercel function logs
      console.error('Anthropic error details:', data);
      // Return a helpful message to the frontend
      const errorMsg = data.error?.message || `HTTP ${response.status}`;
      return res.status(response.status).json({ error: `Anthropic error: ${errorMsg}` });
    }

    const reply = data.content[0].text;
    res.status(200).json({ content: [{ text: reply }] });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
// api/chat.js – Serverless function for 95 Nail Lab AI assistant
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;
  // Use your exact environment variable name
  const API_KEY = process.env.ANTHROPIC_API_KEY_Clinic;

  if (!API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY_Clinic');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
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
      console.error('Anthropic error:', data);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const reply = data.content[0].text;
    // Return in the format your frontend expects (content[0].text)
    return res.status(200).json({ content: [{ text: reply }] });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
export default async function handler(req, res) {
  // console.log('📥 API Hit:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, from = 'en', to } = req.body;

  // console.log('➡️ Payload received in API:', { text, from, to });

  try {
    const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}&textType=html`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': process.env.TRANSLATOR_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ Text: text }]),
    });

    const data = await response.json();
    // console.log('✅ Translation response:', data);
    res.status(200).json(data[0]?.translations[0]?.text || text);
  } catch (error) {
    // console.error('❌ Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
}

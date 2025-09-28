export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle both old and new API formats
  const { text, texts, from = 'en', to } = req.body;

  try {
    // Handle both single text string and array of texts
    const isArray = Array.isArray(texts);
    
    // If using old format with single text, use that
    // If using new format with texts array, use that
    const textArray = isArray ? texts : [{ Text: text || '' }];
    
    // Format the request body for Microsoft Translator API
    const requestBody = isArray ? textArray.map(item => ({ Text: item.text })) : textArray;

    const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}&textType=html`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': process.env.TRANSLATOR_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Return array of translations or single translation based on input
    if (isArray) {
      const translations = data.map(item => item?.translations[0]?.text || '');
      res.status(200).json(translations);
    } else {
      res.status(200).json(data[0]?.translations[0]?.text || text || '');
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
}

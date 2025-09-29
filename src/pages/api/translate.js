export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, texts, from = 'en', to } = req.body;

  try {
    const isArray = Array.isArray(texts);

    // Format the request body correctly for Microsoft Translator API
    let requestBody;
    
    if (isArray) {
      // Handle array of texts
      requestBody = texts.map(item => ({ text: item.text }));
    } else {
      // Handle single text
      requestBody = [{ text: text || '' }];
    }

    console.log(requestBody, "request body");

    const response = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}&textType=html`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.TRANSLATOR_KEY,
          'Ocp-Apim-Subscription-Region': process.env.TRANSLATOR_REGION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return res.status(response.status).json({ error: 'Translation API error', details: errorData });
    }

    const data = await response.json();
    console.log(data, "response data of translation");
    
    // Return formatted response
    if (isArray) {
      const translations = data.map(item => item?.translations[0]?.text || '');
      res.status(200).json(translations);
    } else {
      res.status(200).json(data[0]?.translations[0]?.text || text || '');
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
}
// api/translate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, texts, textGroups, from = 'en', to } = req.body;

  try {
    let translatedResults = [];
    
    if (textGroups) {
      // Handle grouped texts - translate one at a time
      const groupedTranslations = {};
      
      for (const [groupName, groupTexts] of Object.entries(textGroups)) {
        const translations = [];
        
        for (const textItem of groupTexts) {
          const textToTranslate = typeof textItem === 'string' ? textItem : textItem.text;
          
          const response = await fetch('http://translate.sportsbuz.com/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: textToTranslate,
              source: from,
              target: to,
              format: 'text'
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            translations.push(textToTranslate); // Fallback to original
          } else {
            const data = await response.json();
            translations.push(data.translatedText || textToTranslate);
          }
        }
        
        groupedTranslations[groupName] = translations;
      }
      
      return res.status(200).json(groupedTranslations);
      
    } else if (Array.isArray(texts)) {
      // Handle array of texts - translate one at a time
      for (const item of texts) {
        const textToTranslate = item.text || item;
        
        const response = await fetch('http://translate.sportsbuz.com/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: textToTranslate,
            source: from,
            target: to,
            format: 'text'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          translatedResults.push(textToTranslate); // Fallback to original
        } else {
          const data = await response.json();
          translatedResults.push(data.translatedText || textToTranslate);
        }
      }
      
      return res.status(200).json(translatedResults);
      
    } else {
      // Handle single text
      const response = await fetch('http://translate.sportsbuz.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text || '',
          source: from,
          target: to,
          format: 'text'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return res.status(response.status).json({ error: 'Translation API error', details: errorData });
      }

      const data = await response.json();
      return res.status(200).json(data.translatedText || text || '');
    }
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
}
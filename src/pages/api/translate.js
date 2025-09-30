export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, texts, textGroups, from = 'en', to } = req.body;

  try {
    // Handle different input formats
    let requestBody;
    let responseFormat = 'single'; // Default format
    
    if (textGroups) {
      // New format: Handle grouped texts (for header, categories, subcategories)
      // textGroups is an object where each key is a group name and value is an array of texts
      responseFormat = 'grouped';
      
      // Flatten all texts into a single array for the API call
      const allTexts = [];
      const groupMappings = {};
      let currentIndex = 0;
      
      // Process each group and build mappings for reconstruction
      Object.entries(textGroups).forEach(([groupName, groupTexts]) => {
        groupMappings[groupName] = {
          startIndex: currentIndex,
          count: groupTexts.length
        };
        
        // Add each text to the flattened array
        groupTexts.forEach(textItem => {
          allTexts.push({ text: typeof textItem === 'string' ? textItem : textItem.text });
          currentIndex++;
        });
      });
      
      // Store mappings for reconstructing the response
      req.groupMappings = groupMappings;
      requestBody = allTexts;
      
    } else if (Array.isArray(texts)) {
      // Handle array of texts (existing batch format)
      responseFormat = 'array';
      requestBody = texts.map(item => ({ text: item.text }));
    } else {
      // Handle single text (existing single format)
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
    
    // Return formatted response based on input format
    if (responseFormat === 'grouped') {
      // Reconstruct the grouped response
      const groupedTranslations = {};
      const flatTranslations = data.map(item => item?.translations[0]?.text || '');
      
      // Use the mappings to rebuild the original structure
      Object.entries(req.groupMappings).forEach(([groupName, mapping]) => {
        const { startIndex, count } = mapping;
        groupedTranslations[groupName] = flatTranslations.slice(startIndex, startIndex + count);
      });
      
      res.status(200).json(groupedTranslations);
    } else if (responseFormat === 'array') {
      // Return array of translations (existing batch format)
      const translations = data.map(item => item?.translations[0]?.text || '');
      res.status(200).json(translations);
    } else {
      // Return single translation (existing single format)
      res.status(200).json(data[0]?.translations[0]?.text || text || '');
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
}
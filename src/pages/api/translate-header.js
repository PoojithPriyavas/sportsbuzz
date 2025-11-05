// api/translate.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, texts, textGroups, from = 'en', to } = req.body;

    // Helper: delay for retries
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Helper: call external translation API with up to 4 attempts
    const translateWithRetry = async (textToTranslate, fromCode, toCode, maxAttempts = 4) => {
        let attempt = 1;
        let lastError = null;

        while (attempt <= maxAttempts) {
            try {
                const response = await fetch('http://translate.sportsbuz.com/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        q: textToTranslate,
                        source: fromCode,
                        target: toCode,
                        format: 'text',
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.translatedText || textToTranslate;
                } else {
                    // Capture error payload for logging and retry decision
                    let errorData = null;
                    try {
                        errorData = await response.json();
                    } catch (_) {
                        errorData = await response.text();
                    }

                    lastError = { status: response.status, details: errorData };

                    // Compute backoff delay, honor Retry-After header if present
                    let waitMs = 300 * Math.pow(2, attempt - 1); // exponential backoff
                    const retryAfter = response.headers.get('Retry-After');
                    if (retryAfter) {
                        const parsed = Number(retryAfter);
                        if (!Number.isNaN(parsed)) {
                            waitMs = Math.max(waitMs, parsed * 1000);
                        }
                    }

                    if (attempt < maxAttempts) {
                        await delay(waitMs);
                        attempt++;
                        continue;
                    } else {
                        const err = new Error('Translation API error');
                        err.response = lastError;
                        throw err;
                    }
                }
            } catch (networkOrOtherError) {
                // Network or thrown error above
                lastError = networkOrOtherError.response || { status: 500, details: networkOrOtherError.message };
                if (attempt < maxAttempts) {
                    await delay(300 * Math.pow(2, attempt - 1));
                    attempt++;
                    continue;
                } else {
                    const err = new Error('Translation API error');
                    err.response = lastError;
                    throw err;
                }
            }
        }
    }

    // Helper: Process batch translation with proper splitting
    // In api/translate.js - modify the processBatchTranslation function
    const processBatchTranslation = async (textItems, fromCode, toCode) => {
        const textsToTranslate = textItems.map(item =>
            typeof item === 'string' ? item : item.text
        );

        const DELIMITER = '|||TRANSLATION_DELIMITER|||';
        const batchText = textsToTranslate.join(DELIMITER);

        try {
            const translatedBatch = await translateWithRetry(batchText, fromCode, toCode);

            // Try to split with the original delimiter
            let translations = translatedBatch.split(DELIMITER);

            // If splitting failed, try to clean up the delimiter variations
            if (translations.length !== textsToTranslate.length) {
                console.warn('Primary delimiter failed, trying cleaned versions...');

                // Common delimiter translations that might occur
                const delimiterVariations = [
                    '|||TRANSLATION_DELIMITERATION|||',
                    '|||TRANSLATION_DELIMITER|||',
                    '|||TRANSLATION_DELIMITER',
                    'TRANSLATION_DELIMITER|||',
                    'TRANSLATION_DELIMITERATION',
                    'ILLTRANSLATION_DELIMITERATION', // Your specific case
                    'Illtranslation_delimiteration'   // Your specific case
                ];

                for (const variation of delimiterVariations) {
                    translations = translatedBatch.split(variation);
                    if (translations.length === textsToTranslate.length) {
                        console.log('✅ Found working delimiter variation:', variation);
                        break;
                    }
                }
            }

            // Final cleanup of any remaining delimiter text
            translations = translations.map(translation => {
                let clean = translation.trim();
                // Remove any delimiter remnants
                delimiterVariations.forEach(variation => {
                    clean = clean.replace(new RegExp(variation, 'gi'), '');
                });
                // Remove any "|||" patterns
                clean = clean.replace(/\|{3,}/g, '');
                return clean;
            });

            // If we still don't have the right count, use individual fallback
            if (translations.length !== textsToTranslate.length) {
                console.warn('All delimiter methods failed, using individual translation');
                return await handleIndividualTranslation(textItems, fromCode, toCode);
            }

            return translations;

        } catch (error) {
            console.error('Batch translation failed:', error);
            return await handleIndividualTranslation(textItems, fromCode, toCode);
        }
    }

    // Helper: Fallback to individual translation (only used as last resort)
    const handleIndividualTranslation = async (textItems, fromCode, toCode) => {
        console.warn('Using individual translation fallback for', textItems.length, 'items');
        const translatedResults = [];

        for (const item of textItems) {
            const textToTranslate = typeof item === 'string' ? item : item.text;
            try {
                const translated = await translateWithRetry(textToTranslate, fromCode, toCode);
                translatedResults.push(translated);
            } catch (err) {
                console.error('Individual translation error:', err.response || err);
                translatedResults.push(textToTranslate);
            }
        }

        return translatedResults;
    }

    try {
        // Case 1: Handle grouped texts (categories + subcategories)
        if (textGroups) {
            const groupedTranslations = {};

            for (const [groupName, groupTexts] of Object.entries(textGroups)) {
                if (Array.isArray(groupTexts) && groupTexts.length > 0) {
                    // Use batch translation for each group
                    const translations = await processBatchTranslation(groupTexts, from, to);
                    groupedTranslations[groupName] = translations;
                } else {
                    // Handle non-array or empty groups
                    groupedTranslations[groupName] = groupTexts;
                }
            }

            return res.status(200).json(groupedTranslations);

        }
        // Case 2: Handle array of texts (header labels, etc.)
        else if (Array.isArray(texts)) {
            if (texts.length === 0) {
                return res.status(200).json([]);
            }

            // Use batch translation for all texts
            const translatedResults = await processBatchTranslation(texts, from, to);
            return res.status(200).json(translatedResults);

        }
        // Case 3: Handle single text
        else if (text) {
            try {
                const translated = await translateWithRetry(text, from, to);
                return res.status(200).json(translated);
            } catch (err) {
                console.error('Single text API Error:', err.response || err);
                const status = (err.response && err.response.status) || 500;
                return res.status(status).json({ error: 'Translation API error', details: err.response?.details || err.message });
            }
        }
        // Case 4: No valid input
        else {
            return res.status(400).json({ error: 'No text provided for translation' });
        }

    } catch (error) {
        console.error('Translation processing error:', error);
        res.status(500).json({ error: 'Translation failed', message: error.message });
    }
}
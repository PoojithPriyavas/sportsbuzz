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

    try {
        if (textGroups) {
            // Handle grouped texts - translate one at a time with retries
            const groupedTranslations = {};

            for (const [groupName, groupTexts] of Object.entries(textGroups)) {
                const translations = [];

                for (const textItem of groupTexts) {
                    const textToTranslate = typeof textItem === 'string' ? textItem : textItem.text;
                    try {
                        const translated = await translateWithRetry(textToTranslate, from, to);
                        translations.push(translated);
                    } catch (err) {
                        console.error('API Error:', err.response || err);
                        translations.push(textToTranslate); // Fallback to original after max attempts
                    }
                }

                groupedTranslations[groupName] = translations;
            }

            return res.status(200).json(groupedTranslations);

        } else if (Array.isArray(texts)) {
            // Handle array of texts - translate one at a time with retries
            const translatedResults = [];

            for (const item of texts) {
                const textToTranslate = item.text || item;
                try {
                    const translated = await translateWithRetry(textToTranslate, from, to);
                    translatedResults.push(translated);
                } catch (err) {
                    console.error('API Error:', err.response || err);
                    translatedResults.push(textToTranslate); // Fallback to original after max attempts
                }
            }

            return res.status(200).json(translatedResults);

        } else {
            // Handle single text with retries
            try {
                const translated = await translateWithRetry(text || '', from, to);
                return res.status(200).json(translated || (text || ''));
            } catch (err) {
                console.error('API Error:', err.response || err);
                const status = (err.response && err.response.status) || 500;
                return res.status(status).json({ error: 'Translation API error', details: err.response?.details || err.message });
            }
        }
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed', message: error.message });
    }
}
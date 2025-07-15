// File: src/pages/api/get-ods.jsx

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { sportEventId, token } = req.query;

    if (!sportEventId || !token) {
        return res.status(400).json({ message: 'Missing sportEventId or token' });
    }

    const url = `https://cpservm.com/gateway/marketing/datafeed/loadlist/prematch/api/v1/getMarketsGame?ref=151&gameId=${sportEventId}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({ message: error });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

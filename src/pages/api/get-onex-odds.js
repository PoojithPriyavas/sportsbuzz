export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { gameId, token, ref } = req.query;
    if (!gameId || !token || !ref) {
        return res.status(400).json({ message: 'Missing gameId, token, or ref' });
    }

    const url = `https://cpservm.com/gateway/marketing/datafeed/loadlist/prematch/api/v1/getMarketsGame?ref=${ref}&gameId=${gameId}`;

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

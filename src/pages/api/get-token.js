import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const tokenUrl = 'https://cpservm.com/gateway/token';

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing CLIENT_ID or CLIENT_SECRET in environment' });
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await axios.post(tokenUrl, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = response.data;
    // console.log(response.data, "token");
    return res.status(200).json({ access_token });
  } catch (error) {
    console.error('Failed to get token:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch token',
      details: error.response?.data || error.message,
    });
  }
}


export default async function fetchMatchLineUp(req, res) {
    // console.log("goes to fn")
    const { Date,Timezone } = req.query;
    const url = `https://livescore6.p.rapidapi.com/matches/v2/list-by-date?Category=soccer&Date=${Date}&Timezone=${Timezone}`;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.FOOTBALL_RAPID_API_KEY,
        },
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch football match details' });
    }
}

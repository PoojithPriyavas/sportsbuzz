// src/pages/api/get-football-match-details.jsx

export default async function fetchMatchLineUp(req, res) {
    // console.log("goes to fn")
    const { Eid } = req.query;
    const url = `https://livescore6.p.rapidapi.com/matches/v2/get-lineups?Category=soccer&Eid=${Eid}`;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_FOOTBALL_RAPID_API_KEY,
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

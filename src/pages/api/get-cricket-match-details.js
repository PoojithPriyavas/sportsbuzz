// src/pages/api/get-football-match-details.jsx

export default async function fetchCricketDetails(req, res) {
    // console.log("goes to fn")
    const { matchId } = req.query;
    const url = `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}`;

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

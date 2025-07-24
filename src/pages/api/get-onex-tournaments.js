// lib/api.js

export async function fetchOneXTournaments(token) {
    // console.log("fetch tournaments called");
    // console.log(token, "tournament token");

    const url = 'https://cpservm.com/gateway/marketing/datafeed/loadtree/prematch/api/v1/tournaments';

    const params = new URLSearchParams({
        ref: '320',
        sportId: '1',
    });

    try {
        const response = await fetch(`${url}?${params}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

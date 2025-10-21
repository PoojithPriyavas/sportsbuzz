

export async function fetchEventsIds({ token, id }) {
    // console.log("fetch team name called");
    // console.log(token, "team token");
    // console.log(id, "team  id");

    const url = 'https://cpservm.com/gateway/marketing/datafeed/loadtree/prematch/api/v1/sportEventIds';

    const params = new URLSearchParams({
        ref: '192',
        tournamentId: id,
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



export async function fetchSportEventDetails({ token, eventId }) {

    // console.log("team name evnent called")
    // console.log(eventId, "evt id")

    const url = 'https://cpservm.com/gateway/marketing/datafeed/loadtree/prematch/api/v1/sporteventDetail';

    const params = new URLSearchParams({
        ref: '151',
        sportEventId: eventId,
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
        // console.log(data, "team name value")
        return data;
    } catch (error) {
        console.error(`Error fetching sport event ${eventId}:`, error);
        return null;
    }
}

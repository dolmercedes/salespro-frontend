import type { Handler, HandlerEvent } from "@netlify/functions";

// The real backend API endpoint
const API_ENDPOINT = 'https://so-monitoring.infinityfree.me/salespro/api.php';

const handler: Handler = async (event: HandlerEvent) => {
  try {
    // Construct the full API URL with the action parameter
    const action = event.queryStringParameters?.action || '';
    const url = `${API_ENDPOINT}?${new URLSearchParams({ action })}`;

    let response;

    // Handle POST requests for adding new SOs
    if (event.httpMethod === 'POST') {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body,
      });
    } else { 
      // Handle GET requests for fetching data
      response = await fetch(url);
    }

    // Check if the fetch to the backend was successful
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Error fetching from backend API: ${await response.text()}`,
      };
    }
    
    // Get the data from the backend
    const data = await response.json();

    // Return the successful response to the frontend
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    // Handle any unexpected errors in the function
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred in the proxy function.' }),
    };
  }
};

export { handler };

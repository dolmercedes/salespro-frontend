import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const REAL_API_URL = 'https://so-monitoring.infinityfree.me/salespro/api.php';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const action = event.queryStringParameters?.['action'] || '';
    const targetUrl = `${REAL_API_URL}?${new URLSearchParams(event.queryStringParameters || {}).toString()}`;

    // These headers make the request look like it's from a real browser,
    // which is necessary to bypass the InfinityFree anti-bot security.
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://so-moni.netlify.app/',
    };

    let response;

    if (event.httpMethod === 'POST') {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: event.body,
      });
    } else {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: headers,
      });
    }
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Backend error:', errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ success: false, error: `Backend request failed with status ${response.status}`, details: errorBody.substring(0, 500) }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allows the browser to access this response
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
          success: false, 
          error: 'An error occurred in the proxy function.',
          details: error instanceof Error ? error.message : String(error)
      }),
    };
  }
};

export { handler };

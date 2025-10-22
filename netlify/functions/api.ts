import type { Handler } from "@netlify/functions";

// The remote API endpoint to which requests will be proxied.
const TARGET_URL = 'https://so-monitoring.infinityfree.me/salespro/api.php';

export const handler: Handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No Content
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow any origin
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            },
            body: ''
        };
    }

    const url = new URL(TARGET_URL);

    // Forward query string parameters from the client request
    if (event.queryStringParameters) {
        Object.entries(event.queryStringParameters).forEach(([key, value]) => {
            if (value) {
                url.searchParams.append(key, value);
            }
        });
    }

    try {
        // Forward the request to the target API
        const response = await fetch(url.toString(), {
            method: event.httpMethod,
            headers: {
                // Add more browser-like headers to bypass security
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': event.headers['referer'] || 'https://so-moni.netlify.app/',
                // Pass through the Content-Type header from the client, defaulting if not present.
                'Content-Type': event.headers['content-type'] || 'application/json',
                // Add a standard User-Agent header to mimic a browser request
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            // Include the body only for relevant methods
            body: event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' ? event.body : undefined,
        });

        // Read the response body as text to handle both JSON and non-JSON responses
        const responseData = await response.text();

        // Create headers for the client response, starting with CORS
        const responseHeaders: { [key: string]: string } = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        };

        // Forward headers from the target API response
        response.headers.forEach((value, key) => {
            // Avoid forwarding headers that are controlled by the Netlify platform
            if (!['transfer-encoding', 'connection', 'content-encoding', 'server'].includes(key.toLowerCase())) {
                responseHeaders[key] = value;
            }
        });

        return {
            statusCode: response.status,
            headers: responseHeaders,
            body: responseData,
        };
    } catch (error) {
        console.error('API proxy error:', error);
        return {
            statusCode: 502, // Bad Gateway
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to proxy request to the target API.',
                details: error instanceof Error ? error.message : String(error)
            }),
        };
    }
};

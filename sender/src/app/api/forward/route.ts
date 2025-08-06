import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to forward a string to another project or endpoint
 * POST /api/forward
 * Body: { text: string, destination: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text, destination } = body;

    console.log("text:", text);
    console.log("destination:", destination);

    // Validate required parameters
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required parameter: text' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: 'Missing required parameter: destination' },
        { status: 400 }
      );
    }

    // Forward the string to the specified destination
    const response = await fetch(destination, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    // Check if the forward request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        {
          error: 'Failed to forward string to destination',
          statusCode: response.status,
          details: errorData
        },
        { status: 502 }
      );
    }

    // Return the response from the destination
    const responseData = await response.json();
    console.log("Response from destination:", responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error forwarding string:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    );
  }
}

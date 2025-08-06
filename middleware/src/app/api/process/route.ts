import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to receive a text from sender and forward to receiver
 * POST /api/process
 * Body: { text: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text } = body;

    // Validate required parameter
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required parameter: text' },
        { status: 400 }
      );
    }

    // Default receiver endpoint - this can be made configurable too
    const receiverEndpoint = 'http://localhost:3002/api/process';

    // Forward the text to the receiver
    const response = await fetch(receiverEndpoint, {
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
          error: 'Failed to forward text to receiver',
          statusCode: response.status,
          details: errorData
        },
        { status: 502 }
      );
    }

    // Return the response from the receiver
    const responseData = await response.json();
    return NextResponse.json({
      original: text,
      processed: responseData.result ,
      message: 'Text processed through middleware'
    });

  } catch (error) {
    console.error('Error processing text in middleware:', error);
    return NextResponse.json(
      { error: 'Failed to process request in middleware', details: (error as Error).message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to reverse a string
 * POST /api/process
 * Body: { text: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text } = body;

    console.log("Receiver received text:", text);

    // Validate required parameter
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required parameter: text' },
        { status: 400 }
      );
    }

    // Reverse the string
    const reversedText = text.split('').reverse().join('');
    console.log("Receiver Reversed text sending back to middleware:", reversedText);

    // Return the reversed string
    return NextResponse.json({
      result: reversedText,
    });

  } catch (error) {
    console.error('Error reversing text:', error);
    return NextResponse.json(
      { error: 'Failed to process text', details: (error as Error).message },
      { status: 500 }
    );
  }
}

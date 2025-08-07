import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

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
    
    await logger.info(`Receiver received text: "${text}"`, { textLength: text?.length });


    // Validate required parameter
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required parameter: text' },
        { status: 400 }
      );
    }

    // Reverse the string
    const reversedText = text.split('').reverse().join('');
    
    await logger.info(`Successfully reversed text`, { 
      originalText: text,
      reversedText: reversedText
    });

    // Return the reversed string
    return NextResponse.json({
      result: reversedText,
    });

  } catch (error) {
    await logger.error('Error processing text in receiver', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    
    return NextResponse.json(
      { error: 'Failed to process text', details: (error as Error).message },
      { status: 500 }
    );
  }
}

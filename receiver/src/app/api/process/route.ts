import { NextRequest, NextResponse } from 'next/server';
import { logger, setRequestId, getRequestId } from '@/utils/logger';

/**
 * API route to reverse a string
 * POST /api/process
 * Body: { text: string, requestId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Get requestId from header or generate a new one if not present
    const requestIdHeader = request.headers.get('X-Request-ID');
    if (requestIdHeader) {
      setRequestId(requestIdHeader);
    }
    
    // Parse the request body
    const body = await request.json();
    const { text, requestId: bodyRequestId } = body;
    
    // If requestId is in the body but not in the header, use that one
    if (bodyRequestId && !requestIdHeader) {
      setRequestId(bodyRequestId);
    }
    
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

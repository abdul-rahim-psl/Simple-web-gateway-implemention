import { NextRequest, NextResponse } from 'next/server';
import { logger, setRequestId, getRequestId } from '@/utils/logger';

/**
 * API route to receive a text from sender and forward to receiver
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
    
    await logger.info(`Middleware received text: "${text}"`, { textLength: text?.length });


    // Validate required parameter
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required parameter: text' },
        { status: 400 }
      );
    }

    // Default receiver endpoint - this can be made configurable too
    const environment = process.env.ENVIRONMENT || 'production';
    const receiverEndpoint = environment === 'development'
      ? 'http://localhost:3002/api/process'
      : 'https://streaming-sxs4.vercel.app/api/process';
      
    await logger.debug(`Forwarding text to receiver at ${receiverEndpoint}`);

    // Forward the text to the receiver
    const response = await fetch(receiverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': getRequestId(), // Pass the request ID to the receiver
      },
      body: JSON.stringify({ 
        text,
        requestId: getRequestId() // Include request ID in the payload too
      }),
    });

    // Check if the forward request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      await logger.error(`Failed to forward text to receiver`, { 
        statusCode: response.status,
        error: errorData
      });
      
      return NextResponse.json(
        {
          error: 'Failed to forward text to receiver',
          statusCode: response.status,
          details: errorData
        },
        { status: 502 }
      );
    }
    
    await logger.debug(`Received successful response from receiver: ${response.status}`);


    // Return the response from the receiver
    const responseData = await response.json();
    
    await logger.info(`Successfully processed text through middleware`, {
      originalText: text,
      processedText: responseData.result
    });
    
    return NextResponse.json({
      original: text,
      processed: responseData.result,
      message: 'Text processed through middleware'
    });

  } catch (error) {
    await logger.error('Error processing text in middleware', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    
    return NextResponse.json(
      { error: 'Failed to process request in middleware', details: (error as Error).message },
      { status: 500 }
    );
  }
}

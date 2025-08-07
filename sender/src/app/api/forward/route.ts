import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

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

    // Log the request
    await logger.info(`Received forward request with text: "${text}"`, { 
      destination, 
      textLength: text?.length 
    });

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

    // Log the forward operation
    await logger.debug(`Forwarding text to ${destination}`);

    // Forward the string to the specified destination
    const response = await fetch(destination, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text
      }),
    });
    
    await logger.debug(`Received response with status: ${response.status}`);

    // Check if the forward request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Log the error
      await logger.error(`Failed to forward text to destination`, { 
        statusCode: response.status, 
        error: errorData 
      });
      
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
    
    // Log the successful response
    await logger.info(`Successfully processed text, received response from destination`, { 
      text: text,
      result: responseData.processed || responseData.result
    });


    return NextResponse.json(responseData);

  } catch (error) {
    // Log the error
    await logger.error('Error processing forward request', { 
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    
    return NextResponse.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    );
  }
}

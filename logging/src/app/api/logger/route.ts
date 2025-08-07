import { NextRequest, NextResponse } from 'next/server';

// Define log entry interface
interface LogEntry {
  service: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
}

// In-memory log storage
// In a production environment, you would use a database or external logging service
let logs: LogEntry[] = [];

/**
 * API route to collect logs from all services
 * POST /api/log
 * Body: { service, level, message, timestamp, metadata }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: LogEntry = await request.json();
    
    // Validate required parameters
    if (!body.service || !body.level || !body.message || !body.timestamp) {
      return NextResponse.json(
        { error: 'Missing required log parameters' },
        { status: 400 }
      );
    }

    // Add to logs collection
    logs.push(body);
    
    console.log("")
    // Print log to console for demonstration
    console.log(` [${body.service.toUpperCase()}] [${body.level.toUpperCase()}] ${body.message}`);
    
    // if (body.metadata) {
    //   console.log(`  Metadata: ${JSON.stringify(body.metadata)}`);
    // }
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing log:', error);
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve logs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const service = searchParams.get('service');
  const level = searchParams.get('level');
  const limit = parseInt(searchParams.get('limit') || '100');
  
  let filteredLogs = [...logs];
  
  if (service) {
    filteredLogs = filteredLogs.filter(log => log.service === service);
  }
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  // Return the most recent logs first
  filteredLogs.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return NextResponse.json({
    logs: filteredLogs.slice(0, limit),
    total: filteredLogs.length,
    filtered: filteredLogs.length !== logs.length
  });
}

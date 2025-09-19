import { NextRequest, NextResponse } from 'next/server';

// TEMPORARY: Disable upload functionality completely
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: false, 
    error: 'Upload functionality temporarily disabled. Please contact administrator.' 
  }, { status: 503 });
}

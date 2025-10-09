import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function postHandler(request: NextRequest) {
  try {
    console.log('=== Extract ZIPs POST Start ===');
    
    // This endpoint is disabled in production (Vercel has read-only filesystem)
    // ZIP files are now stored directly in Supabase Storage
    return NextResponse.json({
      success: false,
      message: 'This endpoint is disabled in production. ZIP files are stored in Supabase Storage.',
      note: 'ZIP extraction is no longer needed - files are served directly from storage'
    }, { status: 501 }); // 501 Not Implemented
    
  } catch (error: any) {
    console.error('=== Extract ZIPs Error ===', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Extraction failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);


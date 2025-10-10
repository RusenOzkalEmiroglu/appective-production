import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }
    
    // Güvenlik için sadece interactive_mastheads_zips klasörüne erişim izni
    if (!filePath.startsWith('/interactive_mastheads_zips/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    try {
      await fs.access(fullPath);
      return NextResponse.json({ exists: true, path: filePath });
    } catch {
      return NextResponse.json({ exists: false, path: filePath });
    }
  } catch (error) {
    console.error('File check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

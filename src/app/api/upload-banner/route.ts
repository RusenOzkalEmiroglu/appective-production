import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function postHandler(request: NextRequest) {
  try {
    console.log('=== Upload Banner POST Start ===');
    
    // Check environment variables first
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Environment check:', {
      hasServiceRoleKey: !!serviceRoleKey,
      serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'undefined'
    });

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    console.log('Banner upload request details:', {
      hasFile: !!file,
      fileName: file?.name || 'none',
      fileSize: file?.size || 0
    });

    if (!file) {
      console.log('No file uploaded for banner');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Check file size (limit to 10MB for banners)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB for banners.' 
      }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Dosya adını temizle ve benzersiz yap
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${cleanFileName}`;
      
      // Storage path: images/banner/filename
      const storagePath = `images/banner/${fileName}`;
      
      const { data, error } = await supabaseAdmin.storage
        .from('appective-files')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('appective-files')
        .getPublicUrl(storagePath);

      console.log('Banner uploaded successfully to Supabase:', { storagePath, publicUrl });
      
      return NextResponse.json({ 
        success: true,
        message: 'Banner uploaded successfully', 
        url: publicUrl 
      });
      
    } catch (uploadError: any) {
      console.error('Banner upload to Supabase failed:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

  } catch (error: any) {
    console.error('=== Banner Upload Error ===', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      success: false,
      error: error?.message || 'File upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);

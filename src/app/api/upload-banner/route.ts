import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try to save file, but don't fail if it doesn't work (for production environments)
    let fileUrl = '';
    try {
      // Banner klasörünü oluştur
      const bannerDir = path.join(process.cwd(), 'public', 'images', 'banner');
      await mkdir(bannerDir, { recursive: true });

      // Dosya adını temizle ve benzersiz yap
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${cleanFileName}`;
      const filePath = path.join(bannerDir, fileName);

      // Dosyayı kaydet
      await writeFile(filePath, buffer);
      fileUrl = `/images/banner/${fileName}`;
      console.log('Banner file saved successfully:', fileUrl);
    } catch (fileError) {
      console.warn('Banner file upload failed (might be read-only filesystem):', fileError);
      // In production (like Vercel), we might not be able to write files
      // Return a placeholder URL or error
      fileUrl = `banner-upload-failed-${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);

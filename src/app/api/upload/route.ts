import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

async function uploadHandler(request: NextRequest) {
  console.log('🔄 Upload handler started');
  
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const category = data.get('category') as string || 'uncategorized';
    const brand = data.get('brand') as string || 'unknown';
    const type = data.get('type') as string || 'preview';
    const isZip = (data.get('isZip') as string) === 'true';

    console.log('📁 Upload params:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      category, 
      brand, 
      type, 
      isZip 
    });

    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // Sanitize category and brand for safe file paths
    const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const sanitizedBrand = brand.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueId = uuidv4();
    const uniqueFilename = `${uniqueId}.${fileExtension}`;

    // Define storage bucket and path
    let bucketName: string;
    let storagePath: string;
    
    if (isZip) {
      // For ZIP files (HTML5 ads) - we'll just store the ZIP file
      bucketName = 'interactive-mastheads';
      storagePath = `${sanitizedCategory}/${sanitizedBrand}/${uniqueFilename}`;
    } else {
      // For images
      bucketName = 'uploads';
      storagePath = uniqueFilename;
    }

    console.log('☁️ Uploading to Supabase Storage:', { bucketName, storagePath });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      return NextResponse.json({ 
        success: false, 
        error: `Upload failed: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;
    console.log('✅ Upload successful:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      filePath: publicUrl,
      url: publicUrl
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred during upload.' 
    }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(uploadHandler);

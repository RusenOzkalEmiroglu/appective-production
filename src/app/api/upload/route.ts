import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function generateSafeName(originalName: string): string {
  const clean = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  
  // Extract extension manually without using path module
  const lastDotIndex = clean.lastIndexOf('.');
  const ext = lastDotIndex > 0 ? clean.substring(lastDotIndex) : '';
  const base = lastDotIndex > 0 ? clean.substring(0, lastDotIndex) : clean;
  
  return `${base}-${stamp}-${rand}${ext}`;
}

function generateHash(length = 16): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function saveImageToSupabase(file: File, category: string, brand: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = generateSafeName(file.name);
  const fileName = safeName.startsWith('preview-') ? safeName : `preview-${safeName}`;
  
  // Storage path: images/interactive-mastheads/category/brand/filename
  const storagePath = `images/interactive-mastheads/${category}/${brand}/${fileName}`;
  
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

  console.log('Image uploaded successfully:', { storagePath, publicUrl });
  return { filePath: publicUrl };
}

async function saveZipToSupabase(file: File, category: string, brand: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const hash = generateHash(12);
  const folderName = `popup-html5-${hash}`;
  
  console.log('Extracting ZIP and uploading files to Supabase Storage...');

  try {
    // Extract ZIP in memory
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    console.log(`Found ${zipEntries.length} files in ZIP`);
    
    let indexHtmlFound = false;
    const uploadedFiles: string[] = [];

    // Upload each file from the ZIP to Supabase Storage
    for (const entry of zipEntries) {
      // Skip directories and system files
      if (entry.isDirectory || entry.entryName.startsWith('__MACOSX') || entry.entryName.startsWith('.')) {
        continue;
      }

      const fileName = entry.entryName;
      const fileData = entry.getData();
      
      // Check if this is index.html
      if (fileName.toLowerCase() === 'index.html') {
        indexHtmlFound = true;
      }
      
      // Storage path: html5-ads/category/brand/foldername/filename
      const storagePath = `html5-ads/${category}/${brand}/${folderName}/${fileName}`;
      
      // CRITICAL: Use application/octet-stream for ALL files
      // This bypasses Supabase bucket MIME type restrictions
      // Browser will still interpret files correctly based on URL extension
      const contentType = 'application/octet-stream';

      // Upload file to Supabase - use appective-files bucket
      const { error } = await supabaseAdmin.storage
        .from('appective-files')
        .upload(storagePath, fileData, {
          contentType,
          upsert: true,
          cacheControl: '3600' // 1 hour cache
        });

      if (error) {
        console.error(`Error uploading ${fileName}:`, error);
        throw new Error(`Failed to upload ${fileName}: ${error.message}`);
      }

      uploadedFiles.push(storagePath);
      console.log(`Uploaded: ${storagePath}`);
    }

    if (!indexHtmlFound) {
      // If no index.html, look for any HTML file and use it
      const htmlFile = uploadedFiles.find(f => f.endsWith('.html'));
      if (!htmlFile) {
        throw new Error('No HTML file found in ZIP archive');
      }
      console.log('Warning: No index.html found, using first HTML file:', htmlFile);
    }

    // Get public URL for index.html
    const indexPath = `html5-ads/${category}/${brand}/${folderName}/index.html`;
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('appective-files')
      .getPublicUrl(indexPath);

    console.log('ZIP extracted and uploaded successfully:', { 
      folder: folderName, 
      filesUploaded: uploadedFiles.length,
      indexUrl: publicUrl 
    });
    
    return { 
      filePath: publicUrl,
      htmlUrl: publicUrl,
      folder: folderName,
      filesCount: uploadedFiles.length
    };
    
  } catch (error: any) {
    console.error('Error extracting ZIP:', error);
    throw new Error(`ZIP extraction failed: ${error?.message || 'Unknown error'}`);
  }
}

async function postHandler(request: NextRequest) {
  try {
    console.log('=== Upload POST Start ===');
    
    // Check environment variables first
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    console.log('Environment check:', {
      hasServiceRoleKey: !!serviceRoleKey,
      hasSupabaseUrl: !!supabaseUrl,
      serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'undefined'
    });

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Missing required environment variables');
    }

    const formData = await request.formData();
    const file = formData.get('file') as unknown as File | null;
    const categoryRaw = (formData.get('category') as string | null) || 'uncategorized';
    const brandRaw = (formData.get('brand') as string | null) || 'unknown';
    const type = (formData.get('type') as string | null) || 'preview';
    const isZip = ((formData.get('isZip') as string | null) || 'false') === 'true';

    console.log('Upload params:', { 
      hasFile: !!file, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      category: categoryRaw, 
      brand: brandRaw, 
      type, 
      isZip 
    });

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 50MB.' 
      }, { status: 413 });
    }

    // Normalize folder-safe values
    const category = categoryRaw.toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const brand = brandRaw.toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    console.log('Normalized values:', { category, brand });

    if (isZip) {
      // Expect a zip file for HTML5 ad
      const contentType = (file as any).type as string | undefined;
      if (contentType && !contentType.includes('zip') && !contentType.includes('application/zip')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Only ZIP files are allowed for HTML5 ad' 
        }, { status: 400 });
      }
      const result = await saveZipToSupabase(file, category, brand);
      console.log('ZIP upload result:', result);
      return NextResponse.json({ success: true, ...result });
    }

    // Image upload
    if (!(file as any).type?.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only image files are allowed' 
      }, { status: 400 });
    }
    
    const result = await saveImageToSupabase(file, category, brand);
    console.log('Image upload result:', result);
    return NextResponse.json({ success: true, ...result });
    
  } catch (error: any) {
    console.error('=== Upload Error ===', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);

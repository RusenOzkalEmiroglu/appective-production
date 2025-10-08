import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
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
  const zipFileName = `popup-html5-${hash}`;
  
  // Create local directory for extracted files
  const localDir = path.join(process.cwd(), 'public', 'interactive_mastheads_zips', category, brand, zipFileName);
  
  // Ensure directory exists
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  try {
    // Extract ZIP file
    const zip = new AdmZip(buffer);
    zip.extractAllTo(localDir, true);
    
    console.log('ZIP extracted successfully to:', localDir);
    
    // Check if index.html exists
    const indexPath = path.join(localDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      // Look for any HTML file in the root
      const files = fs.readdirSync(localDir);
      const htmlFile = files.find(file => file.toLowerCase().endsWith('.html'));
      
      if (htmlFile) {
        // Rename the HTML file to index.html
        const oldPath = path.join(localDir, htmlFile);
        fs.renameSync(oldPath, indexPath);
        console.log(`Renamed ${htmlFile} to index.html`);
      } else {
        throw new Error('No HTML file found in the ZIP archive');
      }
    }
    
    // Return the path to the HTML file
    const htmlPath = `/interactive_mastheads_zips/${category}/${brand}/${zipFileName}/index.html`;
    console.log('HTML path created:', htmlPath);
    
    return { filePath: htmlPath };
    
  } catch (error: any) {
    console.error('Error extracting ZIP:', error);
    // Clean up directory if extraction failed
    if (fs.existsSync(localDir)) {
      fs.rmSync(localDir, { recursive: true, force: true });
    }
    throw new Error(`ZIP extraction failed: ${error?.message || 'Unknown error'}`);
  }
}

// Helper function to extract existing ZIP files
async function extractExistingZipFiles() {
  const zipDir = path.join(process.cwd(), 'public', 'interactive_mastheads_zips');
  
  if (!fs.existsSync(zipDir)) {
    console.log('No interactive_mastheads_zips directory found');
    return;
  }

  const extractedFiles: string[] = [];
  
  // Recursively find all ZIP files
  function findZipFiles(dir: string) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findZipFiles(fullPath);
      } else if (item.toLowerCase().endsWith('.zip') && item.startsWith('temp-')) {
        extractedFiles.push(fullPath);
      }
    }
  }
  
  findZipFiles(zipDir);
  
  console.log(`Found ${extractedFiles.length} ZIP files to extract`);
  
  for (const zipPath of extractedFiles) {
    try {
      const zip = new AdmZip(zipPath);
      const zipDir = path.dirname(zipPath);
      const zipName = path.basename(zipPath, '.zip');
      
      // Remove 'temp-' prefix
      const cleanName = zipName.replace(/^temp-/, '');
      const extractDir = path.join(zipDir, cleanName);
      
      // Create extraction directory
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }
      
      // Extract ZIP file
      zip.extractAllTo(extractDir, true);
      
      // Check if index.html exists, if not rename any HTML file
      const indexPath = path.join(extractDir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        const files = fs.readdirSync(extractDir);
        const htmlFile = files.find(file => file.toLowerCase().endsWith('.html'));
        
        if (htmlFile) {
          const oldPath = path.join(extractDir, htmlFile);
          fs.renameSync(oldPath, indexPath);
          console.log(`Renamed ${htmlFile} to index.html in ${extractDir}`);
        }
      }
      
      // Remove the ZIP file after successful extraction
      fs.unlinkSync(zipPath);
      console.log(`Successfully extracted and removed: ${zipPath}`);
      
    } catch (error) {
      console.error(`Error extracting ${zipPath}:`, error);
    }
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

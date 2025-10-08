import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function extractExistingZipFiles() {
  const zipDir = path.join(process.cwd(), 'public', 'interactive_mastheads_zips');
  
  if (!fs.existsSync(zipDir)) {
    console.log('No interactive_mastheads_zips directory found');
    return { success: false, message: 'No interactive_mastheads_zips directory found' };
  }

  const extractedFiles = [];
  const errors = [];
  
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
      errors.push({ file: zipPath, error: error.message });
    }
  }
  
  return {
    success: errors.length === 0,
    extractedCount: extractedFiles.length - errors.length,
    errorCount: errors.length,
    errors: errors
  };
}

async function postHandler(request: NextRequest) {
  try {
    console.log('=== Extract ZIPs POST Start ===');
    
    const result = await extractExistingZipFiles();
    
    return NextResponse.json({
      success: result.success,
      message: `Extracted ${result.extractedCount} ZIP files successfully`,
      extractedCount: result.extractedCount,
      errorCount: result.errorCount,
      errors: result.errors
    });
    
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


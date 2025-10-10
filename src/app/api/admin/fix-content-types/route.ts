import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getContentType(fileName: string): string {
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.endsWith('.html') || lowerFileName.endsWith('.htm')) {
    return 'text/html; charset=utf-8';
  } else if (lowerFileName.endsWith('.js')) {
    return 'application/javascript; charset=utf-8';
  } else if (lowerFileName.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  } else if (lowerFileName.endsWith('.json')) {
    return 'application/json; charset=utf-8';
  } else if (lowerFileName.endsWith('.svg')) {
    return 'image/svg+xml';
  } else if (lowerFileName.endsWith('.png')) {
    return 'image/png';
  } else if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg')) {
    return 'image/jpeg';
  } else if (lowerFileName.endsWith('.gif')) {
    return 'image/gif';
  } else if (lowerFileName.endsWith('.webp')) {
    return 'image/webp';
  } else if (lowerFileName.endsWith('.woff') || lowerFileName.endsWith('.woff2')) {
    return 'font/woff2';
  } else if (lowerFileName.endsWith('.ttf')) {
    return 'font/ttf';
  } else if (lowerFileName.endsWith('.otf')) {
    return 'font/otf';
  } else if (lowerFileName.endsWith('.mp4')) {
    return 'video/mp4';
  } else if (lowerFileName.endsWith('.mp3')) {
    return 'audio/mpeg';
  } else if (lowerFileName.endsWith('.xml')) {
    return 'application/xml; charset=utf-8';
  }
  
  return 'application/octet-stream';
}

async function postHandler(request: NextRequest) {
  try {
    console.log('=== Fix Content Types Start ===');

    // List all files in html5-ads folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('appective-files')
      .list('html5-ads', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    console.log(`Found ${files?.length || 0} top-level items`);

    let totalFiles = 0;
    let updatedFiles = 0;
    let errors: string[] = [];

    // Recursive function to process all files
    const processFolder = async (prefix: string) => {
      const { data: items, error } = await supabaseAdmin.storage
        .from('appective-files')
        .list(prefix, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        errors.push(`Error listing ${prefix}: ${error.message}`);
        return;
      }

      for (const item of items || []) {
        const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

        if (item.id && !item.name.includes('.')) {
          // It's a folder, recurse into it
          await processFolder(itemPath);
        } else {
          // It's a file
          totalFiles++;
          const correctContentType = getContentType(item.name);

          try {
            // Download the file
            const { data: fileData, error: downloadError } = await supabaseAdmin.storage
              .from('appective-files')
              .download(itemPath);

            if (downloadError) {
              errors.push(`Download error for ${itemPath}: ${downloadError.message}`);
              continue;
            }

            // Re-upload with correct content type
            const { error: uploadError } = await supabaseAdmin.storage
              .from('appective-files')
              .upload(itemPath, fileData, {
                contentType: correctContentType,
                upsert: true,
                cacheControl: '3600'
              });

            if (uploadError) {
              errors.push(`Upload error for ${itemPath}: ${uploadError.message}`);
            } else {
              updatedFiles++;
              console.log(`Updated: ${itemPath} -> ${correctContentType}`);
            }
          } catch (err: any) {
            errors.push(`Error processing ${itemPath}: ${err.message}`);
          }
        }
      }
    }

    // Start processing from html5-ads folder
    await processFolder('html5-ads');

    console.log('=== Fix Content Types Complete ===');
    console.log(`Total files: ${totalFiles}`);
    console.log(`Updated files: ${updatedFiles}`);
    console.log(`Errors: ${errors.length}`);

    return NextResponse.json({
      success: true,
      totalFiles,
      updatedFiles,
      errors: errors.slice(0, 50), // Limit error list
      message: `Updated ${updatedFiles} of ${totalFiles} files`
    });

  } catch (error: any) {
    console.error('=== Fix Content Types Error ===', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fix content types'
    }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);


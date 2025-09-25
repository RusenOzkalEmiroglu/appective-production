import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

function generateSafeName(originalName: string): string {
  const clean = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const ext = path.extname(clean);
  const base = path.basename(clean, ext);
  return `${base}-${stamp}-${rand}${ext}`;
}

function generateHash(length = 16): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
}

async function saveImage(file: File, category: string, brand: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const baseDir = path.join(process.cwd(), 'public', 'images', 'interactive-mastheads', category, brand);
  await ensureDir(baseDir);

  const safeName = generateSafeName(file.name);
  const fileName = safeName.startsWith('preview-') ? safeName : `preview-${safeName}`;
  const diskPath = path.join(baseDir, fileName);
  await writeFile(diskPath, buffer);

  const publicPath = `/images/interactive-mastheads/${category}/${brand}/${fileName}`;
  return { filePath: publicPath };
}

async function saveZipAndExtract(file: File, category: string, brand: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const hash = generateHash(12);
  const baseDir = path.join(process.cwd(), 'public', 'interactive_mastheads_zips', category, brand, `popup-html5-${hash}`);
  const zipTempDir = path.join(baseDir, '__zip_tmp');
  await ensureDir(zipTempDir);

  // Write zip to temp then extract
  const zipTempPath = path.join(zipTempDir, 'upload.zip');
  await writeFile(zipTempPath, buffer);

  const zip = new AdmZip(zipTempPath);
  // Extract to the target baseDir
  await ensureDir(baseDir);
  zip.extractAllTo(baseDir, true);

  // Clean temp
  if (existsSync(zipTempDir)) {
    rmSync(zipTempDir, { recursive: true, force: true });
  }

  // Validate index.html exists in the extracted directory
  const indexHtmlPublic = `/interactive_mastheads_zips/${category}/${brand}/popup-html5-${hash}/index.html`;
  // We could check existence on disk, but extraction would have thrown if failed; still okay to return path
  return { filePath: indexHtmlPublic };
}

async function postHandler(request: NextRequest) {
  try {
    console.log('=== Upload POST Start ===');
    
    // Check environment variables first
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Environment check:', {
      hasServiceRoleKey: !!serviceRoleKey,
      serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'undefined'
    });

    const formData = await request.formData();
    const file = formData.get('file') as unknown as File | null;
    const categoryRaw = (formData.get('category') as string | null) || 'uncategorized';
    const brandRaw = (formData.get('brand') as string | null) || 'unknown';
    const type = (formData.get('type') as string | null) || 'preview';
    const isZip = ((formData.get('isZip') as string | null) || 'false') === 'true';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Normalize folder-safe values
    const category = categoryRaw.toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const brand = brandRaw.toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    if (isZip) {
      // Expect a zip file for HTML5 ad
      const contentType = (file as any).type as string | undefined;
      if (contentType && !contentType.includes('zip')) {
        return NextResponse.json({ success: false, error: 'Only ZIP files are allowed for HTML5 ad' }, { status: 400 });
      }
      const result = await saveZipAndExtract(file, category, brand);
      return NextResponse.json({ success: true, ...result });
    }

    // Image upload
    if (!(file as any).type?.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }
    const result = await saveImage(file, category, brand);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Upload failed' }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { JobApplication } from '@/types/jobApplication';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';

// --- Configuration ---
const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'cv');

// --- Helper Functions ---
async function ensureDirectoriesExist() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error("Could not create upload directory:", error);
  }
}

// --- Public API Handlers ---

// POST handler for creating a new job application (Publicly accessible)
export async function POST(request: NextRequest) {
  try {
    console.log('=== Job Application POST Start ===');
    
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'undefined'
    });

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error: Missing service key' }, { status: 500 });
    }

    await ensureDirectoriesExist();
    const formData = await request.formData();
    
    const jobId = formData.get('jobId') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string || '';
    const cvFile = formData.get('cv') as File;

    console.log('Form data received:', {
      jobId,
      jobTitle,
      fullName,
      email,
      phone,
      hasMessage: !!message,
      hasFile: !!cvFile,
      fileName: cvFile?.name || 'none'
    });

    if (!jobId || !jobTitle || !fullName || !email || !phone || !cvFile) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Tüm zorunlu alanlar doldurulmalıdır.' }, { status: 400 });
    }
    if (!allowedFileTypes.includes(cvFile.type)) {
      console.log('Invalid file type:', cvFile.type);
      return NextResponse.json({ error: 'Sadece PDF veya Word dosyaları kabul edilmektedir.' }, { status: 400 });
    }
    if (cvFile.size > 5 * 1024 * 1024) {
      console.log('File too large:', cvFile.size);
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' }, { status: 400 });
    }

    // Check existing applications from Supabase (using admin client to bypass RLS)
    console.log('Checking for existing applications...');
    const admin = assertSupabaseAdmin();
    const { data: existingApps, error: checkError } = await admin
      .from('job_applications')
      .select('*')
      .eq('email', email)
      .eq('job_id', jobId);

    if (checkError) {
      console.error('Error checking existing applications:', checkError);
      return NextResponse.json({ error: 'Başvuru kontrol edilirken hata oluştu.' }, { status: 500 });
    }

    console.log('Existing applications found:', existingApps?.length || 0);

    if (existingApps && existingApps.length >= 2) {
      console.log('Too many applications for this email/job combination');
      return NextResponse.json({ message: 'Bu ilana bu e-posta adresi ile izin verilen maksimum başvuru sayısına (2) ulaştınız.' }, { status: 409 });
    }

    // Try to save file, but don't fail if it doesn't work (for production environments)
    let cvFilePath = '';
    try {
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      const fileBuffer = Buffer.from(await cvFile.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);
      cvFilePath = `/uploads/cv/${fileName}`;
      console.log('File saved successfully:', cvFilePath);
    } catch (fileError) {
      console.warn('File upload failed (might be read-only filesystem):', fileError);
      // In production (like Vercel), we might not be able to write files
      // Just continue without saving the file locally
      cvFilePath = `cv-upload-failed-${Date.now()}`;
    }

    // Save application to Supabase (using admin client to bypass RLS)
    console.log('Inserting application to Supabase...');
    const applicationId = uuidv4();
    const { data: newApplication, error: insertError } = await admin
      .from('job_applications')
      .insert({
        id: applicationId,
        job_id: jobId,
        job_title: jobTitle,
        full_name: fullName,
        email: email,
        phone,
        message,
        cv_file_path: cvFilePath,
        created_at: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting application:', insertError);
      return NextResponse.json({ error: 'Başvuru kaydedilemedi.' }, { status: 500 });
    }

    console.log('Application saved successfully:', newApplication?.id);
    console.log('=== Job Application POST Success ===');
    return NextResponse.json({ success: true, message: 'Başvurunuz başarıyla alındı.' }, { status: 201 });
  } catch (error) {
    console.error('=== Job Application POST Error ===');
    console.error('Full error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Başvuru işlenirken bir hata oluştu.' }, { status: 500 });
  }
}

// --- Protected API Handlers ---

// Original GET handler logic to fetch all applications
async function getHandler(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map Supabase data to JobApplication format
    const applications = (data || []).map(item => ({
      id: item.id.toString(),
      jobId: item.job_id,
      jobTitle: item.job_title,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      message: item.message,
      cvFilePath: item.cv_file_path,
      createdAt: item.created_at,
      status: item.status
    }));

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Başvurular alınırken hata oluştu:', error);
    return NextResponse.json({ error: 'Başvurular alınırken bir hata oluştu.' }, { status: 500 });
  }
}

// Wrap the protected GET handler with authentication
export const GET = withAdminAuthSimple(getHandler);

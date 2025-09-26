// src/app/api/job-openings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { JobOpening } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// Supabase'den job openings verilerini al
async function getJobOpeningsFromSupabase(): Promise<JobOpening[]> {
  try {
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase job openings fetch error:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching job openings from Supabase:', error);
    throw error;
  }
}

// GET handler to fetch all job openings - Publicly accessible
// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getJobOpeningsFromSupabase();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading job openings data' }, { status: 500 });
  }
}

// --- Protected Handler ---

// POST handler to create new job opening via Supabase
async function postHandler(request: NextRequest) {
  try {
    const newJob = await request.json();
    
    if (!newJob.title || !newJob.full_title) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique ID for new job
    const generateId = () => {
      return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    const jobWithId = {
      ...newJob,
      id: generateId(),
    };
    
    // Use admin client for mutations to bypass RLS safely (endpoint is auth-protected)
    const admin = assertSupabaseAdmin();
    const { data, error } = await admin
      .from('job_openings')
      .insert([jobWithId])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ message: 'Error creating job opening' }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create job opening:', error);
    return NextResponse.json({ message: 'Error creating job opening' }, { status: 500 });
  }
}

// Wrap the protected handler with authentication. This is a static route, so we use `withAdminAuthSimple`.
export const POST = withAdminAuthSimple(postHandler);

// PUT handler to update a job opening (protected)
async function putHandler(request: NextRequest) {
  try {
    const updatedJob = await request.json();
    if (!updatedJob.id) {
      return NextResponse.json({ message: 'Job ID is required' }, { status: 400 });
    }

    const admin = assertSupabaseAdmin();
    const { data, error } = await admin
      .from('job_openings')
      .update(updatedJob)
      .eq('id', updatedJob.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ message: 'Error updating job opening' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update job opening:', error);
    return NextResponse.json({ message: 'Error updating job opening' }, { status: 500 });
  }
}

// DELETE handler to remove a job opening (protected)
async function deleteHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Job ID is required' }, { status: 400 });
    }

    const admin = assertSupabaseAdmin();
    const { error } = await admin
      .from('job_openings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ message: 'Error deleting job opening' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job opening deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete job opening:', error);
    return NextResponse.json({ message: 'Error deleting job opening' }, { status: 500 });
  }
}

export const PUT = withAdminAuthSimple(putHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);

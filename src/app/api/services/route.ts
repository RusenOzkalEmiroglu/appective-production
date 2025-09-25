import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// GET handler - fetch services from Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching services from Supabase:', error);
      return NextResponse.json({ message: 'Failed to fetch services data' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error reading services data:', error);
    return NextResponse.json({ message: 'Failed to read services data' }, { status: 500 });
  }
}

// --- Protected Handlers ---

// POST handler - add service to Supabase
async function postHandler(request: NextRequest) {
  try {
    console.log('=== Services POST Start ===');
    
    // Check environment variables first
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Environment check:', {
      hasServiceRoleKey: !!serviceRoleKey,
      serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'undefined'
    });

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
      return NextResponse.json({ message: 'Server configuration error: Missing service key' }, { status: 500 });
    }

    const newService = await request.json();
    console.log('Service data received:', {
      id: newService.id,
      name: newService.name,
      hasDescription: !!newService.description,
      hasIcon: !!newService.icon,
      hasImageUrl: !!newService.image_url
    });

    if (!newService || typeof newService.name !== 'string' || !newService.name.trim()) {
      console.log('Invalid service data - missing or invalid name');
      return NextResponse.json({ message: 'Invalid service data. Name is required.' }, { status: 400 });
    }

    console.log('Inserting service to Supabase...');
    const admin = assertSupabaseAdmin();
    const { data, error } = await admin
      .from('services')
      .insert([newService])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding service to Supabase:', error);
      return NextResponse.json({ message: 'Failed to add service' }, { status: 500 });
    }

    console.log('Service saved successfully:', data?.id);
    console.log('=== Services POST Success ===');
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('=== Services POST Error ===');
    console.error('Full error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error adding service', error: errorMessage }, { status: 500 });
  }
}

// DELETE handler - delete service from Supabase
async function deleteHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ message: 'Service ID is required' }, { status: 400 });
    }

    const admin = assertSupabaseAdmin();
    const { error } = await admin
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting service from Supabase:', error);
      return NextResponse.json({ message: 'Failed to delete service' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing DELETE request for services:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error deleting service', error: errorMessage }, { status: 500 });
  }
}

// PUT handler - update service in Supabase
async function putHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ message: 'Service ID is required' }, { status: 400 });
    }

    const updatedService = await request.json();

    if (!updatedService || typeof updatedService.name !== 'string' || !updatedService.name.trim()) {
      return NextResponse.json({ message: 'Invalid service data. Name is required.' }, { status: 400 });
    }

    const admin = assertSupabaseAdmin();
    const { data, error } = await admin
      .from('services')
      .update(updatedService)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating service in Supabase:', error);
      return NextResponse.json({ message: 'Failed to update service' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error processing PUT request for services:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error updating service', error: errorMessage }, { status: 500 });
  }
}

// Wrap the handlers with authentication
export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);
export const PUT = withAdminAuthSimple(putHandler);

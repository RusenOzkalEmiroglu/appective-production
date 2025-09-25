import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';

interface RouteParams {
  params: { id: string };
}

// Public GET: fetch single service by id from Supabase
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116' /* No rows */) {
        return NextResponse.json({ message: 'Service not found' }, { status: 404 });
      }
      console.error(`Error fetching service ${id} from Supabase:`, error);
      return NextResponse.json({ message: 'Failed to fetch service' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error processing GET request for service ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching service' }, { status: 500 });
  }
}

// Protected PUT: update service
async function putHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
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
      console.error(`Error updating service ${id} in Supabase:`, error);
      return NextResponse.json({ message: 'Failed to update service' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error processing PUT request for service ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating service' }, { status: 500 });
  }
}

// Protected DELETE: delete service
async function deleteHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const admin = assertSupabaseAdmin();
    const { error } = await admin
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting service ${id} from Supabase:`, error);
      return NextResponse.json({ message: 'Failed to delete service' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error processing DELETE request for service ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting service' }, { status: 500 });
  }
}

export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);

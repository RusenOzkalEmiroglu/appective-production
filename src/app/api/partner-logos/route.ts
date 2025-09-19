import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// GET handler to fetch all partner logos
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('partner_logos')
      .select('*')
      .order('id');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch partner logos:', error);
    return NextResponse.json({ message: 'Failed to fetch partner logos' }, { status: 500 });
  }
}

// POST handler to add a new partner logo (with auth middleware)
async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_id, alt, image_path, url } = body; // Updated to use image_path

    if (!category_id || !alt || !image_path) {
      return NextResponse.json({ message: 'category_id, alt, and image_path are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('partner_logos')
      .insert([{
        category_id: parseInt(category_id),
        alt,
        image_path, // Updated field name
        url: url || null
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ message: 'Database error', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Logo created successfully', data }, { status: 201 });
  } catch (error) {
    console.error('Error creating logo:', error);
    return NextResponse.json({ message: 'Error creating logo' }, { status: 500 });
  }
}

// DELETE handler to remove a partner logo (with auth middleware)
async function deleteHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('partner_logos')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ message: 'Database error', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Logo deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json({ message: 'Error deleting logo' }, { status: 500 });
  }
}

// Apply auth middleware to POST and DELETE
export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);

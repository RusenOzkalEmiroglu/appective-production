import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';

// GET handler - fetch all partner categories (publicly accessible)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('partner_categories')
      .select('*')
      .order('id');

    if (error) {
      console.error('Partner categories GET error:', error);
      return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching partner categories:', error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}

// POST handler - create new partner category (protected with admin auth)
async function postHandler(request: NextRequest) {
  try {
    console.log('=== Partner Categories POST Start ===');
    
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

    const { name, original_path } = await request.json();
    
    console.log('Category data received:', {
      name,
      original_path
    });

    if (!name || !original_path) {
      console.log('Missing required fields');
      return NextResponse.json({ message: 'Name and original_path are required' }, { status: 400 });
    }

    // Use admin client to bypass RLS
    console.log('Inserting category to Supabase...');
    const admin = assertSupabaseAdmin();
    const { data, error } = await admin
      .from('partner_categories')
      .insert([{
        name,
        original_path
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting partner category:', error);
      return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
    }

    console.log('Partner category saved successfully:', data?.id);
    console.log('=== Partner Categories POST Success ===');
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('=== Partner Categories POST Error ===');
    console.error('Full error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ message: 'Error creating category' }, { status: 500 });
  }
}

// DELETE handler - delete partner category (protected with admin auth)
async function deleteHandler(request: NextRequest) {
  try {
    console.log('=== Partner Categories DELETE Start ===');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      console.log('Missing category ID');
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    console.log('Deleting category:', id);
    const admin = assertSupabaseAdmin();
    const { error } = await admin
      .from('partner_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting partner category:', error);
      return NextResponse.json({ message: 'Failed to delete category' }, { status: 500 });
    }

    console.log('Partner category deleted successfully:', id);
    console.log('=== Partner Categories DELETE Success ===');
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('=== Partner Categories DELETE Error ===');
    console.error('Full error details:', error);
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}

// PUT handler - update partner category (protected with admin auth)
async function putHandler(request: NextRequest) {
  try {
    console.log('=== Partner Categories PUT Start ===');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { name, original_path } = await request.json();

    if (!id) {
      console.log('Missing category ID');
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    if (!name || !original_path) {
      console.log('Missing required fields');
      return NextResponse.json({ message: 'Name and original_path are required' }, { status: 400 });
    }

    console.log('Updating category:', id, { name, original_path });
    const admin = assertSupabaseAdmin();
    const { data, error } = await admin
      .from('partner_categories')
      .update({
        name,
        original_path
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating partner category:', error);
      return NextResponse.json({ message: 'Failed to update category' }, { status: 500 });
    }

    console.log('Partner category updated successfully:', data?.id);
    console.log('=== Partner Categories PUT Success ===');
    return NextResponse.json(data);
  } catch (error) {
    console.error('=== Partner Categories PUT Error ===');
    console.error('Full error details:', error);
    return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);
export const PUT = withAdminAuthSimple(putHandler);

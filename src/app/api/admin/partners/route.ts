import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Check if user is admin
    const isAdmin = user.app_metadata?.role === 'admin' || 
                   user.user_metadata?.role === 'admin' || 
                   user.email?.endsWith('@appective.net');

    return isAdmin ? user : null;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { category_id, alt, image_path, url } = await request.json();

    // Validate required fields
    if (!category_id || !alt || !image_path) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Insert logo using authenticated user's session
    const { data, error } = await supabase
      .from('partner_logos')
      .insert([{
        category_id: parseInt(category_id),
        alt,
        image_path,
        url: url || null
      }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const logoId = searchParams.get('id');

    if (!logoId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Logo ID is required' 
      }, { status: 400 });
    }

    // Delete logo using authenticated user's session
    const { error } = await supabase
      .from('partner_logos')
      .delete()
      .eq('id', parseInt(logoId));

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

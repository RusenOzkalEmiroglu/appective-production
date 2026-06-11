import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// --- Public Handlers ---

// GET handler to fetch current banner data from Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('top_banner')
      .select('id, background_image, button_link')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) {
      console.error('Banner fetch error:', error);
      return NextResponse.json({ imageUrl: null, targetUrl: null });
    }
    
    if (data) {
      return NextResponse.json({
        imageUrl: data.background_image,
        targetUrl: data.button_link
      });
    }
    
    return NextResponse.json({ imageUrl: null, targetUrl: null });
  } catch (error) {
    console.error('Banner yüklenirken hata:', error);
    return NextResponse.json({ imageUrl: null, targetUrl: null });
  }
}

// --- Protected Handlers ---

// POST handler for updating banner data in Supabase
// Accepts either:
//   - JSON body: { background_image, button_link } (used by AdminTopBannerManagement after image upload)
//   - FormData body: { file?, targetUrl } (legacy formData path; file is used to build a local path only)
async function postHandler(request: NextRequest) {
  try {
    const admin = assertSupabaseAdmin();

    let imageUrl: string | null = null;
    let targetUrl: string = '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // JSON path: component already uploaded the image and sends the final URL
      const body = await request.json();
      imageUrl = body.background_image ?? null;
      targetUrl = body.button_link ?? '';
    } else {
      // FormData path (legacy)
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      targetUrl = (formData.get('targetUrl') as string) || '';

      // Get current data (read via anon is fine)
      const { data: currentData } = await supabase
        .from('top_banner')
        .select('background_image')
        .eq('id', 1)
        .maybeSingle();

      imageUrl = currentData?.background_image || null;

      if (file) {
        const uniqueFilename = `${Date.now()}-${file.name}`;
        imageUrl = `/images/banner/${uniqueFilename}`;
      }
    }

    // Update or insert banner data via service-role
    const updateData = {
      background_image: imageUrl,
      button_link: targetUrl
    };

    const { data: existingRecord } = await supabase
      .from('top_banner')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    let result;
    if (existingRecord) {
      // Update existing record via admin client
      result = await admin
        .from('top_banner')
        .update(updateData)
        .eq('id', 1)
        .select();
    } else {
      // Insert new record via admin client
      const insertData = {
        id: 1,
        title: 'Welcome to Appective',
        subtitle: 'Digital Marketing & Development',
        description: 'We create innovative digital solutions for your business',
        button_text: 'Get Started',
        ...updateData
      };
      result = await admin
        .from('top_banner')
        .insert(insertData)
        .select();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true, imageUrl, targetUrl });
  } catch (error: any) {
    console.error('Failed to update banner:', error);
    return NextResponse.json({ error: 'Failed to update banner', details: error.message }, { status: 500 });
  }
}

// DELETE handler for removing banner from Supabase
async function deleteHandler(request: NextRequest) {
  try {
    const admin = assertSupabaseAdmin();
    const { error } = await admin
      .from('top_banner')
      .update({ background_image: null, button_link: null })
      .eq('id', 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner', details: error.message }, { status: 500 });
  }
}

// Wrap protected handlers with authentication
export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);

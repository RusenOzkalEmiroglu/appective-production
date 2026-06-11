import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
import { supabase } from '@/lib/supabase';
import { MastheadItem } from '@/types/masthead';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';

// --- Public Handlers ---

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('interactive_mastheads')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    // Supabase verilerini MastheadItem formatına dönüştür
    const formattedData = (data || []).map((item: any) => ({
      id: item.id,
      category: item.category,
      brand: item.brand,
      title: item.title,
      image: item.image,
      popupHtmlPath: item.popup_html_path,
      popupTitle: item.popup_title,
      popupDescription: item.popup_description || '',
      bannerDetails: {
        size: item.banner_size || '',
        platforms: item.banner_platforms || ''
      }
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('GET /api/mastheads error:', error);
    return NextResponse.json({ message: 'Error fetching masthead data' }, { status: 500 });
  }
}

// --- Protected Handlers ---

// maps incoming MastheadItem (camelCase) to DB columns (snake_case)
function toRow(m: any) {
  return {
    ...(m.id ? { id: m.id } : {}),
    category: m.category,
    brand: m.brand,
    title: m.title,
    image: m.image,
    popup_html_path: m.popupHtmlPath,
    popup_title: m.popupTitle,
    popup_description: m.popupDescription ?? null,
    banner_size: m.bannerDetails?.size ?? m.banner_size ?? null,
    banner_platforms: m.bannerDetails?.platforms ?? m.banner_platforms ?? null,
  };
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const admin = assertSupabaseAdmin();
    const row = toRow(body);
    if (!row.id) row.id = `masthead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const { data, error } = await admin.from('interactive_mastheads').upsert(row).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error('mastheads POST error:', e);
    return NextResponse.json({ message: 'Failed to save masthead', error: e.message }, { status: 500 });
  }
}

async function deleteHandler(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });
    const admin = assertSupabaseAdmin();
    const { error } = await admin.from('interactive_mastheads').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('mastheads DELETE error:', e);
    return NextResponse.json({ message: 'Failed to delete masthead', error: e.message }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);

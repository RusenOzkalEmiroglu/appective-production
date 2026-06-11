import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('id');
  if (error) {
    console.error('social-links GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch social links' }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// Replace-all save
async function postHandler(request: NextRequest) {
  try {
    const links = await request.json();
    if (!Array.isArray(links)) {
      return NextResponse.json({ message: 'Expected an array of links' }, { status: 400 });
    }
    const admin = assertSupabaseAdmin();
    const { error: delErr } = await admin.from('social_links').delete().neq('id', 0);
    if (delErr) throw delErr;
    if (links.length > 0) {
      const rows = links.map((l: any) => ({ platform: l.platform, url: l.url }));
      const { error: insErr } = await admin.from('social_links').insert(rows);
      if (insErr) throw insErr;
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('social-links POST error:', e);
    return NextResponse.json({ message: 'Failed to save social links', error: e.message }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);

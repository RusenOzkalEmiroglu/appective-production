import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .order('id');
  if (error) {
    console.error('contact-info GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch contact info' }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// Upsert each contact-info row provided
async function postHandler(request: NextRequest) {
  try {
    const rows = await request.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ message: 'Expected an array of contact rows' }, { status: 400 });
    }
    const admin = assertSupabaseAdmin();
    for (const row of rows) {
      const payload = { icon: row.icon, title: row.title, details: row.details, link: row.link ?? null };
      if (row.id) {
        const { error } = await admin.from('contact_info').update(payload).eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await admin.from('contact_info').insert(payload);
        if (error) throw error;
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('contact-info POST error:', e);
    return NextResponse.json({ message: 'Failed to save contact info', error: e.message }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);

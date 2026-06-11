import { NextRequest, NextResponse } from 'next/server';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Get all subscribers — admin-only
async function getHandler(): Promise<NextResponse> {
  try {
    const admin = assertSupabaseAdmin();
    const { data, error } = await admin
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    // Format for compatibility with existing frontend
    const formattedSubscribers = (data || []).map(sub => ({
      id: sub.id.toString(),
      email: sub.email,
      subscribedAt: sub.subscribed_at
    }));

    return NextResponse.json({ subscribers: formattedSubscribers }, { status: 200 });
  } catch (error) {
    console.error('Error reading newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// Add a new subscriber — public, but uses service-role so it works after anon-write is blocked
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta adresi' },
        { status: 400 }
      );
    }

    const admin = assertSupabaseAdmin();

    // Check if email already exists
    const { data: existingSubscriber } = await admin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 409 }
      );
    }

    // Create new subscriber
    const { data: newSubscriber, error } = await admin
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      subscriber: {
        id: newSubscriber.id.toString(),
        email: newSubscriber.email,
        subscribedAt: newSubscriber.subscribed_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Newsletter abonelik hatası:', error);
    return NextResponse.json(
      { error: 'Abone eklenemedi' },
      { status: 500 }
    );
  }
}

// Delete a subscriber — admin-only
async function deleteHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Abone ID\'leri gerekli' },
        { status: 400 }
      );
    }

    const admin = assertSupabaseAdmin();
    const { error } = await admin
      .from('newsletter_subscribers')
      .delete()
      .in('id', ids.map(id => parseInt(id)));

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Newsletter abonesi silme hatası:', error);
    return NextResponse.json(
      { error: 'Abone silinemedi' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuthSimple(getHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);

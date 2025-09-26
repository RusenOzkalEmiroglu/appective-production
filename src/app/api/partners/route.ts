import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('=== Partners API GET Start ===');
    
    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('partner_categories')
      .select('*')
      .order('id');
    
    console.log('Categories fetched:', {
      count: categoriesData?.length || 0,
      categories: categoriesData?.map(c => ({ id: c.id, name: c.name })) || []
    });
    
    if (categoriesError) {
      console.error('Categories error:', categoriesError);
      throw categoriesError;
    }

    // Fetch logos for each category
    const { data: logosData, error: logosError } = await supabase
      .from('partner_logos')
      .select('*')
      .order('id');
      
    console.log('Logos fetched:', {
      count: logosData?.length || 0,
      logos: logosData?.map(l => ({ id: l.id, category_id: l.category_id, alt: l.alt })) || []
    });
      
    if (logosError) {
      console.error('Logos error:', logosError);
      throw logosError;
    }

    // Combine categories with their logos
    const categoriesWithLogos = (categoriesData || []).map(category => ({
      id: category.id.toString(),
      name: category.name,
      originalPath: category.original_path,
      logos: (logosData || [])
        .filter(logo => logo.category_id === category.id)
        .map(logo => ({
          id: logo.id.toString(),
          alt: logo.alt,
          imagePath: logo.image_path,
          url: logo.url || undefined
        }))
    }));

    console.log('Final response:', {
      totalCategories: categoriesWithLogos.length,
      categoriesWithLogos: categoriesWithLogos.map(c => ({ 
        id: c.id, 
        name: c.name, 
        logoCount: c.logos.length 
      }))
    });
    console.log('=== Partners API GET Success ===');

    const response = NextResponse.json(categoriesWithLogos);
    
    // Force fresh data - prevent all caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Generate ETag based on data to force cache busting
    const dataHash = JSON.stringify(categoriesWithLogos).length + Date.now();
    response.headers.set('ETag', `"${dataHash}"`);
    
    // Vercel-specific headers to prevent edge caching
    response.headers.set('Vercel-CDN-Cache-Control', 'no-cache');
    response.headers.set('CDN-Cache-Control', 'no-cache');
    
    return response;

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch partners',
      message: error.message 
    }, { status: 500 });
  }
}

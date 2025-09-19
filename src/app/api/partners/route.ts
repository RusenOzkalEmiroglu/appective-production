import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('partner_categories')
      .select('*')
      .order('id');
    
    if (categoriesError) {
      console.error('Categories error:', categoriesError);
      throw categoriesError;
    }

    // Fetch logos for each category
    const { data: logosData, error: logosError } = await supabase
      .from('partner_logos')
      .select('*')
      .order('id');
      
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

    return NextResponse.json(categoriesWithLogos);

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch partners',
      message: error.message 
    }, { status: 500 });
  }
}

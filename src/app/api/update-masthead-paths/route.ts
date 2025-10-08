import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';

// Force dynamic rendering to avoid Vercel Edge Cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Mapping from Supabase zip URLs to local HTML paths
const pathMappings = [
  {
    zipUrl: "https://oqwlelnvdrproefwrowm.supabase.co/storage/v1/object/public/appective-files/interactive_mastheads_zips/home---decorati-on/schafer/popup-html5-893378a012bc.zip",
    htmlPath: "/interactive_mastheads_zips/home---decorati-on/schafer/popup-html5-893378a012bc/index.html"
  },
  {
    zipUrl: "https://oqwlelnvdrproefwrowm.supabase.co/storage/v1/object/public/appective-files/interactive_mastheads_zips/food---beverage/doritos---pepsi/popup-html5-b5debecb50d0.zip",
    htmlPath: "/interactive_mastheads_zips/food---beverage/doritos---pepsi/popup-html5-b5debecb50d0/index.html"
  },
  {
    zipUrl: "https://oqwlelnvdrproefwrowm.supabase.co/storage/v1/object/public/appective-files/interactive_mastheads_zips/fi-nance---banki-ng/tati-l-sepeti-/popup-html5-6b8a7917bef6.zip",
    htmlPath: "/interactive_mastheads_zips/fi-nance---banki-ng/tati-l-sepeti-/popup-html5-6b8a7917bef6/index.html"
  },
  {
    zipUrl: "https://oqwlelnvdrproefwrowm.supabase.co/storage/v1/object/public/appective-files/interactive_mastheads_zips/finance---banking/garanti--bankasi/popup-html5-aa64f97c5b23.zip",
    htmlPath: "/interactive_mastheads_zips/finance---banking/garanti--bankasi/popup-html5-aa64f97c5b23/index.html"
  },
  {
    zipUrl: "https://oqwlelnvdrproefwrowm.supabase.co/storage/v1/object/public/appective-files/interactive_mastheads_zips/fashion/under-armour/popup-html5-f567f780f711.zip",
    htmlPath: "/interactive_mastheads_zips/fashion/under-armour/popup-html5-f567f780f711/index.html"
  },
  {
    zipUrl: "https://oqwlelnvdrproefwrowm.supabase.co/storage/v1/object/public/appective-files/interactive_mastheads_zips/home/english-home/popup-html5-a21876e056df.zip",
    htmlPath: "/interactive_mastheads_zips/home/english-home/popup-html5-a21876e056df/index.html"
  }
];

async function postHandler(request: NextRequest) {
  try {
    console.log('=== Update Masthead Paths POST Start ===');
    
    const supabaseAdmin = assertSupabaseAdmin();
    
    // Fetch all masthead records
    const { data, error } = await supabaseAdmin
      .from('interactive_mastheads')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching data:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    console.log(`Found ${data.length} masthead records`);
    
    let updatedCount = 0;
    const updates = [];
    
    for (const record of data) {
      const popupPath = record.popup_html_path;
      
      // Check if this record needs updating
      const mapping = pathMappings.find(m => m.zipUrl === popupPath);
      
      if (mapping) {
        console.log(`Updating record ${record.id} (${record.title}):`);
        console.log(`  From: ${popupPath}`);
        console.log(`  To:   ${mapping.htmlPath}`);
        
        const { error: updateError } = await supabaseAdmin
          .from('interactive_mastheads')
          .update({ popup_html_path: mapping.htmlPath })
          .eq('id', record.id);
        
        if (updateError) {
          console.error(`Error updating record ${record.id}:`, updateError);
          updates.push({
            id: record.id,
            title: record.title,
            success: false,
            error: updateError.message
          });
        } else {
          console.log(`✓ Updated record ${record.id}`);
          updatedCount++;
          updates.push({
            id: record.id,
            title: record.title,
            success: true,
            oldPath: popupPath,
            newPath: mapping.htmlPath
          });
        }
      }
    }
    
    console.log(`Update completed! ${updatedCount} records updated.`);
    console.log('=== Update Masthead Paths POST Success ===');
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} masthead records`,
      updatedCount,
      updates
    });
    
  } catch (error: any) {
    console.error('=== Update Masthead Paths Error ===', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Update failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);

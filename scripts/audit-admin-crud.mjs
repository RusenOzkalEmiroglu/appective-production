// Safe live audit of admin DB write paths using the ANON key (exactly what the
// browser does). For each table the admin writes to, it inserts a clearly-marked
// dummy row, reads it back, then deletes it. No production data is modified.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local manually
const env = {};
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const supa = createClient(url, anon);
const admin = service ? createClient(url, service) : null;

const MARK = '__AUDIT_TEST__';
const results = [];

async function testCrud(label, table, row, { useAdmin = false } = {}) {
  const client = useAdmin ? admin : supa;
  if (useAdmin && !admin) { results.push([label, 'SKIP', 'no service key locally']); return; }
  let insertedId = null;
  try {
    const { data, error } = await client.from(table).insert(row).select();
    if (error) { results.push([label, 'FAIL-INSERT', error.message]); return; }
    insertedId = data?.[0]?.id;
    // read back
    const { data: rd, error: re } = await client.from(table).select('*').eq('id', insertedId).single();
    if (re) { results.push([label, 'FAIL-READ', re.message]); }
    else {
      // delete
      const { error: de } = await client.from(table).delete().eq('id', insertedId);
      if (de) results.push([label, 'FAIL-DELETE', de.message]);
      else results.push([label, 'OK', `insert+read+delete via ${useAdmin ? 'service' : 'anon'}`]);
      insertedId = null;
    }
  } catch (e) {
    results.push([label, 'ERROR', e.message]);
  } finally {
    if (insertedId != null) { try { await (admin || supa).from(table).delete().eq('id', insertedId); } catch {} }
  }
}

async function testReadOnly(label, table) {
  const { data, error } = await supa.from(table).select('*').limit(1);
  if (error) results.push([label, 'FAIL-READ', error.message]);
  else results.push([label, 'OK', `read ${data?.length ?? 0} row(s)`]);
}

const run = async () => {
  // text-id tables need an explicit id
  const tid = () => MARK + Date.now();

  await testCrud('Team Members (team_members)', 'team_members',
    { name: MARK, position: 'test', image: 'x', is_active: false, display_order: 999 });

  await testCrud('Services (services)', 'services',
    { id: tid(), name: MARK, description: 'test', folder_name: 'test', icon: 'x', image_url: 'x' });
  await testCrud('Services via service-role', 'services',
    { id: tid(), name: MARK, description: 'test', folder_name: 'test', icon: 'x', image_url: 'x' }, { useAdmin: true });

  await testCrud('Partner Categories (partner_categories)', 'partner_categories',
    { name: MARK, original_path: 'test' });
  await testCrud('Partner Categories via service-role', 'partner_categories',
    { name: MARK, original_path: 'test' }, { useAdmin: true });

  await testCrud('Partner Logos (partner_logos)', 'partner_logos',
    { category_id: 1, alt: MARK, image_path: 'x' });

  await testCrud('Games (games)', 'games',
    { title: MARK, description: 'test', image: 'x', features: [], platforms: 'x' });

  await testCrud('Digital Marketing (digital_marketing)', 'digital_marketing',
    { title: MARK, client: 'test', description: 'test', image: 'x', services: [] });
  await testCrud('Digital Marketing via service-role', 'digital_marketing',
    { title: MARK, client: 'test', description: 'test', image: 'x', services: [] }, { useAdmin: true });

  await testCrud('Web Portals (web_portals)', 'web_portals',
    { title: MARK, client: 'test', description: 'test', image: 'x' });

  await testCrud('Applications (applications)', 'applications',
    { title: MARK, description: 'test', image: 'x', features: [], platforms: 'x' });

  await testCrud('Social Links (social_links)', 'social_links',
    { platform: MARK, url: 'https://x.test' });

  await testCrud('Contact Info (contact_info)', 'contact_info',
    { icon: 'x', title: MARK, details: 'test' });

  await testCrud('Newsletter (newsletter_subscribers)', 'newsletter_subscribers',
    { email: `audit_${Date.now()}@audit.test` });

  await testCrud('Job Openings (job_openings)', 'job_openings',
    { id: tid(), icon_name: 'x', title: MARK, short_description: 't', slug: tid(),
      full_title: 't', description: 't', what_you_will_do: [], what_were_looking_for: [], why_join_us: [] });

  await testCrud('Mastheads (interactive_mastheads)', 'interactive_mastheads',
    { id: tid(), category: 'x', brand: 'x', title: MARK, image: 'x', popup_html_path: 'x', popup_title: 'x' });

  await testCrud('Top Banner (top_banner)', 'top_banner',
    { title: MARK });

  await testReadOnly('Job Applications (read)', 'job_applications');

  console.log('\n================ ADMIN DB CRUD AUDIT (anon = browser path) ================\n');
  for (const [label, status, detail] of results) {
    const icon = status === 'OK' ? '✅' : status === 'SKIP' ? '⚪' : '❌';
    console.log(`${icon} ${status.padEnd(12)} ${label}\n      → ${detail}`);
  }
  console.log('\n=========================================================================');
  // cleanup any stragglers
  for (const t of ['team_members','services','partner_categories','partner_logos','games','digital_marketing','web_portals','applications','social_links','contact_info','interactive_mastheads','job_openings','top_banner']) {
    try { await (admin||supa).from(t).delete().like(t === 'newsletter_subscribers' ? 'email' : (t==='partner_logos'?'alt':(['games','digital_marketing','web_portals','applications','top_banner','interactive_mastheads','job_openings','services'].includes(t)?'title':'name')), `%${MARK}%`); } catch {}
  }
  try { await (admin||supa).from('newsletter_subscribers').delete().like('email', 'audit_%@audit.test'); } catch {}
};
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

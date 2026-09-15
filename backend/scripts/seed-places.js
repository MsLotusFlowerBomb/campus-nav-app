// Seeds the `places` table from frontend/public/buildings.json

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../src/config/supabase');

// Adjust if the file lives elsewhere
const PLACES_FILE = path.join(__dirname, '..', '..', 'frontend', 'public', 'buildings.json');

// Enum values from your schema
const VALID_CATEGORIES = new Set([
  'academic', 'residence', 'support', 'recreation',
  'commercial', 'parking', 'admin', 'other',
]);

function normaliseCategory(raw, fallbackName = '') {
  const c = String(raw || '').toLowerCase().trim();
  if (VALID_CATEGORIES.has(c)) return c;

  // Fallback heuristics if category is missing
  const n = `${c} ${fallbackName}`.toLowerCase();
  if (n.includes('resid')) return 'residence';
  if (n.includes('park')) return 'parking';
  if (n.includes('sport') || n.includes('gym') || n.includes('recreat')) return 'recreation';
  if (n.includes('shop') || n.includes('caf') || n.includes('commerc') || n.includes('kitchen')) return 'commercial';
  if (n.includes('health') || n.includes('medic') || n.includes('support') || n.includes('counsel')) return 'support';
  if (n.includes('library') || n.includes('lectur') || n.includes('lab') ||
      n.includes('science') || n.includes('academic') || n.includes('research')) return 'academic';
  if (n.includes('admin') || n.includes('office') || n.includes('registrar')) return 'admin';
  return 'other';
}

async function main() {
  if (!fs.existsSync(PLACES_FILE)) {
    console.error(' buildings.json not found at', PLACES_FILE);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(PLACES_FILE, 'utf8'));
  console.log(` Loaded ${raw.length} places from buildings.json\n`);

  const rows = [];
  const seenSlugs = new Set();
  const skipped = [];

  for (const p of raw) {
    const lat = Number(p.lat);
    const lng = Number(p.lng);
    const name = String(p.name || '').trim();
    const slug = String(p.id || '').trim();

    if (!slug || !name || Number.isNaN(lat) || Number.isNaN(lng)) {
      skipped.push({ id: p.id, reason: 'missing id/name/lat/lng' });
      continue;
    }
    if (seenSlugs.has(slug)) {
      skipped.push({ id: slug, reason: 'duplicate id' });
      continue;
    }
    seenSlugs.add(slug);

    const cat = normaliseCategory(p.category, name);
    const features = [];
    if (p.accessible === true) features.push('step-free');

    rows.push({
      slug,
      name,
      code: p.code || null,
      category: cat,
      type: cat,               // keep both in sync — legacy of your schema
      description: null,
      latitude: lat,
      longitude: lng,
      accessibility_features: features,
      source: 'seed-buildings-json',
      is_active: true,
    });
  }

  console.log(` Prepared ${rows.length} rows (${skipped.length} skipped)`);
  if (skipped.length > 0) {
    console.log('   Skipped entries:');
    skipped.slice(0, 10).forEach((s) => console.log(`   - ${s.id}: ${s.reason}`));
    if (skipped.length > 10) console.log(`   ... and ${skipped.length - 10} more`);
  }
  console.log('');

  // Insert in batches of 100 to stay under payload limits
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabaseAdmin
      .from('places')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false });

    if (error) {
      console.error(` Batch ${i / BATCH + 1} failed:`, error.message);
      console.error('   details:', error.details);
      console.error('   hint:', error.hint);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(` Batch ${i / BATCH + 1}: inserted/updated ${batch.length} rows`);
  }

  const { count } = await supabaseAdmin
    .from('places')
    .select('id', { count: 'exact', head: true });

  console.log(`\n Done. Total rows now in \`places\`: ${count}`);
}

main().catch((err) => {
  console.error('*', err);
  process.exit(1);
});
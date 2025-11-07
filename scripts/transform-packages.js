/*
  Transform data.packages.json into a payload matching CreatePackageDto
  - Removes all IDs and unrelated fields
  - Normalizes nested itinerary, included, excluded structures
  - Ensures required fields are present and properly formatted
  - Writes output to data.packages.cleaned.json
*/

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.resolve(__dirname, '..', 'data.packages.json');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'data.packages.cleaned.json');

function pruneUndefined(obj) {
  if (Array.isArray(obj)) return obj.map(pruneUndefined);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = pruneUndefined(v);
    }
    return out;
  }
  return obj;
}

function toSlug(s) {
  const base = String(s || '').trim().toLowerCase();
  if (!base) return undefined;
  return base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100); // cap length to avoid overly long slugs
}

function transformPackage(pkg) {
  const out = {
    name: String(pkg.name || '').trim(),
    // slug optional; generate from name if absent
    slug: pkg.slug ? String(pkg.slug).trim() : toSlug(pkg.name),
    days: Number(pkg.days || 0),
    nights: Number(pkg.nights || 0),
    minimum_people: pkg.minimum_people != null ? Number(pkg.minimum_people) : undefined,
    maximum_people: pkg.maximum_people != null ? Number(pkg.maximum_people) : undefined,
    photos: Array.isArray(pkg.photos) ? pkg.photos.filter((p) => typeof p === 'string' && p.trim().length > 0) : [],
    descriptions: String(pkg.descriptions || '').trim(),
    price: Number(pkg.price || 0),
    destination: String(pkg.destination || '').trim(),
    lower_price: pkg.lower_price != null ? Number(pkg.lower_price) : undefined,
    featured: !!pkg.featured,
    isMemberOnly: !!pkg.isMemberOnly,
    isVip: !!pkg.isVip,
    itinerary: Array.isArray(pkg.itinerary)
      ? pkg.itinerary.map((day) => ({
          day: Number(day.day || 0),
          title: String(day.title || '').trim(),
          activities: Array.isArray(day.activities)
            ? day.activities.map((act) => ({ title: String(act.title || '').trim() }))
            : [],
        }))
      : [],
    included: Array.isArray(pkg.included)
      ? pkg.included.map((item) => ({ title: String(item.title || '').trim() }))
      : [],
    excluded: Array.isArray(pkg.excluded)
      ? pkg.excluded.map((item) => ({ title: String(item.title || '').trim() }))
      : [],
  };

  // Fallbacks / sanity checks
  if (out.lower_price === undefined) out.lower_price = out.price;

  // Remove undefined keys for clean JSON
  return pruneUndefined(out);
}

function main() {
  try {
    const raw = fs.readFileSync(INPUT_PATH, 'utf8');
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      throw new Error('Input JSON must be an array of packages');
    }

    const cleaned = data.map(transformPackage);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleaned, null, 2));
    console.log(`Transformed ${cleaned.length} packages -> ${OUTPUT_PATH}`);
  } catch (err) {
    console.error('Failed to transform packages:', err.message);
    process.exit(1);
  }
}

main();
/**
 * Auto-generate polygon rectangles for all opslagboxen based on visual layout.
 * Image dimensions: opslagbox0=1208x1606, opslagbox1=1192x1608, opslagbox2=1196x1608
 * Coordinates are percentages (0-100) matching SVG viewBox="0 0 100 100"
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE env vars. Run with: node -r dotenv/config scripts/generate-opslagbox-polygons.js dotenv_config_path=.env.local');
  process.exit(1);
}

// Helper: make rectangle polygon points from corners
function rect(x1, y1, x2, y2) {
  const r = (n) => parseFloat(n.toFixed(2));
  return `${r(x1)},${r(y1)} ${r(x2)},${r(y1)} ${r(x2)},${r(y2)} ${r(x1)},${r(y2)}`;
}

const polygons = [];

// ============================================================
// BEGANE GROND (opslagbox0.png) — Boxes 1-55
// ============================================================
const BG = 'bg';

// LEFT COLUMN: boxes 1-14 (bottom=1, top=14)
// x: 11.5% - 26.5%, total y range: 8.5% - 91.5%
{
  const x1 = 11.5, x2 = 26.5;
  // Box 14 is larger (43.5m² vs 32.4m²), ~34% taller
  const topY = 8.5, bottomY = 91.5;
  const totalH = bottomY - topY; // 83%
  // Proportional: box14 = 43.5, boxes 1-13 = 32.4 each (avg). Box 6 = 32.5, box 1 = 31.7
  const box14H = (43.5 / (43.5 + 13 * 32.4)) * totalH; // ~7.8%
  const otherH = (totalH - box14H) / 13;
  // Box 14 at top
  polygons.push({ unit_number: '14', type: 'opslagbox', floor: BG, points: rect(x1, topY, x2, topY + box14H) });
  // Boxes 13 down to 1
  for (let i = 0; i < 13; i++) {
    const boxNum = String(13 - i);
    const y1 = topY + box14H + i * otherH;
    const y2 = y1 + otherH;
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: BG, points: rect(x1, y1, x2, y2) });
  }
}

// MIDDLE-LEFT COLUMN: boxes 15-27 (bottom=15, top=27), 13 boxes
// x: 35% - 47.5%
{
  const x1 = 35.0, x2 = 47.5;
  const startY = 21.0, endY = 91.5;
  const h = (endY - startY) / 13;
  for (let i = 0; i < 13; i++) {
    const boxNum = String(27 - i); // 27 at top, 15 at bottom
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: BG, points: rect(x1, startY + i * h, x2, startY + (i + 1) * h) });
  }
}

// MIDDLE-RIGHT COLUMN: boxes 28-40 (top=28, bottom=40), 13 boxes
// x: 47.5% - 59.5%
{
  const x1 = 47.5, x2 = 59.5;
  const startY = 21.0, endY = 91.5;
  const h = (endY - startY) / 13;
  for (let i = 0; i < 13; i++) {
    const boxNum = String(28 + i); // 28 at top, 40 at bottom
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: BG, points: rect(x1, startY + i * h, x2, startY + (i + 1) * h) });
  }
}

// RIGHT COLUMN: boxes 41-55 (bottom=41, top=55), 15 boxes, roughly equal size
// x: 72.5% - 90%
{
  const x1 = 72.5, x2 = 90.0;
  const startY = 8.5, endY = 91.5;
  const h = (endY - startY) / 15;
  for (let i = 0; i < 15; i++) {
    const boxNum = String(55 - i); // 55 at top, 41 at bottom
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: BG, points: rect(x1, startY + i * h, x2, startY + (i + 1) * h) });
  }
}

// ============================================================
// 1E VERDIEPING (opslagbox1.png) — Boxes 00 + 56-151
// ============================================================
const V1 = '1e';

// LEFT COLUMN: boxes 00(bottom), 56-69(top=69), 15 boxes total
// x: 11.5% - 26.5%
{
  const x1 = 11.5, x2 = 26.5;
  const topY = 8.5, bottomY = 92.5;
  // Box 69 is larger (43.5m²), box 58 smaller (24.2m²), rest ~32.4m²
  // For simplicity: box 69 ~8% tall, boxes 57-68 ~5.5% each, box 56 ~5.5%, box 00 ~5.5%
  const box69H = 8.0;
  const box69Y1 = topY;
  const box69Y2 = topY + box69H;
  polygons.push({ unit_number: '69', type: 'opslagbox', floor: V1, points: rect(x1, box69Y1, x2, box69Y2) });
  // Remaining 13 boxes (68-56) + box 00 = 14 boxes below
  const remainH = (bottomY - box69Y2) / 14;
  for (let i = 0; i < 13; i++) {
    const boxNum = String(68 - i); // 68 down to 56
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: V1, points: rect(x1, box69Y2 + i * remainH, x2, box69Y2 + (i + 1) * remainH) });
  }
  // Box 00 at the very bottom
  polygons.push({ unit_number: '0', type: 'opslagbox', floor: V1, points: rect(x1, box69Y2 + 13 * remainH, x2, bottomY) });
}

// MIDDLE-LEFT SECTION: boxes 70-101 in 2 narrow columns (16 rows)
// Left narrow col (boxes 85-70, top=85, bottom=70): x: 34% - 43%
// Right narrow col (boxes 86-101, top=86, bottom=101): x: 43% - 55%
{
  const ax1 = 34.0, ax2 = 43.0; // left narrow
  const bx1 = 43.0, bx2 = 55.0; // right narrow
  const startY = 21.0, endY = 91.5;
  const h = (endY - startY) / 16;
  for (let i = 0; i < 16; i++) {
    const leftNum = String(85 - i);  // 85,84,...,70
    const rightNum = String(86 + i); // 86,87,...,101
    const y1 = startY + i * h;
    const y2 = y1 + h;
    polygons.push({ unit_number: leftNum, type: 'opslagbox', floor: V1, points: rect(ax1, y1, ax2, y2) });
    polygons.push({ unit_number: rightNum, type: 'opslagbox', floor: V1, points: rect(bx1, y1, bx2, y2) });
  }
}

// MIDDLE-RIGHT SECTION: boxes 102-133 in 2 narrow columns (16 rows)
// Left narrow col (boxes 117-102, top=117, bottom=102): x: 57.5% - 67%
// Right narrow col (boxes 118-133, top=118, bottom=133): x: 67% - 78%
{
  const ax1 = 57.5, ax2 = 67.0;
  const bx1 = 67.0, bx2 = 78.0;
  const startY = 21.0, endY = 91.5;
  const h = (endY - startY) / 16;
  for (let i = 0; i < 16; i++) {
    const leftNum = String(117 - i);  // 117,116,...,102
    const rightNum = String(118 + i); // 118,119,...,133
    const y1 = startY + i * h;
    const y2 = y1 + h;
    polygons.push({ unit_number: leftNum, type: 'opslagbox', floor: V1, points: rect(ax1, y1, ax2, y2) });
    polygons.push({ unit_number: rightNum, type: 'opslagbox', floor: V1, points: rect(bx1, y1, bx2, y2) });
  }
}

// RIGHT COLUMN: boxes 134-151 (bottom=134, top=151), 18 boxes
// x: 81% - 91%
{
  const x1 = 81.0, x2 = 91.0;
  const startY = 8.5, endY = 91.5;
  const h = (endY - startY) / 18;
  for (let i = 0; i < 18; i++) {
    const boxNum = String(151 - i); // 151 at top, 134 at bottom
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: V1, points: rect(x1, startY + i * h, x2, startY + (i + 1) * h) });
  }
}

// ============================================================
// 2E VERDIEPING (opslagbox2.png) — Boxes 000 + 152-247
// ============================================================
const V2 = '2e';

// LEFT COLUMN: boxes 000(bottom), 152-165(top=165), 15 boxes
// x: 11.5% - 26.5%
{
  const x1 = 11.5, x2 = 26.5;
  const topY = 8.5, bottomY = 92.5;
  const box165H = 8.0;
  polygons.push({ unit_number: '165', type: 'opslagbox', floor: V2, points: rect(x1, topY, x2, topY + box165H) });
  const remainH = (bottomY - (topY + box165H)) / 14;
  for (let i = 0; i < 13; i++) {
    const boxNum = String(164 - i); // 164 down to 152
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: V2, points: rect(x1, topY + box165H + i * remainH, x2, topY + box165H + (i + 1) * remainH) });
  }
  // Box 000 — same database unit as box 00 on 1e verdieping? Keep as separate entry
  polygons.push({ unit_number: '000', type: 'opslagbox', floor: V2, points: rect(x1, topY + box165H + 13 * remainH, x2, bottomY) });
}

// MIDDLE-LEFT SECTION 2e VERDIEPING: boxes 166-197 (same structure as 1e)
// Left narrow col (boxes 181-166, top=181, bottom=166): x: 34% - 43%
// Right narrow col (boxes 182-197, top=182, bottom=197): x: 43% - 55%
{
  const ax1 = 34.0, ax2 = 43.0;
  const bx1 = 43.0, bx2 = 55.0;
  const startY = 21.0, endY = 91.5;
  const h = (endY - startY) / 16;
  for (let i = 0; i < 16; i++) {
    const leftNum = String(181 - i);  // 181,180,...,166
    const rightNum = String(182 + i); // 182,183,...,197
    const y1 = startY + i * h;
    const y2 = y1 + h;
    polygons.push({ unit_number: leftNum, type: 'opslagbox', floor: V2, points: rect(ax1, y1, ax2, y2) });
    polygons.push({ unit_number: rightNum, type: 'opslagbox', floor: V2, points: rect(bx1, y1, bx2, y2) });
  }
}

// MIDDLE-RIGHT SECTION 2e VERDIEPING: boxes 198-229
// Left narrow col (boxes 213-198, top=213, bottom=198): x: 57.5% - 67%
// Right narrow col (boxes 214-229, top=214, bottom=229): x: 67% - 78%
{
  const ax1 = 57.5, ax2 = 67.0;
  const bx1 = 67.0, bx2 = 78.0;
  const startY = 21.0, endY = 91.5;
  const h = (endY - startY) / 16;
  for (let i = 0; i < 16; i++) {
    const leftNum = String(213 - i);  // 213,212,...,198
    const rightNum = String(214 + i); // 214,215,...,229
    const y1 = startY + i * h;
    const y2 = y1 + h;
    polygons.push({ unit_number: leftNum, type: 'opslagbox', floor: V2, points: rect(ax1, y1, ax2, y2) });
    polygons.push({ unit_number: rightNum, type: 'opslagbox', floor: V2, points: rect(bx1, y1, bx2, y2) });
  }
}

// RIGHT COLUMN 2e VERDIEPING: boxes 230-247 (bottom=230, top=247), 18 boxes
// x: 81% - 91%
{
  const x1 = 81.0, x2 = 91.0;
  const startY = 8.5, endY = 91.5;
  const h = (endY - startY) / 18;
  for (let i = 0; i < 18; i++) {
    const boxNum = String(247 - i); // 247 at top, 230 at bottom
    polygons.push({ unit_number: boxNum, type: 'opslagbox', floor: V2, points: rect(x1, startY + i * h, x2, startY + (i + 1) * h) });
  }
}

console.log(`Generated ${polygons.length} polygon entries`);

// Upsert into Supabase
async function insertPolygons() {
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < polygons.length; i += BATCH_SIZE) {
    const batch = polygons.slice(i, i + BATCH_SIZE);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/polygons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Batch ${i}-${i + BATCH_SIZE} failed:`, err);
    } else {
      inserted += batch.length;
      console.log(`✅ Inserted batch ${i}-${i + BATCH_SIZE - 1} (${inserted}/${polygons.length})`);
    }
  }
  console.log(`\n🎉 Done! ${inserted} polygons inserted into database.`);
}

insertPolygons().catch(console.error);

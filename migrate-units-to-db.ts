import { createClient } from '@supabase/supabase-js';
import { projects } from './src/data/projects';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUnits() {
  console.log('Starting units migration...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const project of projects) {
    const isBedrijfsunit = project.units && project.units > 0;
    const isOpslagbox = project.garageBoxes && project.garageBoxes > 0;

    if (!isBedrijfsunit && !isOpslagbox) {
      continue;
    }

    const unitDetails = project.details?.unitDetails || [];

    console.log(`Processing ${project.name} (${unitDetails.length} units)...`);

    for (const unit of unitDetails) {
      try {
        // Parse price - remove currency symbols and convert to number
        const price = parseFloat(unit.price.replace(/[€,.]/g, '').replace('€', '').trim());

        const unitData = {
          type: isBedrijfsunit ? 'bedrijfsunit' : 'opslagbox',
          name: `${project.name} - Unit ${unit.unitNumber}`,
          description: project.description,
          unit_number: unit.unitNumber.toString(),
          type_number: parseInt(project.id.split('-').pop() || '1'),
          gross_area: unit.grossArea || null,
          net_area: unit.netArea || null,
          industrie_net_area: unit.industrieNetto || null,
          industrie_gross_area: unit.industrieBruto || null,
          kantoor_net_area: unit.kantoorNetto || null,
          kantoor_gross_area: unit.kantoorBruto || null,
          sale_price: price,
          slug: `${project.slug}-unit-${unit.unitNumber}`,
          status: unit.status === 'beschikbaar' ? 'available' : 'sold',
          ceiling_height: isBedrijfsunit ? 3.70 : 2.70,
          parking_spaces: isBedrijfsunit ? 2 : 0,
          reservation_fee: isBedrijfsunit ? 2500.00 : 1500.00,
          features: project.features || [],
          specifications: project.details?.specifications || {},
          images: project.images || [],
          location: project.details?.location || 'De Steiger 74/77, Almere'
        };

        const { error } = await supabase
          .from('properties')
          .upsert(unitData, { 
            onConflict: 'slug',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`  ❌ Error inserting unit ${unit.unitNumber}:`, error.message);
          errorCount++;
        } else {
          console.log(`  ✅ Unit ${unit.unitNumber} migrated successfully`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error processing unit ${unit.unitNumber}:`, error.message);
        errorCount++;
      }
    }

    console.log('');
  }

  console.log('\n===========================================');
  console.log(`Migration complete!`);
  console.log(`✅ Successfully migrated: ${successCount} units`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('===========================================\n');
}

// Run migration
migrateUnits()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });



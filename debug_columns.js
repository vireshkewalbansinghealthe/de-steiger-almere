const XLSX = require('xlsx');

function debugColumns() {
    try {
        console.log('=== DEBUGGING COLUMN MAPPING ===');
        
        const workbook = XLSX.readFile('./bedrijfunits_opslagboxen.xlsx');
        
        // Debug Bedrijfspand columns
        console.log('\n=== BEDRIJFSPAND COLUMN DEBUG ===');
        const bedrijfspandSheet = workbook.Sheets['Bedrijfspand'];
        const bedrijfspandData = XLSX.utils.sheet_to_json(bedrijfspandSheet, { header: 1 });
        
        console.log('First 20 rows of Bedrijfspand:');
        bedrijfspandData.slice(0, 20).forEach((row, index) => {
            console.log(`Row ${index}:`, {
                'Col A': row[0],
                'Col B': row[1], 
                'Col C': row[2],
                'Col D': row[3],
                'Col E': row[4],
                'Col F': row[5]
            });
        });
        
        // Find where unit data actually starts
        console.log('\nLooking for unit data patterns in Bedrijfspand...');
        bedrijfspandData.forEach((row, index) => {
            // Look for rows that might contain unit numbers (small integers)
            if (typeof row[1] === 'number' && row[1] > 0 && row[1] < 100) {
                console.log(`Row ${index} - Possible unit data:`, {
                    'Type (A)': row[0],
                    'Unit (B)': row[1],
                    'Area1 (C)': row[2],
                    'Area2 (D)': row[3],
                    'Area3 (E)': row[4]
                });
                if (index > 25) return; // Stop after showing enough examples
            }
        });
        
        // Debug Opslagboxen columns
        console.log('\n=== OPSLAGBOXEN COLUMN DEBUG ===');
        const opslagboxenSheet = workbook.Sheets['Opslagboxen'];
        const opslagboxenData = XLSX.utils.sheet_to_json(opslagboxenSheet, { header: 1 });
        
        console.log('First 20 rows of Opslagboxen:');
        opslagboxenData.slice(0, 20).forEach((row, index) => {
            console.log(`Row ${index}:`, {
                'Col A': row[0],
                'Col B': row[1],
                'Col C': row[2],
                'Col D': row[3],
                'Col E': row[4],
                'Col F': row[5]
            });
        });
        
        // Find where unit data actually starts
        console.log('\nLooking for unit data patterns in Opslagboxen...');
        opslagboxenData.forEach((row, index) => {
            // Look for rows that might contain unit numbers
            if (typeof row[1] === 'number' && row[1] > 0 && row[1] < 100) {
                console.log(`Row ${index} - Possible unit data:`, {
                    'Type (A)': row[0],
                    'Unit (B)': row[1],
                    'Area1 (C)': row[2],
                    'Area2 (D)': row[3],
                    'Area3 (E)': row[4]
                });
                if (index > 25) return; // Stop after showing enough examples
            }
        });
        
        // Count unique type numbers in Column A
        console.log('\n=== UNIQUE TYPES IN COLUMN A ===');
        
        const bedrijfspandTypes = new Set();
        bedrijfspandData.forEach(row => {
            if (row[0] && (typeof row[0] === 'number' || (typeof row[0] === 'string' && !isNaN(parseInt(row[0]))))) {
                bedrijfspandTypes.add(row[0].toString());
            }
        });
        console.log(`Bedrijfspand unique types in Column A: ${Array.from(bedrijfspandTypes).sort()}`);
        
        const opslagboxenTypes = new Set();
        opslagboxenData.forEach(row => {
            if (row[0] && (typeof row[0] === 'number' || (typeof row[0] === 'string' && !isNaN(parseInt(row[0]))))) {
                opslagboxenTypes.add(row[0].toString());
            }
        });
        console.log(`Opslagboxen unique types in Column A: ${Array.from(opslagboxenTypes).sort((a, b) => parseInt(a) - parseInt(b))}`);
        
    } catch (error) {
        console.error(`Error debugging columns: ${error.message}`);
    }
}

debugColumns();

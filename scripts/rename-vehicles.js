const fs = require('fs');
const path = require('path');

const files = [
  'app/page.tsx',
  'components/VehicleCard.tsx',
  'app/(dashboard)/user/favorites/page.tsx',
  'app/(dashboard)/user/bookings/page.tsx',
  'app/(dashboard)/user/page.tsx',
  'app/(public)/inventory/page.tsx',
  'app/(public)/inventory/[id]/page.tsx',
  'app/(public)/inventory/[id]/confirm/page.tsx'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, '..', f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace hardcoded links
    content = content.replace(/"\/vehicles\//g, '"/inventory/');
    content = content.replace(/`\/vehicles\//g, '`/inventory/');
    content = content.replace(/'\/vehicles\//g, "'/inventory/");

    // Some places might just use "/vehicles"
    content = content.replace(/"\/vehicles"/g, '"/inventory"');
    content = content.replace(/'\/vehicles'/g, "'/inventory'");

    fs.writeFileSync(fullPath, content);
    console.log('Fixed', f);
  } else {
    console.log('Not found', f);
  }
});

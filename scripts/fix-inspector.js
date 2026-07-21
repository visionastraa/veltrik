const fs = require('fs');
const path = require('path');

const files = [
  'app/(dashboard)/inspector/inspections/page.tsx',
  'app/(dashboard)/inspector/inspect/[id]/page.tsx',
  'app/(dashboard)/inspector/history/page.tsx',
  'app/(dashboard)/inspector/calendar/page.tsx',
  'app/(dashboard)/inspector/inspect/[id]/InspectionFormClient.tsx',
  'components/inspector/QueueTable.tsx',
  'components/inspector/HistoryTable.tsx',
  'components/inspector/GoogleCalendarView.tsx'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, '..', f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix seller relation to user
    content = content.replace(/seller:\s*true/g, 'user: true');
    content = content.replace(/lead\.seller/g, 'lead.user');
    content = content.replace(/sellerLead\.seller/g, 'sellerLead.user');
    content = content.replace(/b\.sellerLead\?\.seller/g, 'b.sellerLead?.user');
    content = content.replace(/lead\?\.seller/g, 'lead?.user');

    // Fix brand to make
    content = content.replace(/lead\.brand/g, 'lead.make');
    content = content.replace(/brand=\{lead\.make\}/g, 'make={lead.make}');
    content = content.replace(/brand: string;/g, 'make: string;');
    content = content.replace(/brand,/g, 'make,');
    content = content.replace(/\{brand\}/g, '{make}');

    fs.writeFileSync(fullPath, content);
    console.log('Fixed', f);
  }
});

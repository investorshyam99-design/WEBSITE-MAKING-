const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Find all occurrences of handleSavePaymentEdit
const parts = content.split('  const handleSavePaymentEdit = async () => {');
if (parts.length > 2) {
    // Keep everything before the first one
    let newContent = parts[0] + '  const handleSavePaymentEdit = async () => {' + parts[1];
    
    // Now remove the second one. The second one ends before handleUpdateCustomizationStatus
    const parts2 = newContent.split('  const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {');
    // Actually wait, let's just use string replace.
}

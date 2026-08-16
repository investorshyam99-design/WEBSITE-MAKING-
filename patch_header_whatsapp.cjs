const fs = require('fs');
let file = fs.readFileSync('src/components/Header.tsx', 'utf8');

const regex = /<a\s*href="https:\/\/wa\.me\/919930234467"\s*target="_blank"\s*rel="noopener noreferrer"\s*onClick=\{\(\) => setIsMobileMenuOpen\(false\)\}\s*className="flex items-center gap-3 px-6 py-4 text-base font-bold text-green-700 hover:bg-\[#F5EFE6\] transition-colors w-full text-left border-t border-gray-100"\s*>\s*<MessageCircle className="h-5 w-5 text-green-600" \/> 📱 WhatsApp: \+91 99302 34467\s*<\/a>/;

file = file.replace(regex, "");

fs.writeFileSync('src/components/Header.tsx', file);

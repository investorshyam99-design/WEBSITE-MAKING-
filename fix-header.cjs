const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const replacement = `              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] border-b border-gray-100 transition-colors uppercase"
              >
                <Home className="h-5 w-5" /> Home
              </Link>
              {!isAuthLoading && !user ? (
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1E2A44] hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left"
                >
                  <LogIn className="h-5 w-5" /> Register/Login
                </button>
              ) : !isAuthLoading && user ? (
                <div className="mt-2 py-2 border-t border-gray-100">`;

// Using regex to match from the Link block to the div class="mt-2 py-2..."
code = code.replace(/              <Link\s+to="\/"\s+onClick=\{\(\) => setIsMobileMenuOpen\(false\)\}\s+className="flex items-center gap-3 px-6 py-4 text-base font-bold text-\[\#1B1B1B\] hover:bg-\[\#F5EFE6\] hover:text-\[\#1E2A44\] border-b border-gray-100 transition-colors uppercase"\s+>\s+<Home className="h-5 w-5" \/> Home\s+<\/Link>\s+onClick=\{\(\) => \{\s+setIsLoginOpen\(true\);\s+setIsMobileMenuOpen\(false\);\s+\}\}\s+className="flex items-center gap-3 px-6 py-4 text-base font-bold text-\[\#1E2A44\] hover:bg-\[\#F5EFE6\] transition-colors uppercase w-full text-left"\s+>\s+<LogIn className="h-5 w-5" \/> Register\/Login\s+<\/button>\s+\) : \!isAuthLoading && user \? \(\s+<div className="mt-2 py-2 border-t border-gray-100">/, replacement);

fs.writeFileSync('src/components/Header.tsx', code);

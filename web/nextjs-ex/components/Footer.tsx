"use client";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8" suppressHydrationWarning>
      <div className="container mx-auto px-6 text-center space-y-2" suppressHydrationWarning>
        <a 
          href="mailto:support@institution.edu" 
          className="text-gray-600 hover:text-gray-900 transition-colors block"
        >
          support@institution.edu
        </a>
        <p className="text-gray-500 text-sm" suppressHydrationWarning>
          © {new Date().getFullYear()} The Institution Name. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

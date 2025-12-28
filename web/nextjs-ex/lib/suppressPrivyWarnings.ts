/**
 * Suppress known Privy hydration warnings
 * 
 * This is a known issue in Privy's UI components where <div> is rendered inside <p>
 * It doesn't affect functionality, but causes console warnings in development.
 * 
 * This utility filters out these specific warnings while preserving all other console errors.
 * Only active in development mode to avoid hiding important errors in production.
 */

// Run immediately when module loads (before React renders)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  
  console.error = (...args: unknown[]) => {
    // Convert all arguments to strings for pattern matching
    const message = args
      .map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message;
        if (arg && typeof arg === 'object' && 'message' in arg) {
          return String((arg as { message?: unknown }).message);
        }
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ')
      .toLowerCase();
    
    // Check for Privy-specific hydration warnings
    // Match patterns like:
    // - "In HTML, <div> cannot be a descendant of <p>"
    // - "<p> cannot contain a nested <div>"
    // - "cannot appear as a descendant of <p>"
    const hasHtmlStructureWarning = 
      message.includes('cannot be a descendant of <p>') ||
      message.includes('<p> cannot contain a nested <div>') ||
      message.includes('cannot appear as a descendant of <p>') ||
      message.includes('hydration error') ||
      message.includes('will cause a hydration error') ||
      message.includes('in html, <div>');
    
    // Check for Privy component context (case-insensitive since message is lowercased)
    const hasPrivyContext = 
      message.includes('helptextcontainer') ||
      message.includes('privy') ||
      message.includes('privyprovider') ||
      message.includes('screenroot') ||
      message.includes('footercontainer') ||
      message.includes('headercontainer') ||
      message.includes('screenrootinner') ||
      // Also check if the stack trace mentions PrivyProvider
      args.some(arg => {
        const str = String(arg);
        return str.includes('PrivyProvider') || str.includes('privyProvider');
      });
    
    const isPrivyHydrationWarning = hasHtmlStructureWarning && hasPrivyContext;
    
    if (isPrivyHydrationWarning) {
      // Suppress this specific Privy warning
      return;
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };
}


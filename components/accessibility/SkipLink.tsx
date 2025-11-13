/**
 * Skip Link Component
 * 
 * Provides a "Skip to main content" link for keyboard users
 * to bypass navigation and jump directly to the main content.
 * 
 * WCAG 2.1 Success Criterion 2.4.1 Bypass Blocks
 */

'use client';

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  className?: string;
}

export function SkipLink({ href = '#main-content', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Position off-screen by default
        'sr-only',
        // Show when focused
        'focus:not-sr-only',
        'focus:absolute',
        'focus:top-4',
        'focus:left-4',
        'focus:z-50',
        // Styling
        'rounded-md',
        'bg-primary',
        'px-4',
        'py-2',
        'text-sm',
        'font-medium',
        'text-primary-foreground',
        'shadow-lg',
        'ring-2',
        'ring-primary',
        'ring-offset-2',
        'focus:outline-none',
        // Transitions
        'transition-all',
        className
      )}
    >
      Skip to main content
    </a>
  );
}

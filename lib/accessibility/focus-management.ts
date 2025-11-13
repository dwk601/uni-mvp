/**
 * Focus Management Utilities
 * 
 * Utilities for managing keyboard focus in React applications
 * to enhance keyboard navigation and accessibility.
 */

'use client';

import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to automatically focus an element when component mounts
 */
export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}

/**
 * Hook to trap focus within a container (useful for modals/dialogs)
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element on mount
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return ref;
}

/**
 * Hook to restore focus to a previous element when component unmounts
 */
export function useRestoreFocus<T extends HTMLElement>(
  shouldRestore: boolean = true
) {
  const ref = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldRestore) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (shouldRestore && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [shouldRestore]);

  return ref;
}

/**
 * Hook to manage focus for roving tabindex pattern
 * (useful for toolbars, menus, tabs)
 */
export function useRovingTabIndex<T extends HTMLElement>(
  items: HTMLElement[],
  activeIndex: number,
  setActiveIndex: (index: number) => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((activeIndex + 1) % items.length);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;
      }
    };

    ref.current?.addEventListener('keydown', handleKeyDown);

    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [items, activeIndex, setActiveIndex]);

  return ref;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  elements[0]?.focus();
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  elements[elements.length - 1]?.focus();
}

/**
 * Check if an element is currently focused
 */
export function isFocused(element: HTMLElement): boolean {
  return document.activeElement === element;
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

import { useEffect } from 'react';

const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab/Shift+Tab focus within containerRef when isOpen is true.
 * Also auto-focuses the first focusable element on open and restores
 * focus to the previously focused element on close.
 */
export default function useFocusTrap(isOpen, containerRef) {
  // Auto-focus first element + restore on close
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const prev = document.activeElement;
    const focusable = containerRef.current.querySelectorAll(FOCUSABLE);
    const timer = setTimeout(() => focusable[0]?.focus(), 50);
    return () => {
      clearTimeout(timer);
      prev?.focus?.();
    };
  }, [isOpen]);

  // Trap Tab key
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = containerRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);
}

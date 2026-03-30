import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock lucide-react icons — return a simple SVG stub for every named export
vi.mock('lucide-react', () => {
  const handler = {
    get(target, prop) {
      if (prop === '__esModule') return true;
      if (prop === 'default') return target;
      // Return a functional component stub for any icon name
      if (!target[prop]) {
        target[prop] = React.forwardRef((props, ref) =>
          React.createElement('svg', { 'data-testid': `icon-${prop}`, ref, ...props })
        );
        target[prop].displayName = prop;
      }
      return target[prop];
    },
  };
  return new Proxy({}, handler);
});

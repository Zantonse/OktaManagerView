import '@testing-library/jest-dom';

// Mock CSS/Tailwind imports to avoid ESM resolution issues
global.CSS = global.CSS || {};
Object.defineProperty(global, 'CSS', {
  value: global.CSS,
  writable: false,
});

import '@testing-library/jest-dom/extend-expect';
import 'whatwg-fetch';

// ensure performance is available in test env
if (!(global as any).performance) {
  (global as any).performance = Date;
}

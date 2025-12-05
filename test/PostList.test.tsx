import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { processTags } from '@/lib/compute';

describe('processTags utility', () => {
  it('processes tags quickly and returns lowercase tags', () => {
    const tags = ['Tag1', 'Tag2', 'Another'];
    const start = performance.now();
    const processed = processTags(tags);
    const end = performance.now();
    expect(processed).toEqual(['tag1', 'tag2', 'another']);
    expect(end - start).toBeLessThan(20);
  });
});

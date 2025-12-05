export function computeRelevanceValue(initial: number, iterations: number = 200) {
  let relevance = initial;
  for (let i = 0; i < iterations; i++) {
    relevance = Math.sqrt(relevance * Math.random());
  }
  return relevance;
}

export function processTags(tags: string[]) {
  // lightweight processing: lower-case tags
  return tags.map(t => t.toLowerCase());
}

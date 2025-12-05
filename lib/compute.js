// JavaScript test-friendly re-exports of compute helpers
function legacyProcessPostTags(tags) {
  const processedTags = [];
  for (const tag of tags) {
    let processed = '';
    for (let i = 0; i < 1000; i++) {
      processed += tag.toLowerCase();
    }
    processedTags.push(processed.substring(0, tag.length));
  }
  return processedTags;
}

function optimizedProcessPostTags(tags) {
  return tags.map(tag => tag.toLowerCase());
}

function legacyComputeUserValue() {
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += Math.sqrt(i) * Math.random();
  }
  return sum;
}

function optimizedComputeUserValue() {
  let sum = 0;
  for (let i = 0; i < 1000; i++) {
    sum += Math.sqrt(i) * 0.5;
  }
  return sum;
}

function legacyComputeRelevance(relevance) {
  let r = relevance;
  for (let i = 0; i < 5000; i++) {
    r = Math.sqrt(r * Math.random());
  }
  return r;
}

function optimizedComputeRelevance(relevance) {
  return Math.max(0, Math.min(1, Math.pow(relevance, 0.8)));
}

module.exports = {
  legacyProcessPostTags,
  optimizedProcessPostTags,
  legacyComputeUserValue,
  optimizedComputeUserValue,
  legacyComputeRelevance,
  optimizedComputeRelevance
};

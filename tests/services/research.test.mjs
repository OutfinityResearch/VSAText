/**
 * Tests for Services - Research
 * 
 * Tests: searchKnowledgeBase, getKnowledgeEntry, KNOWLEDGE_BASE
 */

import {
  searchKnowledgeBase,
  getKnowledgeEntry,
  KNOWLEDGE_BASE
} from '../../src/services/research.mjs';

// Test: KNOWLEDGE_BASE has entries
export function testKnowledgeBaseHasEntries() {
  if (!Array.isArray(KNOWLEDGE_BASE)) {
    throw new Error('KNOWLEDGE_BASE should be an array');
  }
  if (KNOWLEDGE_BASE.length === 0) {
    throw new Error('KNOWLEDGE_BASE should have entries');
  }
}

// Test: Each knowledge entry has required fields
export function testKnowledgeEntryFields() {
  const requiredFields = ['id', 'title', 'content', 'source', 'domain', 'tags'];
  
  for (const entry of KNOWLEDGE_BASE) {
    for (const field of requiredFields) {
      if (!(field in entry)) {
        throw new Error(`Entry ${entry.id || 'unknown'} missing field: ${field}`);
      }
    }
    if (!Array.isArray(entry.tags)) {
      throw new Error(`Entry ${entry.id} tags should be an array`);
    }
  }
}

// Test: searchKnowledgeBase returns results for matching query
export function testSearchReturnsMatchingResults() {
  const results = searchKnowledgeBase('storm surge ocean weather', { top_k: 5 });
  
  if (!results.results) {
    throw new Error('Should have results array');
  }
  if (results.results.length === 0) {
    throw new Error('Should find results for storm surge query');
  }
  if (results.query !== 'storm surge ocean weather') {
    throw new Error('Should include original query');
  }
}

// Test: searchKnowledgeBase returns relevance scores
export function testSearchReturnsRelevanceScores() {
  const results = searchKnowledgeBase('narrative structure three act');
  
  for (const result of results.results) {
    if (typeof result.relevance_score !== 'number') {
      throw new Error('Each result should have relevance_score');
    }
    if (result.relevance_score < 0 || result.relevance_score > 1) {
      throw new Error('Relevance score should be 0-1');
    }
  }
}

// Test: searchKnowledgeBase returns provenance
export function testSearchReturnsProvenance() {
  const results = searchKnowledgeBase('hero journey mythology');
  
  if (results.results.length === 0) {
    throw new Error('Should find results for hero journey query');
  }
  
  const first = results.results[0];
  if (!first.provenance) {
    throw new Error('Result should have provenance');
  }
  if (!first.provenance.source_id) {
    throw new Error('Provenance should have source_id');
  }
  if (!first.provenance.source_name) {
    throw new Error('Provenance should have source_name');
  }
  if (!first.provenance.retrieved_at) {
    throw new Error('Provenance should have retrieved_at timestamp');
  }
}

// Test: searchKnowledgeBase respects top_k option
export function testSearchRespectsTopK() {
  const results = searchKnowledgeBase('writing narrative structure', { top_k: 2, min_score: 0 });
  
  if (results.results.length > 2) {
    throw new Error(`Expected at most 2 results, got ${results.results.length}`);
  }
}

// Test: searchKnowledgeBase filters by min_score
export function testSearchFiltersMinScore() {
  const lowThreshold = searchKnowledgeBase('random unique words xyz', { min_score: 0.01 });
  const highThreshold = searchKnowledgeBase('random unique words xyz', { min_score: 0.9 });
  
  if (highThreshold.results.length > lowThreshold.results.length) {
    throw new Error('Higher min_score should return fewer or equal results');
  }
}

// Test: searchKnowledgeBase filters by domain
export function testSearchFiltersByDomain() {
  const writingResults = searchKnowledgeBase('structure', { domains: ['writing'], min_score: 0.1 });
  const lawResults = searchKnowledgeBase('structure', { domains: ['law'], min_score: 0.1 });
  
  // Writing domain should find different results than law domain
  // (or no results if domain doesn't match)
  for (const result of writingResults.results) {
    if (result.domain !== 'writing') {
      throw new Error('Domain filter should only return matching domain');
    }
  }
}

// Test: searchKnowledgeBase returns snippet
export function testSearchReturnsSnippet() {
  const results = searchKnowledgeBase('CRISPR genetics biotechnology');
  
  if (results.results.length === 0) {
    throw new Error('Should find results for CRISPR query');
  }
  
  const first = results.results[0];
  if (!first.snippet) {
    throw new Error('Result should have snippet');
  }
  if (first.snippet.length > 200) {
    throw new Error('Snippet should be truncated to 200 chars');
  }
}

// Test: getKnowledgeEntry returns entry by ID
export function testGetKnowledgeEntryById() {
  const entry = getKnowledgeEntry('kb_001');
  
  if (!entry) {
    throw new Error('Should find entry kb_001');
  }
  if (entry.id !== 'kb_001') {
    throw new Error('Should return correct entry');
  }
  if (!entry.title || !entry.content) {
    throw new Error('Entry should have title and content');
  }
}

// Test: getKnowledgeEntry returns null for unknown ID
export function testGetKnowledgeEntryUnknownId() {
  const entry = getKnowledgeEntry('kb_nonexistent');
  
  if (entry !== null) {
    throw new Error('Should return null for unknown ID');
  }
}

// Test: searchKnowledgeBase results are sorted by relevance
export function testSearchResultsSortedByRelevance() {
  const results = searchKnowledgeBase('writing story narrative character', { top_k: 5, min_score: 0.1 });
  
  if (results.results.length < 2) {
    // Not enough results to test sorting
    return;
  }
  
  for (let i = 1; i < results.results.length; i++) {
    if (results.results[i].relevance_score > results.results[i - 1].relevance_score) {
      throw new Error('Results should be sorted by relevance (descending)');
    }
  }
}

// Test: searchKnowledgeBase includes search params in response
export function testSearchIncludesParams() {
  const results = searchKnowledgeBase('test query', { top_k: 3, min_score: 0.4, domains: ['writing'] });
  
  if (!results.search_params) {
    throw new Error('Should include search_params');
  }
  if (results.search_params.top_k !== 3) {
    throw new Error('search_params should include top_k');
  }
  if (results.search_params.min_score !== 0.4) {
    throw new Error('search_params should include min_score');
  }
  if (!Array.isArray(results.search_params.domains)) {
    throw new Error('search_params should include domains');
  }
}

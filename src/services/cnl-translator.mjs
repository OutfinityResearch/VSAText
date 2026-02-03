/**
 * CNL Translator Service
 * 
 * Rule-based translation from natural language to SVO CNL.
 * 
 * Output format: Subject-Verb-Object statements
 *   Anna is protagonist
 *   Story requires "happy ending"
 *   World forbids "violence"
 */

import { parseCNL, extractConstraints } from '../cnl/validator.mjs';

// Helper functions
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function sanitizeId(str) {
  return str.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

// Pattern definitions - now output SVO CNL
const PATTERNS = [
  // Character patterns
  {
    regex: /(?:the\s+)?character\s+(?:named\s+)?["']?(\w+)["']?\s+(?:must\s+be|is|should\s+be)\s+([\w\s]+)/gi,
    handler: (m) => `${capitalize(m[1])} is character\n${capitalize(m[1])} has trait ${m[2].trim().replace(/\s+/g, '_')}`
  },
  {
    regex: /(?:introduce|create)\s+(?:a\s+)?character\s+(?:named\s+)?["']?(\w+)["']?/gi,
    handler: (m) => `${capitalize(m[1])} is character`
  },
  {
    regex: /["']?(\w+)["']?\s+must\s+(?:stay|remain|be)\s+([\w\s]+)/gi,
    handler: (m) => `${capitalize(m[1])} is character\n${capitalize(m[1])} has trait ${m[2].trim().replace(/\s+/g, '_')}`
  },
  
  // Goal patterns
  {
    regex: /(?:the\s+)?(?:main\s+)?character\s+(?:must|should|wants\s+to)\s+(protect|save|find|destroy|help)\s+(?:their\s+|the\s+)?["']?([\w\s]+)["']?/gi,
    handler: (m) => `Protagonist is character\nProtagonist wants "${m[1]} ${m[2].trim()}"`
  },
  {
    regex: /["']?(\w+)["']?\s+(?:must|should|wants\s+to)\s+(protect|save|find|destroy|help)\s+(?:their\s+|the\s+)?["']?([\w\s]+)["']?/gi,
    handler: (m) => `${capitalize(m[1])} wants "${m[2]} ${m[3].trim()}"`
  },
  
  // Scene/chapter patterns - now use SVO requires/must
  {
    regex: /(?:in\s+)?scene\s+(\d+)\s+(?:must\s+)?(?:include|contain|have|show)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `Scene_${m[1]} requires "${m[2].trim()}"`
  },
  {
    regex: /(?:in\s+)?chapter\s+(\d+)\s+(?:must\s+)?(?:include|contain|have|introduce)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `Chapter_${m[1]} requires "${m[2].trim()}"`
  },
  {
    regex: /(?:by\s+)?act\s+(\d+)\s+(?:must\s+)?reveal\s+(?:that\s+)?["']?([\w\s]+)["']?/gi,
    handler: (m) => `Act_${m[1]} must reveal "${m[2].trim()}"`
  },
  
  // Forbid patterns - now use SVO forbids
  {
    regex: /(?:no|never|avoid|forbid|don't\s+use)\s+["']?([\w\s]+)["']?\s+(?:in\s+the\s+)?(?:story|narrative|world)?/gi,
    handler: (m) => `World forbids "${m[1].trim()}"`
  },
  {
    regex: /keep\s+(?:the\s+)?story\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `Story has tone ${m[1].trim().replace(/\s+/g, '_')}`
  },
  {
    regex: /the\s+(?:protagonist|main\s+character)\s+should\s+never\s+([\w\s]+)/gi,
    handler: (m) => `Protagonist is character\nProtagonist forbids "${m[1].trim()}"`
  },
  
  // Structure patterns
  {
    regex: /(?:write|create)\s+(?:a\s+)?(\d+)[\s-]act\s+structure/gi,
    handler: (m) => `Story has format screenplay\nStory has acts ${m[1]}`
  },
  {
    regex: /(?:limit|keep)\s+(?:to\s+)?(\d+)\s+(?:main\s+)?characters/gi,
    handler: (m) => `Story has max characters ${m[1]}`
  },
  
  // Style patterns
  {
    regex: /use\s+(first|second|third)[\s-]person\s+(?:voice|pov|perspective)/gi,
    handler: (m) => `Story has pov ${m[1]}_person`
  },
  {
    regex: /(?:the\s+)?tone\s+(?:should\s+be|must\s+be|is)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `Story has tone ${m[1].trim().replace(/\s+/g, '_')}`
  },
  {
    regex: /ending\s+(?:should\s+be|must\s+be|is)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `Ending has tone ${m[1].trim().replace(/\s+/g, '_')}`
  },
  
  // Guardrail patterns - now use SVO forbids
  {
    regex: /avoid\s+(?:clich[eé]s?\s+like\s+)?["']([^"']+)["']/gi,
    handler: (m) => `Story forbids "${m[1]}"`
  },
  {
    regex: /detect\s+(?:and\s+flag\s+)?(?:any\s+)?stereotypes/gi,
    handler: () => `Story forbids "stereotypes"`
  },
  {
    regex: /flag\s+(?:any\s+)?(?:personally\s+)?identifying\s+information/gi,
    handler: () => `Story forbids "PII"`
  }
];

/**
 * Translate natural language to SVO CNL using rule-based patterns
 * @param {string} nlText - Natural language text
 * @param {Object} context - Optional context
 * @returns {Object} Translation result
 */
function translateNlToCnl(nlText, context = {}) {
  const results = [];
  let matchCount = 0;

  // Split by sentence-like boundaries
  const sentences = nlText.split(/[.!?;]\s*/).filter(s => s.trim());
  
  for (const sentence of sentences) {
    let matched = false;
    
    for (const pattern of PATTERNS) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      const match = regex.exec(sentence);
      
      if (match) {
        const cnl = pattern.handler(match);
        // Split multi-line results and add each
        for (const line of cnl.split('\n')) {
          if (line.trim() && !results.includes(line.trim())) {
            results.push(line.trim());
          }
        }
        matchCount++;
        matched = true;
      }
    }
    
    // If no pattern matched, try generic extraction
    if (!matched && sentence.length > 10) {
      const generic = extractGenericConstraint(sentence);
      if (generic && !results.includes(generic)) {
        results.push(generic);
      }
    }
  }

  const cnlText = results.join('\n');
  const confidence = Math.min(0.95, 0.3 + (matchCount * 0.15));
  
  // Validate the generated CNL
  const parseResult = parseCNL(cnlText);
  
  return {
    cnl_text: cnlText,
    confidence: parseResult.valid ? confidence : confidence * 0.5,
    ast: parseResult.ast,
    errors: parseResult.errors,
    matched_patterns: matchCount,
    source_sentences: sentences.length
  };
}

/**
 * Extract a generic constraint when no specific pattern matches
 */
function extractGenericConstraint(sentence) {
  const lower = sentence.toLowerCase().trim();
  
  // Must include patterns
  if (lower.includes('must include') || lower.includes('should include')) {
    const match = sentence.match(/(?:must|should)\s+include\s+["']?([\w\s]+)["']?/i);
    if (match) {
      return `Story requires "${match[1].trim()}"`;
    }
  }
  
  // Must have patterns
  if (lower.includes('must have') || lower.includes('should have')) {
    const match = sentence.match(/(?:must|should)\s+have\s+["']?([\w\s]+)["']?/i);
    if (match) {
      return `Story requires "${match[1].trim()}"`;
    }
  }
  
  return null;
}

/**
 * Validate CNL text
 * @param {string} cnlText - CNL text to validate
 * @returns {Object} Validation result with AST
 */
function validateCnl(cnlText) {
  return parseCNL(cnlText);
}

/**
 * Parse CNL text into structured constraints
 * Uses the unified AST from parseCNL
 * @param {string} cnlText - CNL text to parse
 * @returns {Object} Parsed constraints
 */
function parseCnlToConstraints(cnlText) {
  const result = parseCNL(cnlText);
  
  if (!result.valid) {
    return { constraints: extractConstraints(result.ast), errors: result.errors };
  }
  
  return { 
    constraints: extractConstraints(result.ast), 
    errors: [] 
  };
}

/**
 * Generate SVO CNL from a spec object
 * Useful for converting UI state to CNL
 * @param {Object} spec - Specification object
 * @returns {string} Generated CNL text
 */
function generateCnlFromSpec(spec) {
  const lines = [];
  
  // Project metadata
  if (spec.title) {
    lines.push(`Project has title "${spec.title}"`);
  }
  if (spec.format || spec.genre) {
    lines.push(`Project has genre ${spec.format || spec.genre}`);
  }
  
  // Characters
  if (spec.characters) {
    for (const char of spec.characters) {
      const name = typeof char === 'string' ? char : char.name;
      const role = typeof char === 'string' ? 'character' : (char.role || char.archetype || 'character');
      lines.push(`${capitalize(name)} is ${role}`);
      
      if (char.traits) {
        for (const trait of char.traits) {
          lines.push(`${capitalize(name)} has trait ${trait}`);
        }
      }
    }
  }
  
  // Locations
  if (spec.locations) {
    for (const loc of spec.locations) {
      const name = typeof loc === 'string' ? loc : loc.name;
      lines.push(`${capitalize(sanitizeId(name))} is location`);
    }
  }
  
  // Tone
  if (spec.tone) {
    lines.push(`Story has tone ${spec.tone}`);
  }
  
  // Themes
  if (spec.themes) {
    for (const theme of spec.themes) {
      lines.push(`Story has theme ${theme}`);
    }
  }
  
  // Append existing CNL constraints if present
  if (spec.cnl_constraints && typeof spec.cnl_constraints === 'string') {
    // Already in SVO format - just append
    lines.push(spec.cnl_constraints);
  }
  
  return lines.join('\n');
}

export {
  translateNlToCnl,
  validateCnl,
  parseCnlToConstraints,
  generateCnlFromSpec,
  PATTERNS
};

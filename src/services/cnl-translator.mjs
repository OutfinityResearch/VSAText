/**
 * CNL Translator Service
 * Rule-based translation from natural language to CNL
 * For research phase - deterministic patterns without LLM dependency
 */

import { validateText } from '../cnl/validator.mjs';

// Pattern definitions for common narrative constraints
const PATTERNS = [
  // Character patterns
  {
    regex: /(?:the\s+)?character\s+(?:named\s+)?["']?(\w+)["']?\s+(?:must\s+be|is|should\s+be)\s+([\w\s]+)/gi,
    handler: (m) => `CHARACTER(${capitalize(m[1])}).\nTRAIT(${capitalize(m[1])}, ${m[2].trim().replace(/\s+/g, '_')}).`
  },
  {
    regex: /(?:introduce|create)\s+(?:a\s+)?character\s+(?:named\s+)?["']?(\w+)["']?/gi,
    handler: (m) => `CHARACTER(${capitalize(m[1])}).`
  },
  {
    regex: /["']?(\w+)["']?\s+must\s+(?:stay|remain|be)\s+([\w\s]+)/gi,
    handler: (m) => `CHARACTER(${capitalize(m[1])}).\nTRAIT(${capitalize(m[1])}, ${m[2].trim().replace(/\s+/g, '_')}).`
  },
  
  // Goal patterns
  {
    regex: /(?:the\s+)?(?:main\s+)?character\s+(?:must|should|wants\s+to)\s+(protect|save|find|destroy|help)\s+(?:their\s+|the\s+)?["']?([\w\s]+)["']?/gi,
    handler: (m) => `CHARACTER(Main).\nGOAL(Main, ${m[1]}, "${m[2].trim()}").`
  },
  {
    regex: /["']?(\w+)["']?\s+(?:must|should|wants\s+to)\s+(protect|save|find|destroy|help)\s+(?:their\s+|the\s+)?["']?([\w\s]+)["']?/gi,
    handler: (m) => `GOAL(${capitalize(m[1])}, ${m[2]}, "${m[3].trim()}").`
  },
  
  // Scene/chapter patterns
  {
    regex: /(?:in\s+)?scene\s+(\d+)\s+(?:must\s+)?(?:include|contain|have|show)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `RULE(Scene_${m[1]}, must_include, "${m[2].trim()}").`
  },
  {
    regex: /(?:in\s+)?chapter\s+(\d+)\s+(?:must\s+)?(?:include|contain|have|introduce)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `RULE(Chapter_${m[1]}, must_include, "${m[2].trim()}").`
  },
  {
    regex: /(?:by\s+)?act\s+(\d+)\s+(?:must\s+)?reveal\s+(?:that\s+)?["']?([\w\s]+)["']?/gi,
    handler: (m) => `RULE(Act_${m[1]}, must_reveal, "${m[2].trim()}").`
  },
  
  // Forbid patterns
  {
    regex: /(?:no|never|avoid|forbid|don't\s+use)\s+["']?([\w\s]+)["']?\s+(?:in\s+the\s+)?(?:story|narrative|world)?/gi,
    handler: (m) => `RULE(World, forbid, "${m[1].trim()}").`
  },
  {
    regex: /keep\s+(?:the\s+)?story\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `RULE(Story, tone, ${m[1].trim().replace(/\s+/g, '_')}).`
  },
  {
    regex: /the\s+(?:protagonist|main\s+character)\s+should\s+never\s+([\w\s]+)/gi,
    handler: (m) => `CHARACTER(Protagonist).\nRULE(Protagonist, forbid, "${m[1].trim()}").`
  },
  
  // Structure patterns
  {
    regex: /(?:write|create)\s+(?:a\s+)?(\d+)[\s-]act\s+structure/gi,
    handler: (m) => `FORMAT(Screenplay, acts, ${m[1]}).`
  },
  {
    regex: /(?:limit|keep)\s+(?:to\s+)?(\d+)\s+(?:main\s+)?characters/gi,
    handler: (m) => `RULE(Story, max_characters, ${m[1]}).`
  },
  {
    regex: /explain\s+["']?([\w\s]+)["']?\s+in\s+(\d+)\s+(steps|bullets|points)/gi,
    handler: (m) => `FORMAT(Tutorial, ${m[3]}, ${m[2]}).\nRULE(Tutorial, topic, "${m[1].trim()}").`
  },
  
  // Style patterns
  {
    regex: /use\s+(first|second|third)[\s-]person\s+(?:voice|pov|perspective)/gi,
    handler: (m) => `RULE(Style, pov, ${m[1]}_person).`
  },
  {
    regex: /(?:the\s+)?tone\s+(?:should\s+be|must\s+be|is)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `RULE(Story, tone, ${m[1].trim().replace(/\s+/g, '_')}).`
  },
  {
    regex: /ending\s+(?:should\s+be|must\s+be|is)\s+["']?([\w\s]+)["']?/gi,
    handler: (m) => `RULE(Ending, tone, ${m[1].trim().replace(/\s+/g, '_')}).`
  },
  
  // Compliance patterns
  {
    regex: /cite\s+(?:at\s+least\s+)?(\d+)\s+sources/gi,
    handler: (m) => `RULE(Document, min_citations, ${m[1]}).`
  },
  {
    regex: /avoid\s+(?:any\s+)?(?:medical|legal)\s+claims/gi,
    handler: (m) => `RULE(Document, forbid, "medical claims").`
  },
  {
    regex: /include\s+(?:a\s+)?safety\s+warning/gi,
    handler: () => `RULE(Document, must_include, "safety warning").`
  },
  
  // Guardrail patterns
  {
    regex: /avoid\s+(?:clich[eé]s?\s+like\s+)?["']([^"']+)["']/gi,
    handler: (m) => `GUARDRAIL(Text, forbid_phrase, "${m[1]}").`
  },
  {
    regex: /detect\s+(?:and\s+flag\s+)?(?:any\s+)?stereotypes/gi,
    handler: () => `GUARDRAIL(Text, detect, stereotypes).\nGUARDRAIL(Text, action, flag).`
  },
  {
    regex: /flag\s+(?:any\s+)?(?:personally\s+)?identifying\s+information/gi,
    handler: () => `GUARDRAIL(Text, detect, PII).\nGUARDRAIL(Text, action, redact).`
  }
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Translate natural language to CNL using rule-based patterns
 */
function translateNlToCnl(nlText, context = {}) {
  const results = [];
  let remainingText = nlText;
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
        if (cnl && !results.includes(cnl)) {
          results.push(cnl);
          matchCount++;
          matched = true;
        }
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
  const { statements, errors } = validateText(cnlText);
  
  return {
    cnl_text: cnlText,
    confidence: errors.length === 0 ? confidence : confidence * 0.5,
    statements,
    errors,
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
      return `RULE(Document, must_include, "${match[1].trim()}").`;
    }
  }
  
  // Must have patterns
  if (lower.includes('must have') || lower.includes('should have')) {
    const match = sentence.match(/(?:must|should)\s+have\s+["']?([\w\s]+)["']?/i);
    if (match) {
      return `RULE(Document, must_include, "${match[1].trim()}").`;
    }
  }
  
  return null;
}

/**
 * Validate existing CNL text
 */
function validateCnl(cnlText) {
  return validateText(cnlText);
}

/**
 * Parse CNL statements into structured constraints
 */
function parseCnlToConstraints(cnlText) {
  const { statements, errors } = validateText(cnlText);
  
  if (errors.length > 0) {
    return { constraints: [], errors };
  }
  
  const constraints = statements.map(stmt => {
    const predicate = stmt.predicate;
    const args = stmt.args.map(a => 
      typeof a === 'string' && a.startsWith('"') ? a.slice(1, -1) : a
    );
    
    return {
      type: predicate,
      args,
      raw: `${predicate}(${stmt.args.join(', ')}).`
    };
  });
  
  return { constraints, errors: [] };
}

export {
  translateNlToCnl,
  validateCnl,
  parseCnlToConstraints,
  PATTERNS
};

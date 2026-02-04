#!/usr/bin/env node
/**
 * SCRIPTA Evaluation Runner
 * 
 * Generates multiple story variants and evaluates them.
 * Outputs results to console with colors and as JSON.
 * 
 * Usage:
 *   node eval/runEval.mjs [--json]
 */

import { evaluateCNL } from '../src/evaluate.mjs';

// ============================================
// ANSI Colors for console output
// ============================================
const C = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// ============================================
// Test Configurations
// ============================================
const TEST_CONFIGS = [
  {
    id: 'random-fantasy-short',
    name: 'Random: Fantasy Short',
    strategy: 'random',
    genre: 'fantasy',
    length: 'short',
    chars: 'few',
    tone: 'balanced'
  },
  {
    id: 'random-fantasy-medium',
    name: 'Random: Fantasy Medium',
    strategy: 'random',
    genre: 'fantasy',
    length: 'medium',
    chars: 'medium',
    tone: 'balanced'
  },
  {
    id: 'random-scifi-medium',
    name: 'Random: SciFi Medium',
    strategy: 'random',
    genre: 'scifi',
    length: 'medium',
    chars: 'medium',
    tone: 'dark'
  },
  {
    id: 'random-mystery-long',
    name: 'Random: Mystery Long',
    strategy: 'random',
    genre: 'mystery',
    length: 'long',
    chars: 'many',
    tone: 'dark'
  },
  {
    id: 'random-romance-short',
    name: 'Random: Romance Short',
    strategy: 'random',
    genre: 'romance',
    length: 'short',
    chars: 'few',
    tone: 'light'
  },
  {
    id: 'random-horror-medium',
    name: 'Random: Horror Medium',
    strategy: 'random',
    genre: 'horror',
    length: 'medium',
    chars: 'medium',
    tone: 'dark'
  },
  {
    id: 'random-adventure-long',
    name: 'Random: Adventure Long',
    strategy: 'random',
    genre: 'adventure',
    length: 'long',
    chars: 'many',
    tone: 'light'
  },
  {
    id: 'random-comedy-short',
    name: 'Random: Comedy Short',
    strategy: 'random',
    genre: 'comedy',
    length: 'short',
    chars: 'few',
    tone: 'comedic'
  },
  {
    id: 'random-drama-medium',
    name: 'Random: Drama Medium',
    strategy: 'random',
    genre: 'drama',
    length: 'medium',
    chars: 'medium',
    tone: 'balanced'
  },
  {
    id: 'random-fantasy-complex',
    name: 'Random: Fantasy Complex',
    strategy: 'random',
    genre: 'fantasy',
    length: 'long',
    chars: 'many',
    tone: 'dark'
  }
];

// ============================================
// Simple CNL Generator (mirrors demo logic)
// ============================================

const NAMES = {
  fantasy: ['Aldric', 'Elara', 'Theron', 'Lyra', 'Grimwald', 'Seraphina', 'Kael', 'Morgana'],
  scifi: ['Nova', 'Orion', 'Zara', 'Rex', 'Aria', 'Cyrus', 'Luna', 'Atlas'],
  mystery: ['Detective Blake', 'Sarah', 'Marcus', 'Elena', 'Inspector Wells', 'Julia', 'Thomas'],
  romance: ['Emma', 'James', 'Sophia', 'Alexander', 'Isabella', 'William', 'Olivia'],
  horror: ['Jack', 'Mary', 'Dr. Crane', 'Emily', 'The Shadow', 'Father Marcus'],
  adventure: ['Captain Drake', 'Maya', 'Rex', 'Zara', 'Professor Stone', 'Nina'],
  drama: ['Michael', 'Sarah', 'David', 'Elizabeth', 'Robert', 'Anna'],
  comedy: ['Bob', 'Alice', 'Chuck', 'Diane', 'Eddie', 'Fiona']
};

const LOCATIONS = {
  fantasy: ['Ancient Forest', 'Crystal Tower', 'Dragon Peak', 'Shadow Vale', 'Royal Palace'],
  scifi: ['Space Station Alpha', 'Mars Colony', 'Quantum Lab', 'Starship Bridge', 'Alien Planet'],
  mystery: ['Old Mansion', 'Police Station', 'Dark Alley', 'Library', 'Crime Scene'],
  romance: ['Café Paris', 'Beach Resort', 'City Apartment', 'Garden', 'Wedding Venue'],
  horror: ['Abandoned Hospital', 'Haunted House', 'Cemetery', 'Dark Forest', 'Basement'],
  adventure: ['Lost Temple', 'Jungle', 'Mountain Peak', 'Hidden Cave', 'Desert Oasis'],
  drama: ['Family Home', 'Office', 'Hospital', 'Courtroom', 'Restaurant'],
  comedy: ['Office', 'Coffee Shop', 'Apartment', 'Mall', 'Beach']
};

const ARCHETYPES = ['hero', 'mentor', 'shadow', 'ally', 'trickster', 'guardian'];
const TRAITS = ['brave', 'cunning', 'loyal', 'mysterious', 'wise', 'impulsive', 'calm', 'fierce'];
const THEMES = ['redemption', 'love', 'sacrifice', 'power', 'identity', 'justice', 'survival', 'freedom'];
const RELATIONSHIPS = ['mentor_student', 'rival', 'ally', 'enemy', 'sibling', 'romantic'];

function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

function generateCNL(config) {
  const { genre, length, chars, tone } = config;
  
  const charCount = chars === 'few' ? 3 : chars === 'medium' ? 5 : 8;
  const sceneCount = length === 'short' ? 4 : length === 'medium' ? 8 : 15;
  const locCount = length === 'short' ? 2 : length === 'medium' ? 4 : 6;
  
  const names = pickRandom(NAMES[genre] || NAMES.fantasy, charCount);
  const locations = pickRandom(LOCATIONS[genre] || LOCATIONS.fantasy, locCount);
  const themes = pickRandom(THEMES, 2);
  
  let cnl = `// Auto-generated CNL\n// ${config.name}\n// Genre: ${genre}, Length: ${length}\n\n`;
  cnl += `#hint: Treat this CNL as a deterministic specification. Avoid inventing extra plot elements during generation.\n`;
  cnl += `#hint: Use SVO statements as ground truth (WHAT). Use annotations to guide prose (HOW).\n\n`;
  
  // Characters
  cnl += '// Characters\n';
  names.forEach((name, i) => {
    const arch = ARCHETYPES[i % ARCHETYPES.length];
    const trait1 = pickRandom(TRAITS);
    const trait2 = pickRandom(TRAITS.filter(t => t !== trait1));
    cnl += `${name.replace(/\s+/g, '_')} is ${arch}\n`;
    cnl += `${name.replace(/\s+/g, '_')} has trait ${trait1}\n`;
    cnl += `${name.replace(/\s+/g, '_')} has trait ${trait2}\n`;
  });
  cnl += '\n';
  
  // Relationships
  cnl += '// Relationships\n';
  for (let i = 0; i < Math.min(charCount - 1, 4); i++) {
    const from = names[i].replace(/\s+/g, '_');
    const to = names[(i + 1) % names.length].replace(/\s+/g, '_');
    const rel = pickRandom(RELATIONSHIPS);
    cnl += `${from} relates to ${to} as ${rel}\n`;
  }
  cnl += '\n';
  
  // Locations
  cnl += '// Locations\n';
  locations.forEach(loc => {
    cnl += `${loc.replace(/\s+/g, '_')} is location\n`;
  });
  cnl += '\n';
  
  // Themes
  cnl += '// Themes\n';
  themes.forEach((theme, idx) => {
    const role = idx === 0 ? 'primary' : 'secondary';
    cnl += `Story has theme ${theme} as ${role}\n`;
  });
  cnl += '\n';
  
  // Structure
  cnl += '// Structure\n';
  cnl += 'Book1 group begin\n';
  cnl += '  Book1 has title "Generated Story"\n';
  
  const chapCount = length === 'short' ? 1 : length === 'medium' ? 3 : 5;
  const scenesPerChap = Math.ceil(sceneCount / chapCount);
  
  for (let c = 1; c <= chapCount; c++) {
    cnl += `  Chapter${c} group begin\n`;
    cnl += `    Chapter${c} has title "Chapter ${c}"\n`;
    
    for (let s = 1; s <= scenesPerChap; s++) {
      const sceneNum = (c - 1) * scenesPerChap + s;
      if (sceneNum > sceneCount) break;
      
      cnl += `    Scene${sceneNum} group begin\n`;
      cnl += `      Scene${sceneNum} has title "Scene ${sceneNum}"\n`;
      
      // Add character ref
      const char = names[sceneNum % names.length].replace(/\s+/g, '_');
      cnl += `      Scene${sceneNum} includes character ${char}\n`;
      
      // Add location ref
      const loc = locations[sceneNum % locations.length].replace(/\s+/g, '_');
      cnl += `      Scene${sceneNum} includes location ${loc}\n`;
      
      // Add action
      cnl += `      ${char} explores ${loc}\n`;
      
      cnl += `    Scene${sceneNum} group end\n`;
    }
    
    cnl += `  Chapter${c} group end\n`;
  }
  
  cnl += 'Book1 group end\n';
  
  return cnl;
}

// ============================================
// Run Evaluation
// ============================================

async function runEvaluation(config) {
  const startTime = Date.now();
  
  // Generate CNL
  const cnl = generateCNL(config);
  
  // Evaluate
  const result = evaluateCNL(cnl);
  
  return {
    config,
    cnl,
    result,
    timeMs: Date.now() - startTime
  };
}

// ============================================
// Console Output Formatting
// ============================================

function formatScore(score, threshold = 0.7) {
  const pct = (score * 100).toFixed(0);
  if (score >= threshold) {
    return `${C.green}${pct}%${C.reset}`;
  } else if (score >= threshold * 0.7) {
    return `${C.yellow}${pct}%${C.reset}`;
  } else {
    return `${C.red}${pct}%${C.reset}`;
  }
}

function printHeader() {
  console.log('\n');
  console.log(`${C.bgBlue}${C.white}${C.bright}  SCRIPTA Evaluation Runner  ${C.reset}`);
  console.log(`${C.dim}${'─'.repeat(60)}${C.reset}\n`);
}

function printConfigResult(evalResult, index) {
  const { config, result, timeMs } = evalResult;
  
  console.log(`${C.bright}${C.cyan}[${index + 1}/${TEST_CONFIGS.length}]${C.reset} ${C.bright}${config.name}${C.reset}`);
  console.log(`    ${C.dim}Genre: ${config.genre} | Length: ${config.length} | Chars: ${config.chars}${C.reset}`);
  
  if (!result.success) {
    console.log(`    ${C.red}✗ Evaluation failed: ${result.message}${C.reset}\n`);
    return;
  }
  
  const m = result.metrics;
  const nqs = result.summary.nqs;
  
  console.log(`    ${C.bright}NQS: ${formatScore(nqs)}${C.reset} (${result.summary.interpretation})`);
  console.log(`    ├─ Completeness:    ${formatScore(m.completeness?.score || 0, 0.8)}`);
  console.log(`    ├─ Coherence:       ${formatScore(m.coherence?.score || 0, 0.75)}`);
  console.log(`    ├─ Originality:     ${formatScore(m.originality?.score || 0, 0.5)}`);
  console.log(`    ├─ Explainability:  ${formatScore(m.explainability?.score || 0, 0.7)}`);
  console.log(`    ├─ Char Continuity: ${formatScore(m.characterContinuity?.score || 0, 0.6)}`);
  console.log(`    ├─ Location Logic:  ${formatScore(m.locationLogic?.score || 0, 0.5)}`);
  console.log(`    └─ Scene Complete:  ${formatScore(m.sceneCompleteness?.score || 0, 0.7)}`);
  console.log(`    ${C.dim}Time: ${timeMs}ms | Scenes: ${result.structure?.scenes || 0} | Chars: ${result.structure?.characters || 0}${C.reset}`);
  console.log('');
}

function printSummary(results) {
  console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
  console.log(`${C.bright}${C.magenta}  SUMMARY${C.reset}\n`);
  
  const successful = results.filter(r => r.result.success);
  const nqsScores = successful.map(r => r.result.summary.nqs);
  
  if (nqsScores.length === 0) {
    console.log(`  ${C.red}No successful evaluations${C.reset}\n`);
    return;
  }
  
  const avgNqs = nqsScores.reduce((a, b) => a + b, 0) / nqsScores.length;
  const minNqs = Math.min(...nqsScores);
  const maxNqs = Math.max(...nqsScores);
  
  console.log(`  ${C.bright}Average NQS:${C.reset} ${formatScore(avgNqs)}`);
  console.log(`  ${C.bright}Min NQS:${C.reset}     ${formatScore(minNqs)}`);
  console.log(`  ${C.bright}Max NQS:${C.reset}     ${formatScore(maxNqs)}`);
  console.log('');
  
  // Distribution
  const excellent = nqsScores.filter(s => s >= 0.85).length;
  const good = nqsScores.filter(s => s >= 0.7 && s < 0.85).length;
  const fair = nqsScores.filter(s => s >= 0.5 && s < 0.7).length;
  const poor = nqsScores.filter(s => s < 0.5).length;
  
  console.log(`  ${C.bright}Distribution:${C.reset}`);
  console.log(`    ${C.green}Excellent (≥85%):${C.reset} ${excellent}`);
  console.log(`    ${C.cyan}Good (70-84%):${C.reset}    ${good}`);
  console.log(`    ${C.yellow}Fair (50-69%):${C.reset}    ${fair}`);
  console.log(`    ${C.red}Poor (<50%):${C.reset}      ${poor}`);
  console.log('');
  
  // Table view
  console.log(`  ${C.bright}Results Table:${C.reset}`);
  console.log(`  ${'─'.repeat(56)}`);
  console.log(`  ${C.dim}${'Name'.padEnd(30)} ${'NQS'.padStart(6)} ${'Comp'.padStart(6)} ${'Coh'.padStart(6)}${C.reset}`);
  console.log(`  ${'─'.repeat(56)}`);
  
  for (const r of successful) {
    const name = r.config.name.substring(0, 28).padEnd(30);
    const nqs = ((r.result.summary.nqs * 100).toFixed(0) + '%').padStart(6);
    const comp = ((r.result.metrics.completeness?.score * 100 || 0).toFixed(0) + '%').padStart(6);
    const coh = ((r.result.metrics.coherence?.score * 100 || 0).toFixed(0) + '%').padStart(6);
    console.log(`  ${name} ${nqs} ${comp} ${coh}`);
  }
  console.log(`  ${'─'.repeat(56)}`);
  console.log('');
}

// ============================================
// Main
// ============================================

async function main() {
  const jsonOutput = process.argv.includes('--json');
  
  if (!jsonOutput) {
    printHeader();
  }
  
  const results = [];
  
  for (let i = 0; i < TEST_CONFIGS.length; i++) {
    const config = TEST_CONFIGS[i];
    
    if (!jsonOutput) {
      process.stdout.write(`${C.dim}Evaluating ${config.name}...${C.reset}\r`);
    }
    
    try {
      const evalResult = await runEvaluation(config);
      results.push(evalResult);
      
      if (!jsonOutput) {
        printConfigResult(evalResult, i);
      }
    } catch (err) {
      results.push({
        config,
        result: { success: false, message: err.message },
        timeMs: 0
      });
      
      if (!jsonOutput) {
        console.log(`${C.red}[${i + 1}] ${config.name}: ERROR - ${err.message}${C.reset}\n`);
      }
    }
  }
  
  if (jsonOutput) {
    // Output JSON for demo consumption
    const jsonResult = {
      evaluatedAt: new Date().toISOString(),
      totalTests: TEST_CONFIGS.length,
      successful: results.filter(r => r.result.success).length,
      results: results.map(r => ({
        id: r.config.id,
        name: r.config.name,
        config: {
          genre: r.config.genre,
          length: r.config.length,
          chars: r.config.chars,
          tone: r.config.tone
        },
        success: r.result.success,
        nqs: r.result.success ? r.result.summary.nqs : null,
        interpretation: r.result.success ? r.result.summary.interpretation : null,
        metrics: r.result.success ? {
          completeness: r.result.metrics.completeness?.score,
          coherence: r.result.metrics.coherence?.score,
          originality: r.result.metrics.originality?.score,
          explainability: r.result.metrics.explainability?.score,
          characterContinuity: r.result.metrics.characterContinuity?.score,
          locationLogic: r.result.metrics.locationLogic?.score,
          sceneCompleteness: r.result.metrics.sceneCompleteness?.score,
          parseSuccess: r.result.metrics.parseSuccess?.score
        } : null,
        structure: r.result.success ? r.result.structure : null,
        timeMs: r.timeMs,
        error: r.result.success ? null : r.result.message
      })),
      summary: (() => {
        const successful = results.filter(r => r.result.success);
        const nqsScores = successful.map(r => r.result.summary.nqs);
        if (nqsScores.length === 0) return null;
        return {
          avgNqs: nqsScores.reduce((a, b) => a + b, 0) / nqsScores.length,
          minNqs: Math.min(...nqsScores),
          maxNqs: Math.max(...nqsScores),
          distribution: {
            excellent: nqsScores.filter(s => s >= 0.85).length,
            good: nqsScores.filter(s => s >= 0.7 && s < 0.85).length,
            fair: nqsScores.filter(s => s >= 0.5 && s < 0.7).length,
            poor: nqsScores.filter(s => s < 0.5).length
          }
        };
      })()
    };
    
    console.log(JSON.stringify(jsonResult, null, 2));
  } else {
    printSummary(results);
  }
  
  return results;
}

// Run if called directly
main().catch(err => {
  console.error(`${C.red}Fatal error: ${err.message}${C.reset}`);
  process.exit(1);
});

export { runEvaluation, TEST_CONFIGS, generateCNL };

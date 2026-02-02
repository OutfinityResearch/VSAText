#!/usr/bin/env node
/**
 * SCRIPTA CNL CLI
 * 
 * Command-line interface for parsing and validating CNL files.
 * Uses the unified SVO parser from demo/cnl-parser.mjs
 */

import fs from 'fs';
import { parseCNL, extractEntities, generateMarkdown, generateSkeleton, countGroups } from './validator.mjs';

function printUsage() {
  console.log(`
SCRIPTA CNL CLI v2.0

Usage: node cli.mjs <file.cnl> [format]

Formats:
  json      - Full AST output (default)
  summary   - Brief summary of entities and structure
  markdown  - Export as Markdown document
  skeleton  - Generate narrative skeleton

Examples:
  node cli.mjs examples.cnl
  node cli.mjs examples.cnl summary
  node cli.mjs examples.cnl markdown > story.md
  echo "Anna is hero" | node cli.mjs - summary
`);
}

function loadInput() {
  const arg = process.argv[2];
  
  if (!arg || arg === '--help' || arg === '-h') {
    printUsage();
    process.exit(0);
  }
  
  if (arg === '-') {
    // Read from stdin
    return fs.readFileSync(0, 'utf-8');
  }
  
  if (!fs.existsSync(arg)) {
    console.error(`Error: File not found: ${arg}`);
    process.exit(1);
  }
  
  return fs.readFileSync(arg, 'utf-8');
}

function formatOutput(result, format) {
  switch (format) {
    case 'markdown':
    case 'md':
      return generateMarkdown(result.ast);
      
    case 'skeleton':
      return generateSkeleton(result.ast);
      
    case 'summary': {
      const entities = extractEntities(result.ast);
      const lines = [
        'CNL Validation Summary',
        '======================',
        `Valid: ${result.valid ? 'Yes' : 'No'}`,
        `Errors: ${result.errors.length}`,
        `Warnings: ${result.warnings.length}`,
        '',
        'Entities:',
        `  Characters: ${entities.characters.length}`,
        `  Locations: ${entities.locations.length}`,
        `  Themes: ${entities.themes.length}`,
        `  Objects: ${entities.objects.length}`,
        `  Other: ${entities.other.length}`,
        '',
        `Groups: ${countGroups(result.ast.groups)}`,
        `Relationships: ${result.ast.relationships.length}`,
        `References: ${result.ast.references.length}`,
        '',
        'Constraints:',
        `  Requires: ${result.ast.constraints.requires.length}`,
        `  Forbids: ${result.ast.constraints.forbids.length}`
      ];
      
      if (result.errors.length > 0) {
        lines.push('', 'Errors:');
        for (const err of result.errors) {
          lines.push(`  Line ${err.line}: ${err.message}`);
        }
      }
      
      return lines.join('\n');
    }
      
    case 'json':
    default:
      return JSON.stringify({
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        entities: result.ast.entities,
        groups: result.ast.groups.map(g => ({
          name: g.name,
          properties: g.properties,
          statementCount: g.statements.length,
          childCount: g.children?.length || 0
        })),
        relationships: result.ast.relationships,
        references: result.ast.references,
        constraints: result.ast.constraints
      }, null, 2);
  }
}

// Main execution
const text = loadInput();
const format = process.argv[3] || 'json';
const result = parseCNL(text);

console.log(formatOutput(result, format));
process.exit(result.valid ? 0 : 2);

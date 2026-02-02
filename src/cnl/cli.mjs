#!/usr/bin/env node
/**
 * SCRIPTA CNL CLI Tool
 * 
 * Command-line interface for CNL validation and processing.
 */

import fs from 'fs';
import {
  parseCNL,
  extractEntities,
  countGroups,
  generateMarkdown,
  generateSkeleton
} from './validator.mjs';

const filePath = process.argv[2];
const outputFormat = process.argv[3] || 'json';

if (!filePath) {
  console.log(`SCRIPTA CNL CLI v2.0

Usage: cli.mjs <file.cnl> [format]

Formats:
  json      - Full AST output (default)
  markdown  - Export as Markdown
  skeleton  - Generate narrative skeleton
  summary   - Brief summary

Example CNL syntax:
  Anna is protagonist
  Anna has trait courage
  Anna relates to Marcus as sibling
  
  Chapter1 group begin
    Chapter1 has title "The Beginning"
    Anna discovers artifact
  Chapter1 group end
`);
  process.exit(1);
}

try {
  const text = fs.readFileSync(filePath, 'utf-8');
  const result = parseCNL(text);
  
  switch (outputFormat) {
    case 'markdown':
    case 'md':
      console.log(generateMarkdown(result.ast));
      break;
      
    case 'skeleton':
      console.log(generateSkeleton(result.ast));
      break;
      
    case 'summary':
      const entities = extractEntities(result.ast);
      console.log(`CNL Validation Summary
======================
Valid: ${result.valid ? 'Yes' : 'No'}
Errors: ${result.errors.length}
Warnings: ${result.warnings.length}

Entities:
  Characters: ${entities.characters.length}
  Locations: ${entities.locations.length}
  Themes: ${entities.themes.length}
  Objects: ${entities.objects.length}

Groups: ${countGroups(result.ast.groups)}
Relationships: ${result.ast.relationships.length}
References: ${result.ast.references.length}

Constraints:
  Requires: ${result.ast.constraints.requires.length}
  Forbids: ${result.ast.constraints.forbids.length}
`);
      if (result.errors.length > 0) {
        console.log('Errors:');
        for (const err of result.errors) {
          console.log(`  Line ${err.line}: ${err.message}`);
        }
      }
      break;
      
    case 'json':
    default:
      console.log(JSON.stringify({
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
      }, null, 2));
      break;
  }
  
  process.exit(result.valid ? 0 : 2);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}

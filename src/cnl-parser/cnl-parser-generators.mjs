/**
 * SCRIPTA CNL Parser - Generators Module
 * 
 * Output generation functions for Markdown and skeleton content.
 */

import { extractEntities } from './cnl-parser-core.mjs';

/**
 * Generate Markdown from AST
 */
export function generateMarkdown(ast, options = {}) {
  const { includeMetadata = true, includeConstraints = true } = options;
  let md = '';
  
  // Project metadata
  const projectStmt = ast.statements.find(s => s.subject === 'Project' || s.subject === 'Story');
  if (includeMetadata && projectStmt) {
    const titleStmt = ast.statements.find(s => 
      (s.subject === 'Project' || s.subject === 'Story') && 
      s.verb === 'has' && 
      s.objects[0] === 'title'
    );
    if (titleStmt && titleStmt.objects[1]) {
      md += `# ${titleStmt.objects[1]}\n\n`;
    }
    
    const genreStmt = ast.statements.find(s => 
      (s.subject === 'Project' || s.subject === 'Story') && 
      s.verb === 'has' && 
      s.objects[0] === 'genre'
    );
    if (genreStmt && genreStmt.objects[1]) {
      md += `*Genre: ${genreStmt.objects[1]}*\n\n`;
    }
    md += '---\n\n';
  }
  
  // Characters section
  const entities = extractEntities(ast);
  if (entities.characters.length > 0) {
    md += '## Characters\n\n';
    for (const char of entities.characters) {
      md += `### ${char.name}\n`;
      md += `*${char.type}*\n\n`;
      if (char.traits.length > 0) {
        md += `**Traits:** ${char.traits.join(', ')}\n\n`;
      }
      if (char.relationships.length > 0) {
        md += '**Relationships:**\n';
        for (const rel of char.relationships) {
          md += `- ${rel.type} → ${rel.target}\n`;
        }
        md += '\n';
      }
      if (Object.keys(char.properties).length > 0) {
        for (const [key, val] of Object.entries(char.properties)) {
          if (key !== 'trait') {
            md += `**${key}:** ${val}\n`;
          }
        }
        md += '\n';
      }
    }
  }
  
  // Locations section
  if (entities.locations.length > 0) {
    md += '## Locations\n\n';
    for (const loc of entities.locations) {
      md += `### ${loc.name}\n`;
      for (const [key, val] of Object.entries(loc.properties)) {
        md += `- ${key}: ${val}\n`;
      }
      md += '\n';
    }
  }
  
  // Themes section
  if (entities.themes.length > 0) {
    md += '## Themes\n\n';
    for (const theme of entities.themes) {
      md += `- **${theme.name}**`;
      if (theme.properties.description) {
        md += `: ${theme.properties.description}`;
      }
      md += '\n';
    }
    md += '\n';
  }
  
  // Constraints section
  if (includeConstraints && (ast.constraints.requires.length > 0 || ast.constraints.forbids.length > 0)) {
    md += '## Constraints\n\n';
    if (ast.constraints.requires.length > 0) {
      md += '**Requirements:**\n';
      for (const r of ast.constraints.requires) {
        md += `- ${r.subject} requires ${r.target}\n`;
      }
      md += '\n';
    }
    if (ast.constraints.forbids.length > 0) {
      md += '**Forbidden:**\n';
      for (const f of ast.constraints.forbids) {
        md += `- ${f.subject} forbids ${f.target}\n`;
      }
      md += '\n';
    }
  }
  
  // Structure section (groups)
  if (ast.groups.length > 0) {
    md += '## Story Structure\n\n';
    
    function renderGroup(group, level = 3) {
      const heading = '#'.repeat(Math.min(level, 6));
      const title = group.properties.title || group.name;
      md += `${heading} ${title}\n\n`;
      
      for (const [key, val] of Object.entries(group.properties)) {
        if (key !== 'title') {
          md += `*${key}: ${val}*\n`;
        }
      }
      if (Object.keys(group.properties).length > 1) md += '\n';
      
      const events = group.statements.filter(s => 
        !['has', 'is', 'includes'].includes(s.verb)
      );
      if (events.length > 0) {
        for (const evt of events) {
          const obj = evt.objects.join(' ');
          const mods = Object.entries(evt.modifiers)
            .map(([k, v]) => `${k} ${v}`)
            .join(' ');
          md += `- ${evt.subject} **${evt.verb}** ${obj}${mods ? ' ' + mods : ''}\n`;
        }
        md += '\n';
      }
      
      for (const child of group.children || []) {
        renderGroup(child, level + 1);
      }
    }
    
    for (const group of ast.groups) {
      renderGroup(group);
    }
  }
  
  return md;
}

/**
 * Generate skeleton narrative content from AST
 */
export function generateSkeleton(ast) {
  let content = '';
  
  function processGroup(group, level = 1) {
    const title = group.properties.title || group.name;
    content += `${'#'.repeat(level)} ${title}\n\n`;
    
    const includes = group.statements.filter(s => s.verb === 'includes');
    if (includes.length > 0) {
      content += '[Setting: ';
      content += includes.map(s => s.objects.join(' ')).join(', ');
      content += ']\n\n';
    }
    
    const events = group.statements.filter(s => 
      !['has', 'is', 'includes', 'requires', 'forbids'].includes(s.verb)
    );
    
    for (const evt of events) {
      const subject = evt.subject;
      const verb = evt.verb;
      const obj = evt.objects.join(' ');
      const mods = Object.entries(evt.modifiers)
        .map(([k, v]) => `${k} ${v}`)
        .join(' ');
      
      content += `${subject} ${verb}`;
      if (obj) content += ` ${obj}`;
      if (mods) content += ` ${mods}`;
      content += '.\n';
    }
    
    if (events.length > 0) content += '\n';
    
    for (const child of group.children || []) {
      processGroup(child, level + 1);
    }
  }
  
  for (const group of ast.groups) {
    processGroup(group);
  }
  
  if (!content) {
    content = '[No structured content - add groups to your CNL specification]\n';
  }
  
  return content;
}

/**
 * Validate CNL text and return validation result with statements
 */
export function validateText(text, parseCNL) {
  const result = parseCNL(text);
  const statements = [];
  
  function collectStatements(source) {
    for (const stmt of source.statements || []) {
      if (stmt.type === 'statement') {
        statements.push({
          predicate: stmt.verb.toUpperCase(),
          args: [stmt.subject, ...stmt.objects]
        });
      }
    }
    for (const group of source.groups || source.children || []) {
      statements.push({ predicate: 'GROUP_BEGIN', args: [group.name] });
      collectStatements(group);
      statements.push({ predicate: 'GROUP_END', args: [group.name] });
    }
  }
  
  collectStatements(result.ast);
  
  return {
    statements,
    errors: result.errors,
    ast: result.ast
  };
}

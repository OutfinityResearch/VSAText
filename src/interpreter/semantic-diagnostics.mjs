/**
 * Metrics Interpreter - Semantic Diagnostics (DS12)
 *
 * Produces deterministic semantic errors/warnings derived from the AST/world model.
 * These diagnostics are used by metrics (e.g., CS LVP penalty).
 */

function normalizeString(x) {
  return String(x ?? '').trim();
}

function makeEntry(level, code, message, meta = {}) {
  return {
    level,
    code,
    message,
    line: Number.isFinite(meta.line) ? meta.line : null,
    details: meta.details ?? null
  };
}

function isKnownEntity(world, name) {
  return !!world?.entities?.registry?.[name];
}

function isKnownGroup(world, name) {
  const idx = world?._internal?.groupIndex?.byName;
  return !!(idx && idx.has(name));
}

function collectSceneEntityIssues(world) {
  const errors = [];
  const warnings = [];

  for (const sceneId of world?.scenes?.ordered_ids || []) {
    const scene = world?.scenes?.by_id?.[sceneId];
    if (!scene) continue;

    for (const id of scene.includes?.characters || []) {
      if (!isKnownEntity(world, id)) {
        errors.push(makeEntry('error', 'undefined_entity', `Scene includes unknown character "${id}"`, { line: null, details: { sceneId, entityId: id, entityType: 'character' } }));
      }
    }

    for (const id of scene.includes?.locations || []) {
      if (!isKnownEntity(world, id)) {
        errors.push(makeEntry('error', 'undefined_entity', `Scene includes unknown location "${id}"`, { line: null, details: { sceneId, entityId: id, entityType: 'location' } }));
      }
    }

    for (const id of scene.includes?.objects || []) {
      if (!isKnownEntity(world, id)) {
        errors.push(makeEntry('error', 'undefined_entity', `Scene includes unknown object "${id}"`, { line: null, details: { sceneId, entityId: id, entityType: 'object' } }));
      }
    }

    // Blocks are allowed to reference vocabulary keys (not necessarily declared entities).
    for (const id of scene.includes?.other || []) {
      if (!isKnownEntity(world, id)) {
        warnings.push(makeEntry('warning', 'unknown_inclusion', `Scene includes unknown entity "${id}"`, { line: null, details: { sceneId, entityId: id } }));
      }
    }
  }

  return { errors, warnings };
}

function collectOwnershipIssues(ast, world) {
  const errors = [];
  const warnings = [];

  for (const edge of world?.ownership || []) {
    const owner = normalizeString(edge.owner);
    const owned = normalizeString(edge.owned);

    if (owner && !isKnownEntity(world, owner)) {
      warnings.push(makeEntry('warning', 'undefined_entity', `Ownership uses unknown owner "${owner}"`, { line: edge.line ?? null, details: { owner, owned } }));
    }
    if (owned && !isKnownEntity(world, owned)) {
      errors.push(makeEntry('error', 'undefined_entity', `Ownership uses unknown owned item "${owned}"`, { line: edge.line ?? null, details: { owner, owned } }));
    }
  }

  // Relationship edges (best-effort)
  for (const rel of ast?.relationships || []) {
    const from = normalizeString(rel.from);
    const to = normalizeString(rel.to);
    if (from && !isKnownEntity(world, from)) warnings.push(makeEntry('warning', 'undefined_entity', `Relationship uses unknown entity "${from}"`, { line: rel.line ?? null, details: { from, to, type: rel.type } }));
    if (to && !isKnownEntity(world, to)) warnings.push(makeEntry('warning', 'undefined_entity', `Relationship targets unknown entity "${to}"`, { line: rel.line ?? null, details: { from, to, type: rel.type } }));
  }

  return { errors, warnings };
}

function collectReferenceIssues(ast, world) {
  const errors = [];
  const warnings = [];

  for (const ref of ast?.references || []) {
    const to = normalizeString(ref.to);
    if (!to) continue;

    const ok = isKnownEntity(world, to) || isKnownGroup(world, to);
    if (!ok) {
      warnings.push(makeEntry('warning', 'orphan_reference', `Reference points to unknown target "@${to}"`, { line: ref.line ?? null, details: { from: ref.from, to, verb: ref.type } }));
    }
  }

  return { errors, warnings };
}

function collectConstraintIssues(world) {
  const errors = [];
  const warnings = [];

  for (const c of world?.constraints?.items || []) {
    if (!c) continue;
    if (c.type === 'max' || c.type === 'min') {
      const count = Number(c.count);
      if (!Number.isFinite(count) || Number.isNaN(count)) {
        errors.push(makeEntry('error', 'invalid_constraint', `Constraint "${c.subject} has ${c.type} ..." has invalid count`, { line: c.line ?? null, details: { constraint: c } }));
      } else if (count < 0) {
        errors.push(makeEntry('error', 'invalid_constraint', `Constraint "${c.subject} has ${c.type} ..." has negative count`, { line: c.line ?? null, details: { constraint: c } }));
      }
    }

    if (Array.isArray(c.sceneIds) && c.sceneIds.length === 0) {
      warnings.push(makeEntry('warning', 'empty_scope', `Constraint "${c.subject} ${c.type}" resolves to empty scope`, { line: c.line ?? null, details: { constraint: c } }));
    }
  }

  return { errors, warnings };
}

function collectLocationJumpIssues(world, options = {}) {
  const warnings = [];

  const travelVerbs = new Set((options.travel_verbs || [
    'travels', 'travel',
    'journeys', 'journey',
    'moves', 'move',
    'goes', 'go',
    'walks', 'walk',
    'runs', 'run',
    'rides', 'ride',
    'sails', 'sail',
    'flies', 'fly',
    'arrives', 'arrive',
    'leaves', 'leave'
  ]).map(v => String(v).toLowerCase()));

  const sceneIds = world?.scenes?.ordered_ids || [];
  if (sceneIds.length < 2) return { errors: [], warnings };

  function sceneCharLocations(scene) {
    const chars = Array.isArray(scene?.includes?.characters) ? scene.includes.characters : [];
    const locs = Array.isArray(scene?.includes?.locations) ? scene.includes.locations : [];
    const loc = locs.length === 1 ? String(locs[0]) : null;

    const map = new Map();
    for (const c of chars) map.set(String(c), loc);
    return map;
  }

  function hasTravelEvent(scene, charId) {
    for (const ev of scene?.events || []) {
      if (!ev || !ev.verb) continue;
      if (String(ev.subject || '') !== String(charId)) continue;
      const verb = String(ev.verb).toLowerCase();
      if (travelVerbs.has(verb)) return true;
    }
    return false;
  }

  let prev = null;
  let prevId = null;

  for (const id of sceneIds) {
    const scene = world?.scenes?.by_id?.[id];
    if (!scene) continue;

    if (prev) {
      const prevLocs = sceneCharLocations(prev);
      const curLocs = sceneCharLocations(scene);

      for (const [charId, prevLoc] of prevLocs.entries()) {
        if (!curLocs.has(charId)) continue;
        const curLoc = curLocs.get(charId);
        if (!prevLoc || !curLoc || prevLoc === curLoc) continue;

        const ok = hasTravelEvent(prev, charId) || hasTravelEvent(scene, charId);
        if (!ok) {
          warnings.push(makeEntry(
            'warning',
            'location_jump',
            `Character "${charId}" changes location from "${prevLoc}" to "${curLoc}" without a travel event`,
            { line: null, details: { characterId: charId, fromScene: prevId, toScene: id, fromLocation: prevLoc, toLocation: curLoc } }
          ));
        }
      }
    }

    prev = scene;
    prevId = id;
  }

  return { errors: [], warnings };
}

export function deriveSemanticDiagnostics(ast, world, options = {}) {
  const errors = [];
  const warnings = [];

  const sceneIssues = collectSceneEntityIssues(world);
  errors.push(...sceneIssues.errors);
  warnings.push(...sceneIssues.warnings);

  const ownershipIssues = collectOwnershipIssues(ast, world);
  errors.push(...ownershipIssues.errors);
  warnings.push(...ownershipIssues.warnings);

  const refIssues = collectReferenceIssues(ast, world);
  errors.push(...refIssues.errors);
  warnings.push(...refIssues.warnings);

  const constraintIssues = collectConstraintIssues(world);
  errors.push(...constraintIssues.errors);
  warnings.push(...constraintIssues.warnings);

  const jumpIssues = collectLocationJumpIssues(world, options);
  errors.push(...jumpIssues.errors);
  warnings.push(...jumpIssues.warnings);

  // Informational: if no explicit scene groups exist, warn (an implicit "Document" scene is created).
  if ((world?.scenes?.ordered_ids || []).length === 1 && world?.scenes?.ordered_ids?.[0] === 'Document') {
    warnings.push(makeEntry('warning', 'no_scenes_found', 'No explicit scene groups found; using implicit Document scene', {}));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default { deriveSemanticDiagnostics };


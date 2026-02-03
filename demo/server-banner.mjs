/**
 * SCRIPTA Demo Server - Startup Banner
 *
 * Kept in a separate module to keep demo/server.mjs small and focused.
 */

export function printDemoServerBanner({ port, projectsDir }) {
  const W = 58; // total width including borders
  const inner = W - 2; // inside the ║ borders

  const title = 'SCRIPTA Story Forge';
  const urlText = `http://localhost:${port}`;
  const storageText = projectsDir.length > 42 ? '...' + projectsDir.slice(-39) : projectsDir;

  const center = (text) => {
    const pad = inner - text.length;
    const leftPad = Math.floor(pad / 2);
    const rightPad = pad - leftPad;
    return '║' + ' '.repeat(leftPad) + text + ' '.repeat(rightPad) + '║';
  };

  const left = (text) => '║  ' + text.padEnd(inner - 2) + '║';
  const empty = '║' + ' '.repeat(inner) + '║';
  const top = '╔' + '═'.repeat(inner) + '╗';
  const mid = '╠' + '═'.repeat(inner) + '╣';
  const bot = '╚' + '═'.repeat(inner) + '╝';

  const endpointLines = [
    '/              - Story Forge UI',
    '/health        - Health check',
    '/v1/projects   - Projects API (CRUD)',
    '/v1/generate/llm      - LLM story generation',
    '/v1/generate/nl-story - CNL to prose generation',
    '/v1/generate/refine   - LLM story refinement',
    '/v1/generate/status   - Check LLM availability',
    '/v1/evaluate          - Evaluate CNL specification',
    '/v1/run-eval          - Batch evaluation tests',
    '/v1/run-eval/stream   - SSE streaming evaluation',
    '/eval.html            - Evaluation runner page'
  ];

  const lines = [
    top,
    center(title),
    mid,
    left('URL:      ' + urlText),
    left('Storage:  ' + storageText),
    empty,
    left('Set SCRIPTA_DATA_DIR env var to change storage.'),
    empty,
    left('Endpoints:'),
    ...endpointLines.map(e => left('  ' + e)),
    bot
  ];

  console.log('\n' + lines.join('\n') + '\n');
}

export default { printDemoServerBanner };


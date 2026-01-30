/**
 * SOP Lang Execution Engine
 * Executes Standard Operating Procedure workflows
 */

import crypto from 'crypto';
import { stores } from './store.mjs';
import { createJob, completeJob, failJob, updateJobProgress } from './jobs.mjs';
import { generatePlan } from './planning.mjs';
import { verifyAgainstSpec } from './verification.mjs';
import { runGuardrailCheck } from './guardrails.mjs';
import { runEvaluation } from './evaluation.mjs';

// Available step types
const STEP_TYPES = {
  PLAN: 'plan',
  GENERATE: 'generate',
  VERIFY: 'verify',
  GUARDRAIL: 'guardrail',
  EVALUATE: 'evaluate',
  REVIEW: 'review',
  CONDITION: 'condition',
  PARALLEL: 'parallel'
};

/**
 * Execute a single SOP step
 */
async function executeStep(step, context, onProgress) {
  const result = {
    step_id: step.id,
    step_type: step.type,
    status: 'completed',
    output: null,
    error: null,
    started_at: new Date().toISOString(),
    completed_at: null
  };
  
  try {
    switch (step.type) {
      case STEP_TYPES.PLAN: {
        const spec = context.spec || stores.specs.get(context.spec_id);
        if (!spec) throw new Error('Spec not found');
        
        const plan = generatePlan(spec, step.params || {});
        stores.plans.set(plan.id, plan);
        result.output = { plan_id: plan.id, scenes: plan.scenes.length };
        context.plan = plan;
        context.plan_id = plan.id;
        break;
      }
      
      case STEP_TYPES.GENERATE: {
        // Mock generation - in real implementation would call LLM
        const draftId = `draft_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
        const draft = {
          id: draftId,
          plan_id: context.plan_id,
          content: generateMockContent(context.plan),
          created_at: new Date().toISOString()
        };
        stores.drafts.set(draftId, draft);
        result.output = { draft_id: draftId };
        context.draft = draft;
        context.draft_id = draftId;
        break;
      }
      
      case STEP_TYPES.VERIFY: {
        const spec = context.spec || stores.specs.get(context.spec_id);
        const draft = context.draft || stores.drafts.get(context.draft_id);
        if (!spec || !draft) throw new Error('Spec or draft not found');
        
        const report = verifyAgainstSpec(draft.content, spec);
        stores.verifyReports.set(report.report_id, report);
        result.output = { report_id: report.report_id, status: report.overall_status };
        context.verification_report = report;
        break;
      }
      
      case STEP_TYPES.GUARDRAIL: {
        const draft = context.draft || stores.drafts.get(context.draft_id);
        if (!draft) throw new Error('Draft not found');
        
        const report = runGuardrailCheck(draft.content, step.params || {});
        stores.guardrailReports.set(report.report_id, report);
        result.output = { report_id: report.report_id, status: report.status };
        context.guardrail_report = report;
        break;
      }
      
      case STEP_TYPES.EVALUATE: {
        const spec = context.spec || stores.specs.get(context.spec_id);
        const draft = context.draft || stores.drafts.get(context.draft_id);
        if (!draft) throw new Error('Draft not found');
        
        const report = runEvaluation(draft.content, spec || {}, step.params || {});
        stores.evaluationReports.set(report.report_id, report);
        result.output = { report_id: report.report_id };
        context.evaluation_report = report;
        break;
      }
      
      case STEP_TYPES.CONDITION: {
        // Evaluate condition
        const condition = step.condition;
        let passed = false;
        
        if (condition.check === 'verification_passed') {
          passed = context.verification_report?.overall_status === 'pass';
        } else if (condition.check === 'guardrail_passed') {
          passed = context.guardrail_report?.status === 'pass';
        } else if (condition.check === 'quality_threshold') {
          const nqs = context.evaluation_report?.results?.find(r => r.name === 'NQS');
          passed = nqs && nqs.value >= (condition.threshold || 0.7);
        }
        
        result.output = { condition_met: passed };
        context.condition_result = passed;
        break;
      }
      
      case STEP_TYPES.PARALLEL: {
        // Execute substeps in parallel (simulated)
        const substepResults = [];
        for (const substep of step.steps || []) {
          const subResult = await executeStep(substep, context, onProgress);
          substepResults.push(subResult);
        }
        result.output = { substeps: substepResults.length };
        break;
      }
      
      default:
        result.status = 'skipped';
        result.output = { message: `Unknown step type: ${step.type}` };
    }
  } catch (err) {
    result.status = 'failed';
    result.error = err.message;
  }
  
  result.completed_at = new Date().toISOString();
  return result;
}

/**
 * Generate mock content for testing
 */
function generateMockContent(plan) {
  if (!plan || !plan.scenes) {
    return 'Once upon a time, in a land far away...';
  }
  
  const paragraphs = plan.scenes.map((scene, i) => {
    const chars = scene.characters?.join(' and ') || 'the protagonist';
    return `Scene ${i + 1}: ${scene.summary}\n\n${chars} faced the challenges ahead. ` +
           `The ${scene.type || 'moment'} unfolded with intensity. ` +
           (scene.must_include ? `The scene included ${scene.must_include.join(', ')}. ` : '') +
           `This was a pivotal moment in the story.\n`;
  });
  
  return paragraphs.join('\n');
}

/**
 * Execute a complete SOP
 */
async function executeSop(sop, spec, options = {}) {
  const runId = `run_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  
  const run = {
    run_id: runId,
    sop_id: sop.id,
    spec_id: spec.id,
    status: 'running',
    started_at: new Date().toISOString(),
    completed_at: null,
    steps_completed: 0,
    steps_total: sop.steps?.length || 0,
    step_results: [],
    context: {},
    error: null
  };
  
  stores.pipelineRuns.set(runId, run);
  
  // Initialize context
  const context = {
    spec_id: spec.id,
    spec: spec,
    run_id: runId,
    ...options.initialContext
  };
  
  try {
    for (let i = 0; i < (sop.steps || []).length; i++) {
      const step = sop.steps[i];
      
      // Check for condition-based skipping
      if (step.skip_if && context.condition_result === false) {
        run.step_results.push({
          step_id: step.id,
          status: 'skipped',
          reason: 'Condition not met'
        });
        continue;
      }
      
      const stepResult = await executeStep(step, context, (progress) => {
        run.progress = (i / sop.steps.length * 100) + (progress / sop.steps.length);
        stores.pipelineRuns.set(runId, run);
      });
      
      run.step_results.push(stepResult);
      run.steps_completed = i + 1;
      stores.pipelineRuns.set(runId, run);
      
      // Stop on failure if configured
      if (stepResult.status === 'failed' && sop.stop_on_failure !== false) {
        throw new Error(`Step ${step.id} failed: ${stepResult.error}`);
      }
    }
    
    run.status = 'completed';
    run.context = {
      plan_id: context.plan_id,
      draft_id: context.draft_id,
      verification_status: context.verification_report?.overall_status,
      guardrail_status: context.guardrail_report?.status
    };
  } catch (err) {
    run.status = 'failed';
    run.error = err.message;
  }
  
  run.completed_at = new Date().toISOString();
  stores.pipelineRuns.set(runId, run);
  
  return run;
}

/**
 * Get a default SOP template
 */
function getDefaultSop() {
  return {
    id: 'sop_default',
    name: 'Default Creative Writing Pipeline',
    version: '1.0.0',
    steps: [
      { id: 'step_plan', type: STEP_TYPES.PLAN, params: { structure: 'three_act', scene_count: 9 } },
      { id: 'step_generate', type: STEP_TYPES.GENERATE, params: {} },
      { id: 'step_verify', type: STEP_TYPES.VERIFY, params: {} },
      { id: 'step_guardrail', type: STEP_TYPES.GUARDRAIL, params: { policies: ['bias', 'originality', 'pii'] } },
      { id: 'step_evaluate', type: STEP_TYPES.EVALUATE, params: { metrics: ['nqs', 'coherence', 'cad'] } }
    ],
    policy_guardrails: ['bias', 'originality'],
    stop_on_failure: true
  };
}

export {
  executeSop,
  executeStep,
  getDefaultSop,
  STEP_TYPES
};

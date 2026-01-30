/**
 * Explainability Service
 * Generates justifications and evidence for agent decisions
 */

import { stores } from './store.mjs';

/**
 * Get evidence from audit log for a specific artifact
 */
function getAuditEvidence(artifactId) {
  const auditEntries = stores.audit.values();
  return auditEntries.filter(entry => 
    entry.payload_hash?.includes(artifactId) ||
    entry.event_type?.includes(artifactId) ||
    JSON.stringify(entry).includes(artifactId)
  );
}

/**
 * Explain a verification result
 */
function explainVerification(report, question = null) {
  const explanation = {
    type: 'verification',
    summary: '',
    evidence: [],
    reasoning: [],
    suggestions: []
  };
  
  if (report.overall_status === 'pass') {
    explanation.summary = 'All constraints were successfully verified.';
    explanation.reasoning.push('Each constraint in the specification was checked against the artifact.');
    explanation.reasoning.push(`${report.summary?.passed || 0} checks passed out of ${report.summary?.total_checks || 0} total.`);
  } else {
    explanation.summary = `Verification found ${report.violations?.length || 0} constraint violations.`;
    
    for (const violation of (report.violations || [])) {
      explanation.evidence.push({
        type: 'violation',
        constraint: violation.constraint,
        message: violation.message,
        severity: violation.severity
      });
      
      // Generate suggestion based on violation type
      if (violation.message?.includes('Missing required element')) {
        explanation.suggestions.push(`Add the required element "${violation.constraint.match(/"([^"]+)"/)?.[1] || 'specified content'}" to the text.`);
      } else if (violation.message?.includes('forbidden')) {
        explanation.suggestions.push(`Remove the forbidden content: ${violation.message.split(':').pop()}`);
      }
    }
    
    explanation.reasoning.push('The artifact was compared against each specified constraint.');
    explanation.reasoning.push('Violations indicate gaps between the specification and the generated content.');
  }
  
  // Answer specific question if provided
  if (question) {
    explanation.answer = answerQuestion(question, report, 'verification');
  }
  
  return explanation;
}

/**
 * Explain a guardrail check result
 */
function explainGuardrail(report, question = null) {
  const explanation = {
    type: 'guardrail',
    summary: '',
    evidence: [],
    reasoning: [],
    suggestions: []
  };
  
  if (report.status === 'pass') {
    explanation.summary = 'No guardrail violations detected. Content appears safe and original.';
    explanation.reasoning.push('Text was checked for bias, clichés, harmful content, and PII.');
    explanation.reasoning.push('All checks passed within acceptable thresholds.');
  } else {
    const criticalCount = report.summary?.critical || 0;
    const errorCount = report.summary?.error || 0;
    const warningCount = report.summary?.warning || 0;
    
    explanation.summary = `Guardrails flagged ${criticalCount + errorCount + warningCount} issues: ${criticalCount} critical, ${errorCount} errors, ${warningCount} warnings.`;
    
    for (const finding of (report.findings || []).slice(0, 5)) {
      explanation.evidence.push({
        type: finding.type,
        match: finding.match,
        severity: finding.severity,
        category: finding.category
      });
      
      if (finding.suggestion) {
        explanation.suggestions.push(finding.suggestion);
      }
    }
    
    explanation.reasoning.push('The content was analyzed for problematic patterns.');
    if (criticalCount > 0) {
      explanation.reasoning.push('Critical issues require immediate attention before publication.');
    }
  }
  
  if (question) {
    explanation.answer = answerQuestion(question, report, 'guardrail');
  }
  
  return explanation;
}

/**
 * Explain an evaluation result
 */
function explainEvaluation(report, question = null) {
  const explanation = {
    type: 'evaluation',
    summary: '',
    evidence: [],
    reasoning: [],
    suggestions: []
  };
  
  const results = report.results || [];
  const avgScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.value, 0) / results.length
    : 0;
  
  explanation.summary = `Overall quality score: ${(avgScore * 100).toFixed(1)}%. ${avgScore >= 0.7 ? 'Good' : avgScore >= 0.5 ? 'Moderate' : 'Needs improvement'}.`;
  
  for (const result of results) {
    explanation.evidence.push({
      metric: result.name,
      score: (result.value * 100).toFixed(1) + '%',
      message: result.details?.message || ''
    });
    
    // Generate suggestions for low-scoring metrics
    if (result.value < 0.6) {
      switch (result.name.toLowerCase()) {
        case 'coherence':
          explanation.suggestions.push('Improve transitions between paragraphs and ensure logical flow.');
          break;
        case 'readability':
          explanation.suggestions.push('Use shorter sentences and simpler vocabulary.');
          break;
        case 'cad':
          explanation.suggestions.push('Ensure character traits remain consistent throughout the narrative.');
          break;
        case 'nqs':
          explanation.suggestions.push('Review all components: coherence, readability, character consistency, and emotional arc.');
          break;
      }
    }
  }
  
  explanation.reasoning.push('Multiple quality dimensions were measured using established metrics.');
  explanation.reasoning.push('Scores are normalized to 0-100% where higher is better.');
  
  if (question) {
    explanation.answer = answerQuestion(question, report, 'evaluation');
  }
  
  return explanation;
}

/**
 * Explain a planning decision
 */
function explainPlanning(plan, question = null) {
  const explanation = {
    type: 'planning',
    summary: '',
    evidence: [],
    reasoning: [],
    suggestions: []
  };
  
  explanation.summary = `Generated a ${plan.structure_name || 'three-act'} structure with ${plan.scenes?.length || 0} scenes.`;
  
  // Explain structure choice
  explanation.reasoning.push(`The ${plan.structure_name} was selected as it provides a classic narrative framework.`);
  explanation.reasoning.push(`${plan.scenes?.length || 0} scenes distribute the story across ${plan.plot_graph?.nodes?.length || 0} plot points.`);
  
  // Add character arc evidence
  const characterArcs = plan.arcs?.filter(a => a.type === 'character_arc') || [];
  for (const arc of characterArcs.slice(0, 3)) {
    explanation.evidence.push({
      type: 'character_arc',
      character: arc.character,
      stages: arc.stages?.length || 0,
      description: arc.stages?.[0]?.description
    });
  }
  
  // Emotional arc evidence
  const emotionalArc = plan.arcs?.find(a => a.type === 'emotional');
  if (emotionalArc) {
    explanation.evidence.push({
      type: 'emotional_arc',
      pattern: emotionalArc.pattern,
      datapoints: emotionalArc.datapoints?.length || 0
    });
    explanation.reasoning.push(`The emotional arc follows a ${emotionalArc.pattern} pattern for dramatic effect.`);
  }
  
  if (question) {
    explanation.answer = answerQuestion(question, plan, 'planning');
  }
  
  return explanation;
}

/**
 * Answer a specific question about a report
 */
function answerQuestion(question, report, reportType) {
  const lowerQ = question.toLowerCase();
  
  // Common question patterns
  if (lowerQ.includes('why') && lowerQ.includes('fail')) {
    if (reportType === 'verification') {
      const violations = report.violations || [];
      if (violations.length > 0) {
        return `The verification failed because: ${violations.map(v => v.message).join('; ')}`;
      }
    }
    if (reportType === 'guardrail') {
      const findings = report.findings || [];
      if (findings.length > 0) {
        return `The guardrail check flagged issues: ${findings.slice(0, 3).map(f => `${f.type}: ${f.match}`).join('; ')}`;
      }
    }
  }
  
  if (lowerQ.includes('how') && lowerQ.includes('fix')) {
    if (reportType === 'verification') {
      const violations = report.violations || [];
      if (violations.length > 0) {
        return `To fix the violations: 1) Add missing required elements, 2) Remove forbidden content, 3) Ensure tone matches specification.`;
      }
    }
  }
  
  if (lowerQ.includes('score') || lowerQ.includes('quality')) {
    if (reportType === 'evaluation') {
      const results = report.results || [];
      return `Quality scores: ${results.map(r => `${r.name}: ${(r.value * 100).toFixed(1)}%`).join(', ')}`;
    }
  }
  
  if (lowerQ.includes('character') && (lowerQ.includes('drift') || lowerQ.includes('consistency'))) {
    if (reportType === 'evaluation') {
      const cad = report.results?.find(r => r.name === 'CAD');
      if (cad) {
        return `Character consistency score: ${(cad.value * 100).toFixed(1)}%. ${cad.details?.message || ''}`;
      }
    }
  }
  
  // Default response
  return `Based on the ${reportType} analysis: ${report.overall_status || report.status || 'see evidence for details'}.`;
}

/**
 * Generate explanation for any artifact and question
 */
function generateExplanation(artifactRef, question, context = {}) {
  const explanation = {
    artifact_ref: artifactRef,
    question,
    explanation: '',
    evidence: [],
    reasoning: [],
    suggestions: [],
    timestamp: new Date().toISOString()
  };
  
  // Try to find related reports
  if (context.verificationReport) {
    const verifyExpl = explainVerification(context.verificationReport, question);
    Object.assign(explanation, verifyExpl);
    explanation.explanation = verifyExpl.summary;
    return explanation;
  }
  
  if (context.guardrailReport) {
    const guardExpl = explainGuardrail(context.guardrailReport, question);
    Object.assign(explanation, guardExpl);
    explanation.explanation = guardExpl.summary;
    return explanation;
  }
  
  if (context.evaluationReport) {
    const evalExpl = explainEvaluation(context.evaluationReport, question);
    Object.assign(explanation, evalExpl);
    explanation.explanation = evalExpl.summary;
    return explanation;
  }
  
  if (context.plan) {
    const planExpl = explainPlanning(context.plan, question);
    Object.assign(explanation, planExpl);
    explanation.explanation = planExpl.summary;
    return explanation;
  }
  
  // Generic explanation based on question
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('why')) {
    explanation.explanation = 'The system analyzed the input against the defined constraints and quality metrics.';
    explanation.reasoning.push('Each decision is based on specification compliance and narrative quality objectives.');
  } else if (lowerQ.includes('how')) {
    explanation.explanation = 'The system uses rule-based analysis and semantic similarity to evaluate content.';
    explanation.reasoning.push('Constraints are parsed from CNL specifications and compared against the text.');
  } else {
    explanation.explanation = 'The artifact was processed according to the SCRIPTA pipeline: planning, generation, verification, and guardrails.';
  }
  
  // Add audit trail evidence
  if (artifactRef?.id) {
    const auditEvidence = getAuditEvidence(artifactRef.id);
    explanation.evidence = auditEvidence.map(e => ({
      type: 'audit',
      event: e.event_type,
      timestamp: e.timestamp,
      actor: e.actor
    }));
  }
  
  return explanation;
}

export {
  generateExplanation,
  explainVerification,
  explainGuardrail,
  explainEvaluation,
  explainPlanning,
  getAuditEvidence
};

/**
 * Metrics Interpreter - Metric Registry
 *
 * Each metric plugin:
 * - code: string
 * - version: string
 * - dependsOn?: string[]
 * - threshold?: number|null
 * - compute(ctx) -> { value, threshold, pass, details }
 */

import { metricCPSR } from './cpsr.mjs';
import { metricCSA } from './csa.mjs';
import { metricCS } from './cs.mjs';
import { metricCAD } from './cad.mjs';
import { metricOI } from './oi.mjs';
import { metricEAP } from './eap.mjs';
import { metricCAR } from './car.mjs';
import { metricRQ } from './rq.mjs';
import { metricXAI } from './xai.mjs';
import { metricNQS } from './nqs.mjs';
import { metricNqsAuto } from './nqs-auto.mjs';

export const METRIC_REGISTRY = {
  [metricCPSR.code]: metricCPSR,
  [metricCSA.code]: metricCSA,
  [metricCS.code]: metricCS,
  [metricCAD.code]: metricCAD,
  [metricOI.code]: metricOI,
  [metricEAP.code]: metricEAP,
  [metricCAR.code]: metricCAR,
  [metricRQ.code]: metricRQ,
  [metricXAI.code]: metricXAI,
  [metricNQS.code]: metricNQS,
  [metricNqsAuto.code]: metricNqsAuto
};

export default { METRIC_REGISTRY };


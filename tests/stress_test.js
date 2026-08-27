// Advanced Adversarial & Stress Testing Suite for Project AURA
// Covers edge cases, adversarial inputs, multi-feature drift stress, ACTR attack vectors, and gate boundary tests

const fs = require('fs');
const path = require('path');

const dataJsPath = path.join(__dirname, '..', 'data.js');
const dataJsCode = fs.readFileSync(dataJsPath, 'utf8');

const exportSuffix = `
module.exports = {
  AURA_CONFIG,
  DRIFT_DATA,
  RETRAIN_DATA,
  HALLUC_FIREWALL_DATA,
  PSI_FEATURES,
  LLM_EVALUATIONS,
  VALID_REGULATIONS,
  DEMO_PROFILES,
  API_scoreLoan,
  API_runPSI,
  API_evaluateExplanation,
  API_runACTRVerification,
  API_promoteChallenger,
  detectHallucinations,
  actrExtractClaims,
  actrCrossReference,
  actrDetectHallucinations,
  actrRewriteAndCorrect,
  actrVerifyExplanation,
  AURA_RISK_INTELLIGENCE_AGENT,
  API_getModelHealth,
  API_evaluateAgentDrift,
  API_askAURA,
  API_generateRiskReport,
  API_explainApplicantRisk,
  API_simulateDrift,
};
`;

const mod = new Function('module', 'exports', dataJsCode + exportSuffix);
const moduleObj = { exports: {} };
mod(moduleObj, moduleObj.exports);
const aura = moduleObj.exports;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

async function runComplexStressTests() {
  console.log('================================================================');
  console.log('🔥 AURA ADVANCED STRESS & ADVERSARIAL TESTING SUITE');
  console.log('================================================================\n');

  // --- 1. Adversarial & Extreme Boundary Underwriting Cases ---
  console.log('--- 1. Adversarial & Extreme Boundary Underwriting Cases ---');

  // Edge Case 1.1: Extreme Outlier High Leverage (CIR = 50.0)
  const extremeCIR = await aura.API_scoreLoan({
    income: 0.2,
    age: 22,
    credit: 10.0, // CIR = 50.0
    employment_years: 0.2,
    ext_source_2: 0.10,
    ext_source_3: 0.15,
  });
  assert(extremeCIR.approved === false, 'Extreme CIR (50.0) is rejected');
  assert(extremeCIR.probability > 0.65, `Default probability is appropriately punitive (Got: ${(extremeCIR.probability * 100).toFixed(1)}%)`);
  assert(extremeCIR.features.credit_income_ratio === 50.0, 'Engineered CIR correctly equals 50.0');
  assert(!isNaN(extremeCIR.features.credit_per_year) && isFinite(extremeCIR.features.credit_per_year), 'credit_per_year is numeric and finite');

  // Edge Case 1.2: Near-Zero / Zero Employment Tenure
  const zeroTenure = await aura.API_scoreLoan({
    income: 1.5,
    age: 24,
    credit: 3.0,
    employment_years: 0,
    ext_source_2: 0.60,
    ext_source_3: 0.60,
  });
  assert(zeroTenure.features.employment_years === 0, 'Zero tenure handled gracefully');
  assert(!isNaN(zeroTenure.features.credit_per_year), 'Division by zero safely handled in credit_per_year');

  // Edge Case 1.3: Super-Prime Maximum Bureau Scores (Ext 1=1.0, Ext 2=1.0, Ext 3=1.0)
  const perfectBureau = await aura.API_scoreLoan({
    income: 10.0,
    age: 45,
    credit: 5.0, // CIR = 0.5
    employment_years: 15,
    ext_source_1: 0.95,
    ext_source_2: 0.98,
    ext_source_3: 0.99,
  });
  assert(perfectBureau.approved === true, 'Super-prime profile approved with high confidence');
  assert(perfectBureau.probability <= 0.05, `Default probability capped near minimum floor (Got: ${(perfectBureau.probability * 100).toFixed(1)}%)`);
  assert(perfectBureau.features.ext_min >= 0.95, 'ext_min correctly calculated for top tier');

  // Edge Case 1.4: Senior Applicant Extreme Age (Age = 80)
  const seniorApplicant = await aura.API_scoreLoan({
    income: 2.0,
    age: 80,
    credit: 4.0,
    employment_years: 1,
    ext_source_2: 0.55,
    ext_source_3: 0.55,
  });
  assert(seniorApplicant.features.age_years === 80, 'Senior age handled accurately');
  assert(seniorApplicant.features.income_age_ratio === 2.0 / (80 * 10000), 'income_age_ratio computed accurately');

  // --- 2. ACTR Adversarial Regulatory Attacks & Multi-Clause Poisoning ---
  console.log('\n--- 2. ACTR Adversarial Regulatory Attacks & Multi-Clause Poisoning ---');

  // Attack 2.1: Mixed Genuine + 3 Distinct Fabricated Statutory Citations
  const poisonedPrompt = `Under RBI/2022-23/103 (Digital Lending) and Section 23B of Banking Regulation Act, credit approval requires compliance with RBI/2023/999 (6-month moratorium) and Article 15C of Indian Credit Code. Applicant CIR is 9.8 with tenure 1.2 years.`;
  const poisonedAudit = aura.actrVerifyExplanation(poisonedPrompt, { credit_income_ratio: 9.8, employment_years: 1.2 }, false);

  assert(poisonedAudit.has_hallucination === true, 'ACTR detects multi-clause hallucination attack');
  assert(poisonedAudit.stage3_detection.fake_regulations.length >= 3, `Identified 3+ distinct fabricated citations (Found: ${poisonedAudit.stage3_detection.fake_regulations.length})`);
  assert(!poisonedAudit.safe_response.includes('Section 23B'), 'Safe response stripped fake Section 23B');
  assert(!poisonedAudit.safe_response.includes('RBI/2023/999'), 'Safe response stripped fake RBI/2023/999');
  assert(!poisonedAudit.safe_response.includes('Article 15C'), 'Safe response stripped fake Article 15C');
  assert(poisonedAudit.safe_response.includes('RBI/2022-23/103'), 'Safe response preserved authentic RBI/2022-23/103');
  assert(poisonedAudit.grounding_score > 0, 'Grounding score computed proportionately');

  // Attack 2.2: Pure Hallucination with Zero Genuine Regulations
  const pureHallucination = `Pursuant to the Phantom Lending Directive 2026 Section 404, this application is rejected due to mandatory 850 CIBIL score per Section 23B.`;
  const pureAudit = aura.actrVerifyExplanation(pureHallucination, { credit_income_ratio: 7.0 }, false);
  assert(pureAudit.has_hallucination === true, 'Pure hallucination intercepted');
  assert(pureAudit.grounding_score === 0.0, 'Grounding score is 0.0 on pure hallucination');
  assert(pureAudit.safe_response.includes('Fair Practices Code') || pureAudit.safe_response.includes('RBI/2022-23/103'), 'Rewriter injected authentic baseline regulatory guidance');

  // --- 3. Severe Multi-Feature Drift & Model Health Degradation Dynamics ---
  console.log('\n--- 3. Severe Multi-Feature Drift & Model Health Degradation Dynamics ---');

  // Drift Stress 3.1: All 5 Monitored Features Drift Simultaneously
  const severeDriftFeatures = [
    { name: 'credit_income_ratio', psi: 3.4500, severity: 'high' },
    { name: 'employment_years',    psi: 2.1000, severity: 'high' },
    { name: 'income',              psi: 1.8500, severity: 'high' },
    { name: 'age_years',           psi: 0.6500, severity: 'high' },
    { name: 'debt_service_ratio',  psi: 0.4200, severity: 'high' },
  ];
  const severeHealth = aura.AURA_RISK_INTELLIGENCE_AGENT.calculateModelHealth(severeDriftFeatures, 0.7352);
  console.log(`Severe Multi-Feature Drift Model Health: ${severeHealth.score}/100 (${severeHealth.status})`);
  assert(severeHealth.score < 50, 'Model health severely collapses under 5-feature catastrophic drift');
  assert(severeHealth.status.includes('CRITICAL DRIFT') || severeHealth.status.includes('DEGRADED'), 'Status correctly flags critical degradation');

  const severeAgentDecision = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluateDriftAndRecommend(severeDriftFeatures);
  assert(severeAgentDecision.status === 'RETRAIN', 'Agent immediately commands RETRAIN state');
  assert(severeAgentDecision.affected_features.length === 5, 'All 5 drifted features captured in audit telemetry');
  assert(severeAgentDecision.top_drifted_feature === 'credit_income_ratio', 'credit_income_ratio correctly flagged as top culprit');

  // --- 4. Deterministic Promotion Gate Precision & Boundary Edge Cases ---
  console.log('\n--- 4. Deterministic Promotion Gate Precision & Boundary Edge Cases ---');

  const championAUC = 0.7278;

  // Gate Boundary 4.1: Exactly at Threshold (+0.00400)
  const exactThresholdGate = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(championAUC, championAUC + 0.0040, 0.004);
  assert(exactThresholdGate.passed === true, 'Challenger at exact threshold (+0.0040) is PROMOTED');
  assert(exactThresholdGate.system_decision === 'DETERMINISTIC_GATE_PASSED', 'Deterministic system decision is PASSED');

  // Gate Boundary 4.2: Sub-Threshold Micro-Delta (+0.00399 < 0.00400)
  const microFailGate = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(championAUC, championAUC + 0.00399, 0.004);
  assert(microFailGate.passed === false, 'Challenger at micro sub-threshold (+0.00399) is REJECTED');
  assert(microFailGate.decision === 'KEEP_CHAMPION', 'System safely retains Champion');

  // Gate Boundary 4.3: Regressed Candidate (AUC Delta = -0.1500)
  const regressedGate = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(championAUC, 0.5778, 0.004);
  assert(regressedGate.passed === false, 'Regressed candidate is definitively REJECTED');
  assert(regressedGate.auc_delta === -0.15, 'Negative delta logged accurately');

  // Gate Boundary 4.4: Corrupted Metric / NaN Input (Safety Escalation)
  const corruptedGate = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(championAUC, NaN, 0.004);
  assert(corruptedGate.status === 'ESCALATE', 'NaN challenger AUC triggers ESCALATE state');
  assert(corruptedGate.decision === 'HUMAN_REVIEW_REQUIRED', 'Gate enforces HUMAN_REVIEW_REQUIRED rather than guessing');

  // --- 5. "Ask AURA" Complex Adversarial Queries ---
  console.log('\n--- 5. "Ask AURA" Complex Adversarial Queries ---');

  const q1 = aura.AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery('Why did the system promote model v11 over v6?');
  assert(q1.includes('0.7327') && q1.includes('0.7278') && q1.includes('+0.0049'), 'Correctly explains model evolution v11 vs v6');

  const q2 = aura.AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery('Explain the mathematical reason why early candidate v10 failed');
  assert(q2.includes('0.5087') && q2.includes('0.7278'), 'Accurately explains v10 candidate failure');

  const q3 = aura.AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery('asdf random ungrounded garbage prompt 12345');
  assert(q3.includes('Telemetry analysis') || q3.includes('Production Champion'), 'Ungrounded query handled gracefully without hallucinating');

  console.log('\n================================================================');
  console.log(`🏁 STRESS TESTING RESULT: ${passed} passed, ${failed} failed`);
  console.log('================================================================');
}

runComplexStressTests().catch(err => {
  console.error('Stress test failure:', err);
  process.exit(1);
});

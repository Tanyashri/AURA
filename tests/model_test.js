// Comprehensive test suite for Project Aura Credit Risk AI, ACTR Framework & Risk Intelligence Agent

const fs = require('fs');
const path = require('path');

// Read data.js and append export statement
const dataJsPath = path.join(__dirname, '..', 'data.js');
let dataJsCode = fs.readFileSync(dataJsPath, 'utf8');

// Wrap and evaluate in module scope
const exportSuffix = `
module.exports = {
  AURA_CONFIG,
  DRIFT_DATA,
  RETRAIN_DATA,
  HALLUC_FIREWALL_DATA,
  PSI_FEATURES,
  LLM_EVALUATIONS,
  VALID_REGULATIONS,
  REJECTION_EXPLANATIONS,
  APPROVAL_EXPLANATIONS,
  DEMO_PROFILES,
  API_scoreLoan,
  API_runPSI,
  API_evaluateExplanation,
  API_runACTRVerification,
  API_promoteChallenger,
  detectHallucinations,
  psiSeverity,
  psiBarWidth,
  ACTR_KNOWLEDGE_BASE,
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

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  }
}

function assertClose(val1, val2, eps = 0.001, message = '') {
  if (Math.abs(val1 - val2) > eps) {
    console.error(`❌ FAIL: ${message} (Expected ${val2}, got ${val1})`);
    failedTests++;
    throw new Error(`${message}: Expected ${val2}, got ${val1}`);
  } else {
    console.log(`✅ PASS: ${message} (${val1} ≈ ${val2})`);
    passedTests++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 PROJECT AURA — FULL VERIFICATION SUITE');
  console.log('   (ML Foundation + ACTR Framework + Risk Intelligence Agent)');
  console.log('================================================================\n');

  // TEST SUITE 1: Configuration & Preserved Report Metrics
  console.log('--- Test Suite 1: Configuration & Preserved Report Metrics ---');
  assert(aura.AURA_CONFIG.feature_count === 11, 'Configuration specifies 11 features');
  assert(aura.AURA_CONFIG.feature_cols.length === 11, 'Feature columns array has exactly 11 features');
  assert(aura.AURA_CONFIG.dataset.raw_records === 307511, 'Dataset raw records = 307,511');
  assert(aura.AURA_CONFIG.dataset.cleaned_records === 297664, 'Dataset cleaned records = 297,664');
  assert(aura.AURA_CONFIG.models.baseline_rf.auc === 0.6166, 'Baseline Random Forest AUC = 0.6166');
  assert(aura.AURA_CONFIG.models.champion_rf.auc === 0.7278, 'Random Forest Champion (v6) AUC = 0.7278');
  assert(aura.AURA_CONFIG.models.promoted_challenger.auc === 0.7327, 'Challenger (v11) AUC = 0.7327');
  assert(aura.AURA_CONFIG.models.champion_xgboost.auc === 0.7352, 'Final XGBoost Champion (v12) AUC = 0.7352');
  assert(aura.AURA_CONFIG.models.champion_xgboost.accuracy === 0.7210, 'Final XGBoost Accuracy = 72.1%');
  assert(aura.AURA_CONFIG.promotion_threshold === 0.004, 'Promotion threshold is strictly 0.004');

  // TEST SUITE 2: Monitored PSI Drift Benchmark Values
  console.log('\n--- Test Suite 2: Monitored PSI Drift Benchmark Values ---');
  const cirDrift = aura.PSI_FEATURES.find(f => f.name === 'credit_income_ratio');
  const empDrift = aura.PSI_FEATURES.find(f => f.name === 'employment_years');
  const incDrift = aura.PSI_FEATURES.find(f => f.name === 'income');
  const ageDrift = aura.PSI_FEATURES.find(f => f.name === 'age_years');
  const dsrDrift = aura.PSI_FEATURES.find(f => f.name === 'debt_service_ratio');

  assert(cirDrift && cirDrift.psi === 2.7008, 'credit_income_ratio PSI = 2.7008 (Critical)');
  assert(empDrift && empDrift.psi === 1.3962, 'employment_years PSI = 1.3962 (Critical)');
  assert(incDrift && incDrift.psi === 0.7726, 'income PSI = 0.7726 (Critical)');
  assert(ageDrift && ageDrift.psi === 0.1223, 'age_years PSI = 0.1223 (Moderate / Monitor)');
  assert(dsrDrift && dsrDrift.psi === 0.0941, 'debt_service_ratio PSI = 0.0941 (Stable)');

  // TEST SUITE 3: Preset Profile Scoring & ACTR Integration
  console.log('\n--- Test Suite 3: Preset Profile Scoring & ACTR Integration ---');
  const highRiskResult = await aura.API_scoreLoan({ _preset: 'high_risk' });
  assert(highRiskResult.approved === false, 'High risk preset evaluates to REJECTED');
  assertClose(highRiskResult.probability, 0.424, 0.001, 'High risk probability is 42.4%');
  assert(highRiskResult.features.credit_income_ratio === 10.0, 'High risk CIR is 10.0');
  assert(highRiskResult.hallucination.has_hallucination === false, 'High risk explanation passes hallucination firewall');
  assert(highRiskResult.hallucination.actr !== undefined, 'ACTR audit payload attached to high risk result');

  const lowRiskResult = await aura.API_scoreLoan({ _preset: 'low_risk' });
  assert(lowRiskResult.approved === true, 'Low risk preset evaluates to APPROVED');
  assertClose(lowRiskResult.probability, 0.058, 0.001, 'Low risk probability is 5.8%');
  assert(lowRiskResult.features.credit_income_ratio === 2.1802, 'Low risk CIR is 2.1802');
  assert(lowRiskResult.hallucination.has_hallucination === false, 'Low risk explanation passes hallucination firewall');
  assert(lowRiskResult.hallucination.actr !== undefined, 'ACTR audit payload attached to low risk result');

  // TEST SUITE 4: Dynamic Custom Scoring & Feature Engineering
  console.log('\n--- Test Suite 4: Dynamic Custom Scoring & Feature Engineering ---');
  const customApplicant = {
    income: 500000,
    age: 35,
    credit: 1500000,
    employment_years: 5,
    ext_source_2: 0.75,
    ext_source_3: 0.80,
  };
  const customResult = await aura.API_scoreLoan(customApplicant);
  assert(customResult.approved === true, 'Low-risk profile correctly gets APPROVED');
  assert(customResult.features.credit_income_ratio === 3.0, 'CIR calculated correctly (3.0)');
  assertClose(customResult.features.ext_mean, (0.5 + 0.75 + 0.80) / 3, 0.0001, 'ext_mean computed correctly');
  assert(customResult.features.ext_min === 0.5, 'ext_min computed correctly');
  assertClose(customResult.features.credit_per_year, 3.0 / 5, 0.0001, 'credit_per_year computed correctly (0.6)');

  // TEST SUITE 5: ACTR Framework 4-Stage Verification
  console.log('\n--- Test Suite 5: ACTR Framework 4-Stage Verification ---');
  const sampleLLMText = 'Based on RBI/2022-23/103 and Section 23B of Banking Regulation Act, your credit-income ratio of 9.4 and employment tenure of 2.1 years were evaluated. Minimum CIBIL score of 750 is mandatory.';
  const actrEval = aura.actrVerifyExplanation(sampleLLMText, { credit_income_ratio: 9.4, employment_years: 2.1 });
  assert(actrEval.has_hallucination === true, 'ACTR detects hallucination in raw explanation');
  assert(actrEval.stage3_detection.fake_regulations.some(f => f.citation === 'Section 23B'), 'Captures Section 23B as fake regulation');
  assert(!actrEval.safe_response.includes('Section 23B'), 'Safe response removes fake Section 23B');
  assert(actrEval.safe_response.includes('RBI/2022-23/103'), 'Safe response maintains genuine RBI regulation');

  // TEST SUITE 6: AURA Risk Intelligence Agent — Model Health Score
  console.log('\n--- Test Suite 6: AURA Risk Intelligence Agent — Model Health Score ---');
  const stableFeatures = [
    { name: 'credit_income_ratio', psi: 0.04 },
    { name: 'employment_years', psi: 0.03 },
    { name: 'income', psi: 0.05 },
    { name: 'age_years', psi: 0.02 },
  ];
  const healthyHealth = aura.AURA_RISK_INTELLIGENCE_AGENT.calculateModelHealth(stableFeatures, 0.7352);
  console.log('Healthy Model Health Score:', healthyHealth.score, healthyHealth.status);
  assert(healthyHealth.score >= 80, `Model health in stable state is >= 80 (Got: ${healthyHealth.score})`);
  assert(healthyHealth.status === 'HEALTHY', 'Status is HEALTHY in stable state');

  const driftHealth = aura.AURA_RISK_INTELLIGENCE_AGENT.calculateModelHealth(aura.PSI_FEATURES, 0.7352);
  console.log('Drifted Model Health Score:', driftHealth.score, driftHealth.status);
  assert(driftHealth.score < 60, `Model health during critical drift drops < 60 (Got: ${driftHealth.score})`);
  assert(driftHealth.status.includes('CRITICAL DRIFT') || driftHealth.status.includes('DEGRADED'), 'Status flags critical drift / degraded');

  // TEST SUITE 7: AURA Risk Intelligence Agent — Structured States & Observation
  console.log('\n--- Test Suite 7: Risk Intelligence Agent — Structured States & Observation ---');
  const driftAgentEval = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluateDriftAndRecommend(aura.PSI_FEATURES);
  assert(driftAgentEval.status === 'RETRAIN', 'Agent transitions to RETRAIN state on severe drift');
  assert(driftAgentEval.severity === 'CRITICAL', 'Severity is marked CRITICAL');
  assert(driftAgentEval.recommended_action === 'TRIGGER_CHALLENGER', 'Recommended action is TRIGGER_CHALLENGER');
  assert(driftAgentEval.affected_features.includes('credit_income_ratio'), 'Identified credit_income_ratio as affected');
  assert(driftAgentEval.top_drifted_feature === 'credit_income_ratio', 'credit_income_ratio identified as top drifted feature');

  const stableAgentEval = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluateDriftAndRecommend(stableFeatures);
  assert(stableAgentEval.status === 'STABLE', 'Agent transitions to STABLE state when PSI < 0.10');
  assert(stableAgentEval.recommended_action === 'CONTINUE_MONITORING', 'Recommended action is CONTINUE_MONITORING');

  // TEST SUITE 8: Deterministic Promotion Gate & Failure Handling
  console.log('\n--- Test Suite 8: Deterministic Promotion Gate & Failure Handling ---');
  // Case A: Early Failed Challenger (AUC 0.5087 vs Champion 0.7278)
  const failedGateEval = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(0.7278, 0.5087, 0.004);
  assert(failedGateEval.passed === false, 'Failed candidate correctly fails deterministic gate');
  assert(failedGateEval.status === 'REJECT', 'Gate result is REJECT');
  assert(failedGateEval.decision === 'KEEP_CHAMPION', 'Decision is KEEP_CHAMPION');
  assert(failedGateEval.agent_recommendation === 'RECOMMEND_RETAINING_CHAMPION', 'Agent recommends retaining Champion');
  assert(failedGateEval.system_decision === 'DETERMINISTIC_GATE_FAILED', 'System decision is DETERMINISTIC_GATE_FAILED');

  // Case B: Promoted Challenger (AUC 0.7327 vs Champion 0.7278)
  const passedGateEval = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(0.7278, 0.7327, 0.004);
  assert(passedGateEval.passed === true, 'Successful candidate passes deterministic gate (+0.0049 >= 0.004)');
  assert(passedGateEval.status === 'PROMOTE', 'Gate result is PROMOTE');
  assert(passedGateEval.decision === 'PROMOTE_CHALLENGER', 'Decision is PROMOTE_CHALLENGER');
  assert(passedGateEval.agent_recommendation === 'RECOMMEND_PROMOTION', 'Agent recommends promotion');
  assert(passedGateEval.system_decision === 'DETERMINISTIC_GATE_PASSED', 'System decision is DETERMINISTIC_GATE_PASSED');

  // Case C: Borderline candidate (+0.0039 < 0.004 threshold)
  const borderlineGateEval = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(0.7278, 0.7317, 0.004);
  assert(borderlineGateEval.passed === false, 'Borderline candidate (+0.0039 < 0.004) is safely rejected');

  // TEST SUITE 9: Human Review Escalation (Safety Layer)
  console.log('\n--- Test Suite 9: Human Review Escalation ---');
  const missingDataGate = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluatePromotionGate(null, 0.7327);
  assert(missingDataGate.status === 'ESCALATE', 'Missing champion AUC triggers ESCALATE state');
  assert(missingDataGate.decision === 'HUMAN_REVIEW_REQUIRED', 'Decision is HUMAN_REVIEW_REQUIRED');

  const missingDriftAgent = aura.AURA_RISK_INTELLIGENCE_AGENT.evaluateDriftAndRecommend(null);
  assert(missingDriftAgent.status === 'ESCALATE', 'Missing drift telemetry triggers ESCALATE state');
  assert(missingDriftAgent.recommended_action === 'HUMAN_REVIEW_REQUIRED', 'Recommended action is HUMAN_REVIEW_REQUIRED');

  // TEST SUITE 10: Evidence-Grounded "Ask AURA" Q&A Engine
  console.log('\n--- Test Suite 10: Evidence-Grounded "Ask AURA" Q&A Engine ---');
  const answerRetrain = aura.AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery('Why did the model retrain?');
  assert(answerRetrain.includes('2.7008'), 'Retrain explanation cites exact CIR PSI 2.7008');
  assert(answerRetrain.includes('0.20'), 'Retrain explanation cites 0.20 threshold');

  const answerHighestDrift = aura.AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery('Which feature has the highest drift?');
  assert(answerHighestDrift.includes('credit_income_ratio') && answerHighestDrift.includes('2.7008'), 'Highest drift correctly identifies CIR 2.7008');

  const answerRejected = aura.AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery('Why was the Challenger rejected?');
  assert(answerRejected.includes('0.5087') && answerRejected.includes('0.7278'), 'Rejected candidate explanation cites AUC 0.5087 vs 0.7278');

  const answerPromoted = aura.AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery('Why was the Challenger promoted?');
  assert(answerPromoted.includes('0.7327') && answerPromoted.includes('+0.0049'), 'Promoted candidate explanation cites AUC 0.7327 and +0.0049 delta');

  // TEST SUITE 11: Individual Applicant Risk Decomposition
  console.log('\n--- Test Suite 11: Individual Applicant Risk Decomposition ---');
  const applicantRisk = aura.AURA_RISK_INTELLIGENCE_AGENT.explainApplicantRisk({
    credit_income_ratio: 9.4,
    employment_years: 1.5,
    ext_mean: 0.48,
    credit_per_year: 3.2
  }, 0.52, false);
  assert(applicantRisk.risk_factors.length >= 3, 'Identified top risk factors for applicant');
  assert(applicantRisk.risk_factors.some(r => r.name.includes('Credit-to-Income')), 'Identified CIR as major risk factor');
  assert(applicantRisk.risk_factors.some(r => r.name.includes('Employment')), 'Identified Employment tenure as risk factor');

  // TEST SUITE 12: Risk Intelligence Report Generation & Governance Separation
  console.log('\n--- Test Suite 12: Risk Intelligence Report Generation ---');
  const report = aura.AURA_RISK_INTELLIGENCE_AGENT.generateRiskReport();
  assert(report.report_id.startsWith('AURA-RISK-REP-'), 'Report contains unique ID');
  assert(report.active_model.version === 'v12', 'Report identifies active model version v12');
  assert(report.deterministic_governance.last_evaluation.agent_recommendation === 'RECOMMEND_PROMOTION', 'Report records Agent Recommendation');
  assert(report.deterministic_governance.last_evaluation.system_decision === 'DETERMINISTIC_GATE_PASSED', 'Report records System Decision');

  console.log('\n================================================================');
  console.log(`📊 FINAL SUMMARY: ${passedTests} passed, ${failedTests} failed`);
  console.log('================================================================');
}

runTestSuite().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});

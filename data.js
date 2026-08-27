const AURA_CONFIG = {
  champion_uri: 'models:/workspace.default.aura_credit_champion@champion',
  challenger_uri: 'models:/workspace.default.aura_credit_challenger@challenger',
  gold_tables: {
    drift_metrics: 'gold.drift_metrics',
    model_comparison: 'gold.model_comparison',
    retraining_log: 'gold.retraining_log',
    llm_evaluation: 'gold.llm_evaluation_metrics',
  },
  dataset: {
    raw_records: 307511,
    cleaned_records: 297664,
  },
  models: {
    baseline_rf: { name: 'Baseline Random Forest', auc: 0.6166, version: 'v1' },
    champion_rf: { name: 'Improved Random Forest Champion', auc: 0.7278, version: 'v6' },
    failed_challenger: { name: 'Early RF Challenger', auc: 0.5087, version: 'v10', decision: 'REJECTED', reason: 'Failed gate: AUC 0.5087 < 0.7278 (-0.2191 < 0.004)' },
    promoted_challenger: { name: 'Random Forest Challenger', auc: 0.7327, version: 'v11', decision: 'PROMOTED', reason: 'Passed gate: +0.0049 >= 0.004 threshold' },
    champion_xgboost: { name: 'XGBoost Champion (Production)', auc: 0.7352, accuracy: 0.7210, f1: 0.2635, version: 'v12' },
  },
  promotion_threshold: 0.004,
  champion_auc: 0.7352,
  challenger_auc: 0.7327,
  feature_count: 11,
  feature_cols: [
    'income', 'age_years', 'credit_income_ratio', 'employment_years',
    'ext_source_1', 'ext_source_2', 'ext_source_3', 'ext_mean', 'ext_min',
    'income_age_ratio', 'credit_per_year'
  ],
};

const DRIFT_DATA = [
  { feature: 'credit_income_ratio', psi_score: 2.7008, status: 'CRITICAL DRIFT', action: 'TRIGGER RETRAIN' },
  { feature: 'employment_years',    psi_score: 1.3962, status: 'CRITICAL DRIFT', action: 'TRIGGER RETRAIN' },
  { feature: 'income',              psi_score: 0.7726, status: 'CRITICAL DRIFT', action: 'TRIGGER RETRAIN' },
  { feature: 'age_years',           psi_score: 0.1223, status: 'MODERATE DRIFT', action: 'INCREASE MONITORING' },
  { feature: 'debt_service_ratio',  psi_score: 0.0941, status: 'STABLE',         action: 'MONITOR' },
];

const RETRAIN_DATA = {
  event: 'AUTONOMOUS_RETRAIN',
  trigger: 'PSI > 0.2 (credit_income_ratio: 2.7008, employment_years: 1.3962, income: 0.7726)',
  champion_auc: 0.7278,
  challenger_auc: 0.7327,
  auc_delta: 0.0049,
  threshold: 0.004,
  message: 'PROMOTED CHALLENGER TO PRODUCTION (Δ +0.0049 >= 0.004)',
  decision: 'Challenger Promoted (v11)',
};

const HALLUC_FIREWALL_DATA = [
  { app_id: 'APP_001', error_type: 'Regulatory Hallucination', cited_law: 'Section 23B',    action: 'BLOCKED'  },
  { app_id: 'APP_002', error_type: 'Factual Mismatch',         cited_law: 'None',            action: 'BLOCKED'  },
  { app_id: 'APP_003', error_type: 'None',                     cited_law: 'RBI/2015-16/76',  action: 'APPROVED' },
];

const PSI_FEATURES = [
  { name: 'credit_income_ratio', psi: 2.7008, severity: 'high',   training_mean: 7.14,   production_mean: 12.30,  action: 'Retrain triggered' },
  { name: 'employment_years',    psi: 1.3962, severity: 'high',   training_mean: 6.20,   production_mean: 3.40,   action: 'Retrain triggered' },
  { name: 'income',              psi: 0.7726, severity: 'high',   training_mean: 168797, production_mean: 124312, action: 'Retrain triggered' },
  { name: 'age_years',           psi: 0.1223, severity: 'medium', training_mean: 43.10,  production_mean: 39.40,  action: 'Increase monitoring' },
  { name: 'debt_service_ratio',  psi: 0.0941, severity: 'low',    training_mean: 0.21,   production_mean: 0.22,   action: 'Stable' },
];

const LLM_EVALUATIONS = [
  {
    id: 1,
    explanation: 'Based on RBI/2022-23/103, your debt-service ratio of 0.62 exceeds threshold. Employment stability of 2 years is below the 5-year preferred baseline per RBI/2021-22/125.',
    citations: ['RBI/2022-23/103', 'RBI/2021-22/125'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 2,
    explanation: 'Per Section 23B of the Banking Regulation Act, a minimum CIBIL score of 750 is mandatory for this loan category.',
    citations: ['Section 23B'],
    hallucinated: ['Section 23B'],
    grounding_score: 0.0,
    halluc_score: 1.0,
    has_hallucination: true,
  },
  {
    id: 3,
    explanation: 'As per RBI Circular RBI/2023/999, NBFCs must reject applicants with employment tenure under 6 months.',
    citations: ['RBI/2023/999'],
    hallucinated: ['RBI/2023/999'],
    grounding_score: 0.0,
    halluc_score: 1.0,
    has_hallucination: true,
  },
  {
    id: 4,
    explanation: 'Your income of ₹3.2L per annum results in a credit-income ratio of 9.4, exceeding the NBFC lending guideline under RBI/2022-23/103.',
    citations: ['RBI/2022-23/103'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 5,
    explanation: 'Under Article 15C of the RBI Master Direction on Credit, a debt-service ratio above 0.4 is prohibited.',
    citations: ['Article 15C'],
    hallucinated: ['Article 15C'],
    grounding_score: 0.0,
    halluc_score: 1.0,
    has_hallucination: true,
  },
  {
    id: 6,
    explanation: 'Per SEBI/LAD-NRO/GN/2021/29 and DBR.No.Dir.BC.12/13.03.00/2015-16, the applicant\'s profile meets lending criteria. Loan approved.',
    citations: ['SEBI/LAD-NRO/GN/2021/29', 'DBR.No.Dir.BC.12/13.03.00/2015-16'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 7,
    explanation: 'Employment history of 8 years and income of ₹6.5L supports loan approval per Digital Lending Guidelines RBI/2021-22/125.',
    citations: ['RBI/2021-22/125'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 8,
    explanation: 'Loan rejected under Credit Rating Agencies norms SEBI/LAD-NRO/GN/2021/29 due to high debt-service ratio.',
    citations: ['SEBI/LAD-NRO/GN/2021/29'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
];

const VALID_REGULATIONS = [
  'DBR.No.Dir.BC.12/13.03.00/2015-16',
  'RBI/2021-22/125',
  'RBI/2022-23/103',
  'RBI/2023-24/73',
  'RBI/2015-16/76',
  'SEBI/LAD-NRO/GN/2021/29',
];

const REJECTION_EXPLANATIONS = [
  'Based on RBI/2022-23/103 (Fair Practices Code for NBFCs), your application was assessed against our 11-feature credit risk model. Your credit-income ratio of {cir} significantly exceeds the acceptable threshold. Combined with external source scores (ext_mean: {ext_mean}), the model determined a default probability of {prob}%. Employment tenure of {emp_years} years is below the 5-year preferred baseline per RBI/2021-22/125.',
  'As per the Digital Lending Guidelines (RBI/2021-22/125), your application has been evaluated across 11 engineered features. The credit_per_year of {cpy} and income_age_ratio of {iar} indicate disproportionate credit exposure relative to earning capacity. The Random Forest model flagged elevated risk.',
  'Under DBR.No.Dir.BC.12/13.03.00/2015-16, your profile was assessed using external bureau scores (ext_source_2: {ext2}, ext_source_3: {ext3}) and credit ratios. The credit-income ratio of {cir} combined with limited employment stability indicate that loan approval poses significant default risk.',
];

const APPROVAL_EXPLANATIONS = [
  'Your application has been reviewed against RBI/2021-22/125 (Digital Lending Guidelines). With employment tenure of {emp_years} years, a healthy credit-income ratio of {cir}, and strong external bureau scores (ext_mean: {ext_mean}), your profile meets all 11 credit risk criteria. Default probability: {prob}%. Loan approved.',
  'As per RBI/2022-23/103 (Fair Practices Code for NBFCs), your credit profile demonstrates stable repayment capacity. Your external source scores (ext_source_2: {ext2}, ext_source_3: {ext3}) and credit_per_year of {cpy} confirm low risk. Approved with confidence.',
];

const DEMO_PROFILES = {
  high_risk: {
    label: 'High Risk Customer',
    probability: 0.424,
    approved: false,
    features: {
      income:               0.9,
      age_years:            51.5288,
      credit_income_ratio:  10.0,
      employment_years:     2.1068,
      ext_source_1:         0.5,
      ext_source_2:         0.5053,
      ext_source_3:         0.6347,
      ext_mean:             0.5467,
      ext_min:              0.5,
      income_age_ratio:     0.0175,
      credit_per_year:      3.2187,
    },
  },
  low_risk: {
    label: 'Low Risk Customer',
    probability: 0.058,
    approved: true,
    features: {
      income:               1.575,
      age_years:            27.474,
      credit_income_ratio:  2.1802,
      employment_years:     4.463,
      ext_source_1:         0.5,
      ext_source_2:         0.855,
      ext_source_3:         0.6956,
      ext_mean:             0.6835,
      ext_min:              0.5,
      income_age_ratio:     0.0573,
      credit_per_year:      0.3991,
    },
  },
};

async function API_scoreLoan(payload) {
  await mockDelay(900);

  if (payload._preset) {
    const profile = DEMO_PROFILES[payload._preset];
    const feats = profile.features;
    const prob = profile.probability;
    const approved = profile.approved;

    const templates = approved ? APPROVAL_EXPLANATIONS : REJECTION_EXPLANATIONS;
    const template = templates[Math.floor(Math.random() * templates.length)];
    const explanation = template
      .replace('{income}', feats.income.toFixed(4))
      .replace('{cir}', feats.credit_income_ratio.toFixed(4))
      .replace('{emp_years}', feats.employment_years.toFixed(2))
      .replace('{ext_mean}', feats.ext_mean.toFixed(4))
      .replace('{ext2}', feats.ext_source_2.toFixed(4))
      .replace('{ext3}', feats.ext_source_3.toFixed(4))
      .replace('{cpy}', feats.credit_per_year.toFixed(4))
      .replace('{iar}', feats.income_age_ratio.toFixed(4))
      .replace('{prob}', (prob * 100).toFixed(1));

    const hallucination = detectHallucinations(explanation);

    return {
      approved,
      probability: prob,
      features: feats,
      explanation,
      hallucination,
      model: 'aura_credit_champion/Production',
      preset_used: payload._preset,
    };
  }

  const income = payload.income;
  const age_years = Math.abs(payload.age);
  const credit_income_ratio = payload.credit / payload.income;
  const employment_years = Math.max(0, payload.employment_years);
  const ext_source_1 = typeof payload.ext_source_1 === 'number' ? payload.ext_source_1 : 0.5;
  const ext_source_2 = typeof payload.ext_source_2 === 'number' ? payload.ext_source_2 : 0.5;
  const ext_source_3 = typeof payload.ext_source_3 === 'number' ? payload.ext_source_3 : 0.5;
  const ext_mean = (ext_source_1 + ext_source_2 + ext_source_3) / 3;
  const ext_min = Math.min(ext_source_1, ext_source_2, ext_source_3);
  const income_age_ratio = income / (age_years * 10000);
  const credit_per_year = credit_income_ratio / (employment_years || 1);

  let default_prob = 0.12;
  if (credit_income_ratio > 8)       default_prob += 0.18;
  else if (credit_income_ratio > 5)  default_prob += 0.08;
  else if (credit_income_ratio < 2.5) default_prob -= 0.04;

  if (employment_years < 2)          default_prob += 0.10;
  else if (employment_years < 4)     default_prob += 0.04;
  else if (employment_years >= 5)    default_prob -= 0.03;

  if (ext_mean < 0.55)               default_prob += 0.08;
  else if (ext_mean >= 0.75)         default_prob -= 0.05;

  if (ext_source_2 < 0.55)           default_prob += 0.06;
  if (credit_per_year > 2.5)         default_prob += 0.08;
  if (income_age_ratio < 0.02)       default_prob += 0.05;
  if (age_years > 50)                default_prob += 0.04;
  default_prob = Math.min(0.95, Math.max(0.02, default_prob));

  const approved = default_prob < 0.35;

  const feats = {
    income, age_years, credit_income_ratio,
    employment_years, ext_source_1, ext_source_2, ext_source_3,
    ext_mean, ext_min, income_age_ratio, credit_per_year,
  };

  const templates = approved ? APPROVAL_EXPLANATIONS : REJECTION_EXPLANATIONS;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const explanation = template
    .replace('{income}', income.toLocaleString('en-IN'))
    .replace('{cir}', credit_income_ratio.toFixed(4))
    .replace('{emp_years}', employment_years.toFixed(2))
    .replace('{ext_mean}', ext_mean.toFixed(4))
    .replace('{ext2}', ext_source_2.toFixed(4))
    .replace('{ext3}', ext_source_3.toFixed(4))
    .replace('{cpy}', credit_per_year.toFixed(4))
    .replace('{iar}', income_age_ratio.toFixed(4))
    .replace('{prob}', (default_prob * 100).toFixed(1));

  const hallucination = detectHallucinations(explanation);

  return {
    approved,
    probability: default_prob,
    features: feats,
    explanation,
    hallucination,
    model: 'aura_credit_champion/Production',
  };
}

async function API_runPSI() {
  await mockDelay(1200);
  return PSI_FEATURES.map(f => ({
    ...f,
    psi: Math.max(0.01, f.psi + (Math.random() * 0.06 - 0.03)),
  }));
}

const ACTR_KNOWLEDGE_BASE = {
  rbi_guidelines: {
    'RBI/2021-22/125': {
      title: 'Master Direction on Digital Lending Guidelines',
      authority: 'Reserve Bank of India (RBI)',
      scope: 'Digital loan underwriting, borrower disclosures, algorithmic transparency',
      rules: [
        'Mandates explicit customer consent and key fact statement disclosures',
        'Recommends 5-year employment stability as preferred baseline for prime unsecured digital credit',
        'Requires all AI underwriting factors to be auditable and explainable',
        'Prohibits automatic credit limit enhancements without explicit borrower consent'
      ],
      valid: true,
    },
    'RBI/2022-23/103': {
      title: 'Master Direction – Fair Practices Code for NBFCs',
      authority: 'Reserve Bank of India (RBI)',
      scope: 'Credit risk assessment, interest rate modeling, credit-income thresholds',
      rules: [
        'Sets prudent underwriting standards for debt service and credit exposure',
        'Recommends credit-to-income ratio (CIR) threshold benchmark <= 8.0 for NBFC retail portfolios',
        'Requires risk-based transparent pricing without predatory margin inflation'
      ],
      valid: true,
    },
    'RBI/2023-24/73': {
      title: 'Regulatory Framework for Microfinance & Retail Credit Underwriting',
      authority: 'Reserve Bank of India (RBI)',
      scope: 'Retail lending limits, household repayment capacity',
      rules: [
        'Limits monthly repayment obligations to sustainable borrower income proportions',
        'Ensures debt obligation caps to prevent over-indebtedness'
      ],
      valid: true,
    },
    'RBI/2015-16/76': {
      title: 'Master Circular on Wilful Defaulters & Credit Discipline',
      authority: 'Reserve Bank of India (RBI)',
      scope: 'Prudential default identification, reporting norms',
      rules: [
        'Defines criteria for classifying non-performing accounts and intentional default',
        'Requires strict reporting to central credit information bureaus'
      ],
      valid: true,
    },
    'DBR.No.Dir.BC.12/13.03.00/2015-16': {
      title: 'Master Circular on Prudential Norms & Credit Bureau Scoring',
      authority: 'Reserve Bank of India (Department of Banking Regulation)',
      scope: 'External credit bureau multi-source scoring and risk weighting',
      rules: [
        'Mandates multi-bureau external score integration (ext_source_1, ext_source_2, ext_source_3)',
        'Requires minimum risk buffer weighting for applicants with borderline bureau ratings'
      ],
      valid: true,
    },
  },
  sebi_rules: {
    'SEBI/LAD-NRO/GN/2021/29': {
      title: 'Securities and Exchange Board of India (Credit Rating Agencies) Regulations',
      authority: 'SEBI',
      scope: 'Standardized risk classification, default probability models, disclosures',
      rules: [
        'Standardizes credit risk rating scales and quantitative rating methodologies',
        'Mandates periodic validation of default prediction models'
      ],
      valid: true,
    },
  },
  compliance_rules: {
    max_cir_threshold: 8.0,
    caution_cir_threshold: 5.0,
    preferred_employment_years: 5.0,
    min_employment_stability: 2.0,
    disallowed_regulations: ['Section 23B', 'RBI/2023/999', 'Article 15C', 'Section 45ZA'],
    unsupported_mandates: [
      { pattern: /Section\s+23B.*(?:mandatory\s+CIBIL|CIBIL.*mandatory)/i, reason: 'Banking Regulation Act Section 23B governs branch licensing, not mandatory 750 CIBIL score cutoff.' },
      { pattern: /RBI\/2023\/999.*(?:reject.*under\s+6\s+months|tenure\s+under\s+6\s+months)/i, reason: 'Circular RBI/2023/999 is non-existent; RBI does not issue statutory 6-month blanket rejection mandates.' },
      { pattern: /Article\s+15C.*(?:prohibited|debt-service)/i, reason: 'Article 15C is a non-existent statutory rule in RBI Master Directions.' }
    ]
  }
};

/**
 * ACTR Module 1: Claim Extraction Module
 * Extracts regulations, financial claims, and compliance references from LLM explanation text.
 */
function actrExtractClaims(text, applicantContext = null) {
  if (!text || typeof text !== 'string') {
    return { regulations: [], financial_claims: [], compliance_references: [] };
  }

  // 1. Extract Regulations
  const regRegex = /\b(RBI\/\d{4}[/-]\d+[/-]?\d*|SEBI\/[A-Z-]+\/[A-Z]+\/\d+\/\d+|DBR\.[A-Z.]+\/[A-Z.]+\/\d{4}-\d+|Section\s+\d+[A-Z]?(?:\s+of\s+[^,\.\n]+)?|Article\s+\d+[A-Z]?)\b/gi;
  const rawRegMatches = text.match(regRegex) || [];
  
  // Normalize citations (extract core regulation key e.g. "Section 23B")
  const regulations = [...new Set(rawRegMatches.map(r => {
    const trimmed = r.trim();
    const secMatch = trimmed.match(/Section\s+\d+[A-Z]?/i);
    if (secMatch && !VALID_REGULATIONS.includes(trimmed)) return secMatch[0];
    const artMatch = trimmed.match(/Article\s+\d+[A-Z]?/i);
    if (artMatch && !VALID_REGULATIONS.includes(trimmed)) return artMatch[0];
    return trimmed;
  }))];

  // 2. Extract Financial Claims
  const financial_claims = [];

  // CIR / Credit-Income Ratio
  const cirMatch = text.match(/(?:credit-income ratio|credit_income_ratio|CIR)(?:\s+of)?\s*:?\s*(\d+(?:\.\d+)?)/i);
  if (cirMatch) {
    financial_claims.push({
      type: 'credit_income_ratio',
      claimed_value: parseFloat(cirMatch[1]),
      raw_text: cirMatch[0]
    });
  }

  // Debt-Service Ratio / DSR
  const dsrMatch = text.match(/(?:debt-service ratio|debt service ratio|DSR)(?:\s+of)?\s*:?\s*(\d+(?:\.\d+)?)/i);
  if (dsrMatch) {
    financial_claims.push({
      type: 'debt_service_ratio',
      claimed_value: parseFloat(dsrMatch[1]),
      raw_text: dsrMatch[0]
    });
  }

  // Income claims
  const incMatch = text.match(/(?:income(?:\s+of)?\s*:?\s*|₹\s*)(\d+(?:\.\d+)?(?:\s*[Ll]akhs?|\s*[Ll]|\s*[Kk])?|\d{4,})/i);
  if (incMatch) {
    financial_claims.push({
      type: 'income',
      claimed_value: incMatch[1],
      raw_text: incMatch[0]
    });
  }

  // Employment tenure claims
  const empMatch = text.match(/(?:employment(?:\s+history|\s+tenure|\s+stability)?(?:\s+of)?\s*:?\s*)(\d+(?:\.\d+)?)\s*(years?|months?)/i);
  if (empMatch) {
    financial_claims.push({
      type: 'employment_years',
      claimed_value: parseFloat(empMatch[1]),
      unit: empMatch[2],
      raw_text: empMatch[0]
    });
  }

  // Bureau score / CIBIL claims
  const cibilMatch = text.match(/(?:CIBIL score|bureau score)(?:\s+of)?\s*:?\s*(\d+)/i);
  if (cibilMatch) {
    financial_claims.push({
      type: 'cibil_score',
      claimed_value: parseInt(cibilMatch[1], 10),
      raw_text: cibilMatch[0]
    });
  }

  // Default Probability claims
  const probMatch = text.match(/(?:default probability|probability)(?:\s+of)?\s*:?\s*(\d+(?:\.\d+)?)\s*%/i);
  if (probMatch) {
    financial_claims.push({
      type: 'default_probability',
      claimed_value: parseFloat(probMatch[1]),
      raw_text: probMatch[0]
    });
  }

  // 3. Extract Compliance References
  const compliance_references = [];
  const compliancePatterns = [
    { pattern: /(?:mandatory|mandatory for this loan category)/i, type: 'MANDATORY_REQUIREMENT' },
    { pattern: /(?:prohibited|is prohibited)/i, type: 'STATUTORY_PROHIBITION' },
    { pattern: /(?:must reject|must be rejected)/i, type: 'STATUTORY_REJECTION_MANDATE' },
    { pattern: /(?:Fair Practices Code for NBFCs|Digital Lending Guidelines|Credit Rating Agencies norms)/i, type: 'REGULATORY_FRAMEWORK_CITED' },
    { pattern: /(?:meets (?:all )?lending criteria|meets (?:all )?11 credit risk criteria)/i, type: 'APPROVAL_CRITERIA_MET' },
    { pattern: /(?:preferred baseline|acceptable threshold)/i, type: 'PRUDENTIAL_BASELINE' }
  ];

  compliancePatterns.forEach(cp => {
    if (cp.pattern.test(text)) {
      compliance_references.push({
        type: cp.type,
        matched_text: text.match(cp.pattern)[0]
      });
    }
  });

  return {
    regulations,
    financial_claims,
    compliance_references
  };
}

/**
 * ACTR Module 2: Cross-Reference Validator
 * Cross-references extracted claims against RBI Database, SEBI Rules, and Verified Compliance Knowledge Base.
 */
function actrCrossReference(extractedClaims, applicantContext = null) {
  const { regulations, financial_claims, compliance_references } = extractedClaims;

  const rbi_checks = [];
  const sebi_checks = [];
  const compliance_checks = [];

  // 1. Cross-reference regulations
  regulations.forEach(citation => {
    const rbiEntry = ACTR_KNOWLEDGE_BASE.rbi_guidelines[citation];
    const sebiEntry = ACTR_KNOWLEDGE_BASE.sebi_rules[citation];

    if (rbiEntry) {
      rbi_checks.push({
        citation,
        valid: true,
        authority: rbiEntry.authority,
        title: rbiEntry.title,
        status: 'VERIFIED_IN_RBI_DB'
      });
    } else if (sebiEntry) {
      sebi_checks.push({
        citation,
        valid: true,
        authority: sebiEntry.authority,
        title: sebiEntry.title,
        status: 'VERIFIED_IN_SEBI_RULES'
      });
    } else {
      compliance_checks.push({
        citation,
        valid: false,
        status: 'UNREGISTERED_OR_FABRICATED',
        error_type: 'HALLUCINATED_REGULATION',
        detail: `The citation "${citation}" does not exist in official RBI/SEBI regulatory archives.`
      });
    }
  });

  // 2. Cross-reference financial claims against ground-truth applicant context (if provided)
  const financial_validations = [];
  financial_claims.forEach(claim => {
    let isValid = true;
    let detail = 'Consistent with standard underwriting bounds';

    if (applicantContext) {
      if (claim.type === 'credit_income_ratio' && applicantContext.credit_income_ratio !== undefined) {
        const diff = Math.abs(claim.claimed_value - applicantContext.credit_income_ratio);
        if (diff > 0.5) {
          isValid = false;
          detail = `Factual mismatch: claimed CIR ${claim.claimed_value} differs from applicant verified CIR ${applicantContext.credit_income_ratio.toFixed(2)}`;
        }
      }
      if (claim.type === 'employment_years' && applicantContext.employment_years !== undefined) {
        const diff = Math.abs(claim.claimed_value - applicantContext.employment_years);
        if (diff > 0.5) {
          isValid = false;
          detail = `Factual mismatch: claimed tenure ${claim.claimed_value} differs from verified tenure ${applicantContext.employment_years.toFixed(2)} yrs`;
        }
      }
    }

    financial_validations.push({
      claim,
      valid: isValid,
      detail
    });
  });

  // 3. Cross-reference compliance statements
  const compliance_rule_checks = [];
  ACTR_KNOWLEDGE_BASE.compliance_rules.unsupported_mandates.forEach(rule => {
    // Check if the original text or compliance refs trigger unsupported mandates
    const isTriggered = rule.pattern.test(extractedClaims._raw_text || '');
    if (isTriggered) {
      compliance_rule_checks.push({
        valid: false,
        error_type: 'FABRICATED_STATUTORY_REASONING',
        reason: rule.reason
      });
    }
  });

  return {
    rbi_checks,
    sebi_checks,
    compliance_checks,
    financial_validations,
    compliance_rule_checks
  };
}

/**
 * ACTR Module 3: Hallucination Detection Layer
 * Detects fake regulations, unsupported claims, and fabricated reasoning.
 */
function actrDetectHallucinations(crossRefResult, extractedClaims) {
  const fake_regulations = [];
  const unsupported_claims = [];
  const fabricated_reasoning = [];

  // Check invalid regulations
  crossRefResult.compliance_checks.forEach(c => {
    if (!c.valid && c.citation) {
      fake_regulations.push({
        citation: c.citation,
        detail: c.detail || 'Unregistered regulatory citation'
      });
    }
  });

  // Check financial claim mismatches
  crossRefResult.financial_validations.forEach(fv => {
    if (!fv.valid) {
      unsupported_claims.push({
        claim: fv.claim,
        detail: fv.detail
      });
    }
  });

  // Check fabricated compliance reasoning
  crossRefResult.compliance_rule_checks.forEach(crc => {
    if (!crc.valid) {
      fabricated_reasoning.push({
        error_type: crc.error_type,
        reason: crc.reason
      });
    }
  });

  // Calculate scores
  const totalRegulations = extractedClaims.regulations.length;
  const validRegulations = crossRefResult.rbi_checks.length + crossRefResult.sebi_checks.length;
  const invalidRegulations = fake_regulations.length;

  let grounding_score = 1.0;
  let halluc_score = 0.0;

  if (totalRegulations > 0) {
    grounding_score = parseFloat((validRegulations / totalRegulations).toFixed(2));
    halluc_score = parseFloat((invalidRegulations / totalRegulations).toFixed(2));
  } else if (unsupported_claims.length > 0 || fabricated_reasoning.length > 0) {
    grounding_score = 0.3;
    halluc_score = 0.7;
  }

  const has_hallucination = fake_regulations.length > 0 || unsupported_claims.length > 0 || fabricated_reasoning.length > 0;

  return {
    fake_regulations,
    unsupported_claims,
    fabricated_reasoning,
    grounding_score,
    halluc_score,
    has_hallucination,
    severity: has_hallucination ? (halluc_score > 0.4 ? 'CRITICAL' : 'WARNING') : 'CLEAN'
  };
}

/**
 * ACTR Module 4: Correction & Rewriting Engine
 * Removes hallucinations, synthesizes verified regulatory grounding, and rewrites compliance-safe explanation.
 */
function actrRewriteAndCorrect(originalText, detectionResult, applicantContext = null, approved = null) {
  if (!detectionResult.has_hallucination) {
    return {
      rewritten_explanation: originalText,
      removed_hallucinations: [],
      grounded_replacements: [],
      compliance_secured: true,
      safe_response: originalText,
    };
  }

  const removed_hallucinations = [
    ...detectionResult.fake_regulations.map(r => r.citation),
    ...detectionResult.unsupported_claims.map(u => u.detail),
    ...detectionResult.fabricated_reasoning.map(f => f.reason)
  ];

  // Derive parameters from applicantContext or extract fallback from text
  const isApproved = approved !== null ? approved : (originalText.toLowerCase().includes('approved') && !originalText.toLowerCase().includes('rejected'));
  const cir = applicantContext && applicantContext.credit_income_ratio !== undefined
    ? applicantContext.credit_income_ratio.toFixed(2)
    : '8.40';
  const empYears = applicantContext && applicantContext.employment_years !== undefined
    ? applicantContext.employment_years.toFixed(1)
    : '2.0';
  const prob = applicantContext && applicantContext.probability !== undefined
    ? (applicantContext.probability * 100).toFixed(1)
    : (isApproved ? '12.0' : '45.0');
  const extMean = applicantContext && applicantContext.ext_mean !== undefined
    ? applicantContext.ext_mean.toFixed(4)
    : '0.5200';

  let rewritten_explanation = '';
  const grounded_replacements = [];

  if (isApproved) {
    grounded_replacements.push('RBI/2021-22/125 (Digital Lending Guidelines)');
    grounded_replacements.push('RBI/2022-23/103 (Fair Practices Code for NBFCs)');
    rewritten_explanation = `[ACTR SECURED] Your application has been reviewed in compliance with RBI/2021-22/125 (Digital Lending Guidelines) and RBI/2022-23/103 (Fair Practices Code for NBFCs). With verified employment tenure of ${empYears} years, a healthy credit-income ratio of ${cir}, and robust external bureau scores (ext_mean: ${extMean}), your profile satisfies all 11 quantitative risk criteria with a default probability of ${prob}%. Loan approved.`;
  } else {
    grounded_replacements.push('RBI/2022-23/103 (Fair Practices Code for NBFCs)');
    grounded_replacements.push('DBR.No.Dir.BC.12/13.03.00/2015-16 (Credit Bureau Scoring Guidelines)');
    rewritten_explanation = `[ACTR SECURED] In accordance with RBI/2022-23/103 (Fair Practices Code for NBFCs) and DBR.No.Dir.BC.12/13.03.00/2015-16 (Credit Bureau Scoring Guidelines), your application was evaluated against our 11-feature credit model. Your credit-income ratio of ${cir} exceeds the recommended threshold and external score distribution (ext_mean: ${extMean}) yields an elevated default probability of ${prob}%. Application rejected based on objective underwriting criteria.`;
  }

  return {
    rewritten_explanation,
    removed_hallucinations,
    grounded_replacements,
    compliance_secured: true,
    safe_response: rewritten_explanation
  };
}

/**
 * Unified ACTR Cross-Truth Reasoning Verification Pipeline
 * Flow: User Query -> LLM Explanation -> ACTR Engine (Extract -> Validate -> Detect -> Rewrite) -> Safe Verified Response
 */
function actrVerifyExplanation(text, applicantContext = null, approved = null) {
  // Stage 1: Claim Extraction Module
  const extractedClaims = actrExtractClaims(text, applicantContext);
  extractedClaims._raw_text = text;

  // Stage 2: Cross-Reference Validator
  const crossRefResult = actrCrossReference(extractedClaims, applicantContext);

  // Stage 3: Hallucination Detection Layer
  const detectionResult = actrDetectHallucinations(crossRefResult, extractedClaims);

  // Stage 4: Correction & Rewriting Engine
  const correctionResult = actrRewriteAndCorrect(text, detectionResult, applicantContext, approved);

  const valid_citations = [...crossRefResult.rbi_checks, ...crossRefResult.sebi_checks].map(c => c.citation);
  const invalid_citations = detectionResult.fake_regulations.map(r => r.citation);

  return {
    original_text: text,
    safe_response: correctionResult.safe_response,
    has_hallucination: detectionResult.has_hallucination,
    grounding_score: detectionResult.grounding_score,
    halluc_score: detectionResult.halluc_score,
    severity: detectionResult.severity,
    citations: extractedClaims.regulations,
    valid_citations,
    invalid_citations,
    stage1_extraction: {
      regulations: extractedClaims.regulations,
      financial_claims: extractedClaims.financial_claims,
      compliance_references: extractedClaims.compliance_references,
    },
    stage2_validation: {
      rbi_checks: crossRefResult.rbi_checks,
      sebi_checks: crossRefResult.sebi_checks,
      compliance_checks: crossRefResult.compliance_checks,
      financial_validations: crossRefResult.financial_validations,
    },
    stage3_detection: {
      fake_regulations: detectionResult.fake_regulations,
      unsupported_claims: detectionResult.unsupported_claims,
      fabricated_reasoning: detectionResult.fabricated_reasoning,
    },
    stage4_correction: {
      removed_hallucinations: correctionResult.removed_hallucinations,
      grounded_replacements: correctionResult.grounded_replacements,
      compliance_secured: correctionResult.compliance_secured,
      rewritten_explanation: correctionResult.rewritten_explanation,
    },
  };
}

async function API_evaluateExplanation(payload) {
  await mockDelay(700);
  const text = typeof payload === 'string' ? payload : (payload.text || '');
  const context = payload.context || null;
  const approved = payload.approved !== undefined ? payload.approved : null;
  return detectHallucinations(text, context, approved);
}

async function API_runACTRVerification(payload) {
  await mockDelay(800);
  const text = typeof payload === 'string' ? payload : (payload.text || '');
  const context = payload.context || null;
  const approved = payload.approved !== undefined ? payload.approved : null;
  return actrVerifyExplanation(text, context, approved);
}

async function API_promoteChallenger() {
  await mockDelay(1500);
  return { success: true, message: 'Challenger promoted to Production. Champion archived. Model URI updated in Unity Catalog.' };
}

function detectHallucinations(text, applicantContext = null, approved = null) {
  const actr = actrVerifyExplanation(text, applicantContext, approved);

  return {
    citations: actr.citations,
    valid_citations: actr.valid_citations,
    invalid_citations: actr.invalid_citations,
    grounding_score: actr.grounding_score,
    halluc_score: actr.halluc_score,
    has_hallucination: actr.has_hallucination,
    actr: actr,
  };
}

function mockDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function psiSeverity(val) {
  if (val > 0.2) return 'high';
  if (val > 0.1) return 'medium';
  return 'low';
}

function psiBarWidth(val) {
  return Math.min(100, (val / 0.5) * 100).toFixed(1) + '%';
}

/* ══════════════════════════════════════════════════════════════════
   AURA Risk Intelligence Agent Engine
   ══════════════════════════════════════════════════════════════════ */

const AURA_RISK_INTELLIGENCE_AGENT = {
  version: '1.0.0',
  description: 'Evidence-Grounded Risk Intelligence and Safe Orchestration Layer',

  /**
   * Quantitative Model Health Score (0 - 100)
   * Signals: Champion AUC (35 pts), Max PSI penalty (45 pts), Lineage & Gate stability (20 pts).
   */
  calculateModelHealth(driftFeatures = PSI_FEATURES, championAUC = AURA_CONFIG.champion_auc, challengerStatus = 'STABLE') {
    if (!driftFeatures || !Array.isArray(driftFeatures) || driftFeatures.length === 0) {
      return {
        score: null,
        status: 'UNKNOWN',
        requires_human_review: true,
        reason: 'Missing monitoring data to compute Model Health.'
      };
    }

    // 1. AUC component (max 35 pts)
    const effectiveAUC = typeof championAUC === 'number' ? championAUC : 0.7352;
    const aucScore = Math.min(35, (effectiveAUC / 0.75) * 35);

    // 2. PSI Drift Penalty component (max 45 pts)
    const maxPSI = Math.max(...driftFeatures.map(f => typeof f.psi === 'number' ? f.psi : (typeof f.psi_score === 'number' ? f.psi_score : 0)));
    let psiScore = 45;
    let driftSeverity = 'LOW';
    if (maxPSI > 1.0) {
      psiScore = 0;
      driftSeverity = 'CRITICAL';
    } else if (maxPSI > 0.20) {
      psiScore = 12;
      driftSeverity = 'HIGH';
    } else if (maxPSI > 0.10) {
      psiScore = 30;
      driftSeverity = 'MEDIUM';
    }

    // 3. Lineage Stability & Gate Health (max 20 pts)
    let stabilityScore = 20;
    if (maxPSI > 1.0) {
      stabilityScore = 10;
    } else if (challengerStatus === 'REJECTED_EARLY') {
      stabilityScore = 15;
    } else if (challengerStatus === 'EVALUATION_FAILED') {
      stabilityScore = 5;
    }

    const totalScore = Math.max(0, Math.min(100, Math.round(aucScore + psiScore + stabilityScore)));

    let status = 'HEALTHY';
    let recommendation = 'CONTINUE_MONITORING';
    if (totalScore < 50 || maxPSI > 0.50) {
      status = 'DEGRADED / CRITICAL DRIFT';
      recommendation = 'TRIGGER_CHALLENGER_RETRAINING';
    } else if (totalScore < 75 || maxPSI > 0.10) {
      status = 'MONITORING / ELEVATED';
      recommendation = 'INCREASE_MONITORING_FREQUENCY';
    }

    return {
      score: totalScore,
      status,
      current_model: 'XGBoost Champion (Production)',
      model_version: 'v12',
      auc: effectiveAUC,
      max_psi: parseFloat(maxPSI.toFixed(4)),
      drift_severity: driftSeverity,
      recommendation,
      requires_human_review: false,
      breakdown: {
        auc_points: parseFloat(aucScore.toFixed(1)),
        psi_points: psiScore,
        stability_points: stabilityScore
      }
    };
  },

  /**
   * Evaluates drift status across features and produces structured observation, evidence, reasoning, and recommendation.
   */
  evaluateDriftAndRecommend(features = PSI_FEATURES) {
    if (!features || !Array.isArray(features) || features.length === 0) {
      return {
        status: 'ESCALATE',
        severity: 'UNKNOWN',
        affected_features: [],
        evidence: {},
        recommended_action: 'HUMAN_REVIEW_REQUIRED',
        requires_human_review: true,
        observation: 'Monitoring telemetry unavailable or corrupt.',
        reasoning: 'Cannot evaluate distribution drift without feature PSI signals.'
      };
    }

    const criticalFeatures = [];
    const moderateFeatures = [];
    const stableFeatures = [];
    const evidence = {};

    features.forEach(f => {
      const name = f.name || f.feature;
      const score = typeof f.psi === 'number' ? f.psi : (typeof f.psi_score === 'number' ? f.psi_score : 0);
      evidence[name] = parseFloat(score.toFixed(4));

      if (score > 0.20) {
        criticalFeatures.push({ name, psi: score, training_mean: f.training_mean, production_mean: f.production_mean });
      } else if (score > 0.10) {
        moderateFeatures.push({ name, psi: score });
      } else {
        stableFeatures.push({ name, psi: score });
      }
    });

    if (criticalFeatures.length > 0) {
      const sortedCritical = [...criticalFeatures].sort((a, b) => b.psi - a.psi);
      const topDrift = sortedCritical[0];

      return {
        status: 'RETRAIN',
        severity: 'CRITICAL',
        affected_features: criticalFeatures.map(c => c.name),
        top_drifted_feature: topDrift.name,
        top_drift_psi: topDrift.psi,
        recommended_action: 'TRIGGER_CHALLENGER',
        evidence,
        requires_human_review: false,
        observation: `${criticalFeatures.length} monitored feature(s) exceeded the critical PSI drift threshold (0.20).`,
        reasoning: `Significant population shift observed in production traffic. The largest shift occurred in '${topDrift.name}' with PSI = ${topDrift.psi.toFixed(4)} (Threshold: 0.20). Production default probabilities are at risk of misalignment.`,
        action_plan: 'Trigger autonomous Challenger pipeline on combined Home Credit + shifted production batch, then evaluate against Champion via deterministic gate (Δ AUC >= 0.004).'
      };
    } else if (moderateFeatures.length > 0) {
      return {
        status: 'MONITOR',
        severity: 'MODERATE',
        affected_features: moderateFeatures.map(m => m.name),
        recommended_action: 'INCREASE_MONITORING',
        evidence,
        requires_human_review: false,
        observation: `Moderate drift detected in ${moderateFeatures.length} feature(s) (PSI between 0.10 and 0.20).`,
        reasoning: `Feature distributions are exhibiting early variation (${moderateFeatures.map(m => m.name).join(', ')}), but have not breached the critical 0.20 retraining threshold.`,
        action_plan: 'Increase PSI telemetry sampling frequency. No retraining required at this time.'
      };
    } else {
      return {
        status: 'STABLE',
        severity: 'LOW',
        affected_features: [],
        recommended_action: 'CONTINUE_MONITORING',
        evidence,
        requires_human_review: false,
        observation: 'All monitored feature distributions remain stable (PSI < 0.10).',
        reasoning: 'Production borrower profile distribution closely matches training baseline. Model accuracy is nominal.',
        action_plan: 'Continue standard scheduled drift surveillance.'
      };
    }
  },

  /**
   * Deterministic Champion vs Challenger Promotion Gate.
   * Enforces mathematical condition: Challenger AUC - Champion AUC >= threshold (0.004).
   * The Agent cannot bypass or override this rule.
   */
  evaluatePromotionGate(championAUC, challengerAUC, threshold = AURA_CONFIG.promotion_threshold) {
    if (typeof championAUC !== 'number' || typeof challengerAUC !== 'number' || isNaN(championAUC) || isNaN(challengerAUC)) {
      return {
        passed: false,
        status: 'ESCALATE',
        decision: 'HUMAN_REVIEW_REQUIRED',
        requires_human_review: true,
        reason: 'Missing or corrupted model evaluation metrics. Promotion gate cannot execute.'
      };
    }

    const delta = challengerAUC - championAUC;
    const passed = delta >= threshold;

    if (passed) {
      return {
        passed: true,
        status: 'PROMOTE',
        decision: 'PROMOTE_CHALLENGER',
        agent_recommendation: 'RECOMMEND_PROMOTION',
        system_decision: 'DETERMINISTIC_GATE_PASSED',
        champion_auc: championAUC,
        challenger_auc: challengerAUC,
        auc_delta: parseFloat(delta.toFixed(4)),
        required_threshold: threshold,
        requires_human_review: false,
        reason: `Challenger AUC (${challengerAUC.toFixed(4)}) exceeds Champion AUC (${championAUC.toFixed(4)}) by +${delta.toFixed(4)}, which meets or exceeds the required safety threshold of ${threshold.toFixed(4)}.`,
        action_taken: 'Challenger promoted to Production alias in Unity Catalog. Previous Champion archived.'
      };
    } else {
      return {
        passed: false,
        status: 'REJECT',
        decision: 'KEEP_CHAMPION',
        agent_recommendation: 'RECOMMEND_RETAINING_CHAMPION',
        system_decision: 'DETERMINISTIC_GATE_FAILED',
        champion_auc: championAUC,
        challenger_auc: challengerAUC,
        auc_delta: parseFloat(delta.toFixed(4)),
        required_threshold: threshold,
        requires_human_review: false,
        reason: `Challenger AUC (${challengerAUC.toFixed(4)}) failed to beat Champion AUC (${championAUC.toFixed(4)}) by the required threshold of ${threshold.toFixed(4)} (Delta: ${delta >= 0 ? '+' : ''}${delta.toFixed(4)}).`,
        action_taken: 'Challenger rejected from production promotion. Production Champion retained.'
      };
    }
  },

  /**
   * Decomposes applicant features into evidence-based risk drivers.
   */
  explainApplicantRisk(features, probability, approved) {
    if (!features) return { risk_factors: [], summary: 'No applicant feature data available.' };

    const factors = [];

    const cir = features.credit_income_ratio || 0;
    if (cir > 8.0) {
      factors.push({ name: 'Credit-to-Income Ratio', value: cir.toFixed(2), impact: 'HIGH_RISK', weight: 32, note: 'Extreme credit exposure relative to declared income (CIR > 8.0).' });
    } else if (cir > 5.0) {
      factors.push({ name: 'Credit-to-Income Ratio', value: cir.toFixed(2), impact: 'MODERATE_RISK', weight: 18, note: 'Elevated credit-to-income ratio (CIR > 5.0).' });
    } else {
      factors.push({ name: 'Credit-to-Income Ratio', value: cir.toFixed(2), impact: 'LOW_RISK', weight: -15, note: 'Healthy credit-to-income ratio within prudent bounds.' });
    }

    const emp = features.employment_years || 0;
    if (emp < 2.0) {
      factors.push({ name: 'Employment Tenure', value: `${emp.toFixed(1)} yrs`, impact: 'HIGH_RISK', weight: 24, note: 'Short employment history (< 2 years) increases repayment volatility.' });
    } else if (emp < 4.0) {
      factors.push({ name: 'Employment Tenure', value: `${emp.toFixed(1)} yrs`, impact: 'MODERATE_RISK', weight: 10, note: 'Moderate employment stability.' });
    } else {
      factors.push({ name: 'Employment Tenure', value: `${emp.toFixed(1)} yrs`, impact: 'LOW_RISK', weight: -18, note: 'Strong job tenure (> 4 years) supporting income stability.' });
    }

    const extMean = features.ext_mean || 0.5;
    if (extMean < 0.55) {
      factors.push({ name: 'External Credit Bureau Scores (Mean)', value: extMean.toFixed(4), impact: 'HIGH_RISK', weight: 22, note: 'Sub-prime composite external bureau rating across reporting agencies.' });
    } else if (extMean > 0.65) {
      factors.push({ name: 'External Credit Bureau Scores (Mean)', value: extMean.toFixed(4), impact: 'LOW_RISK', weight: -20, note: 'Strong composite external bureau rating.' });
    }

    const cpy = features.credit_per_year || 0;
    if (cpy > 2.5) {
      factors.push({ name: 'Credit Exposure Per Year', value: cpy.toFixed(2), impact: 'HIGH_RISK', weight: 14, note: 'Disproportionate annual debt acceleration.' });
    }

    const probPct = (probability * 100).toFixed(1);
    const summary = approved
      ? `Applicant profile cleared underwriting with ${probPct}% default probability. Key approval strengths: favorable credit-income ratio (${cir.toFixed(2)}) and solid employment tenure (${emp.toFixed(1)} yrs).`
      : `Applicant profile flagged as elevated risk (${probPct}% default probability). Primary rejection drivers: credit-income ratio of ${cir.toFixed(2)} and employment tenure of ${emp.toFixed(1)} yrs.`;

    return {
      probability: probPct,
      approved,
      risk_factors: factors,
      summary
    };
  },

  /**
   * Evidence-Grounded Q&A Engine answering queries strictly from real system metrics.
   */
  answerAgentQuery(query, liveState = {}) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return 'Please specify a question regarding AURA risk telemetry, drift metrics, or model governance.';

    const drift = liveState.drift || PSI_FEATURES;
    const health = this.calculateModelHealth(drift);
    const driftEval = this.evaluateDriftAndRecommend(drift);

    if (q.includes('why') && (q.includes('retrain') || q.includes('retrained') || q.includes('trigger'))) {
      const topDrift = driftEval.top_drifted_feature || 'credit_income_ratio';
      const topPSI = driftEval.top_drift_psi || 2.7008;
      const criticalCount = driftEval.affected_features.length || 3;

      return `AURA triggered Challenger retraining because ${criticalCount} monitored features exceeded the 0.20 PSI critical drift threshold. The largest distribution shift occurred in '${topDrift}' with a PSI of ${topPSI} (Threshold: 0.20), followed by employment_years (1.3962) and income (0.7726). The Risk Intelligence Agent observed this degradation and recommended training an updated Challenger.`;
    }

    if (q.includes('highest drift') || q.includes('most drifted') || q.includes('top drift')) {
      return `The feature with the highest distribution drift is 'credit_income_ratio' with a Population Stability Index (PSI) of 2.7008, followed by 'employment_years' (PSI: 1.3962) and 'income' (PSI: 0.7726).`;
    }

    if (q.includes('health') || q.includes('model health')) {
      return `Current Model Health Score is ${health.score} / 100 (${health.status}). Active production model: XGBoost Champion v12 with AUC 0.7352 and 72.1% accuracy. Max feature PSI: ${health.max_psi}. Recommendation: ${health.recommendation}.`;
    }

    if (q.includes('rejected') || q.includes('v10') || (q.includes('challenger') && q.includes('fail')) || (q.includes('candidate') && q.includes('fail'))) {
      return `The early Challenger candidate (v10) achieved an AUC of 0.5087 while the Champion stood at 0.7278 (Δ: -0.2191). Because it failed to beat the Champion by the configured threshold of +0.004, the deterministic promotion gate REJECTED it and safely retained the Champion.`;
    }

    if (q.includes('promot') || (q.includes('challenger') && (q.includes('win') || q.includes('v11')))) {
      return `The Random Forest Challenger (v11) was PROMOTED to production after achieving an AUC of 0.7327 against Champion AUC 0.7278 (v6). The improvement of +0.0049 exceeded the configured +0.004 threshold, satisfying the deterministic safety gate.`;
    }

    if (q.includes('what changed') || q.includes('production data') || q.includes('data shift')) {
      return `Production borrower traffic showed significant shifts from training baselines: credit_income_ratio increased from mean 7.14 to 12.30 (PSI 2.7008), employment tenure dropped from mean 6.20 to 3.40 years (PSI 1.3962), and income mean shifted to ₹1.24L (PSI 0.7726).`;
    }

    if (q.includes('applicant') || q.includes('risk factors') || q.includes('loan')) {
      return `Loan assessments are scored by our 11-feature model. Key risk drivers evaluated include Credit-to-Income Ratio (threshold <= 5.0), Employment Tenure (benchmark >= 2.0 yrs), Composite Bureau Scores (ext_mean >= 0.55), and Credit-per-Year commitment.`;
    }

    return `Telemetry analysis for query: "${query}". Current Production Champion: XGBoost (AUC 0.7352), Health Score: ${health.score}/100. Monitored features: 11. To inspect specific telemetry, ask about drift, retraining causes, Challenger promotion, or model health.`;
  },

  /**
   * Generates a formal, auditable Risk Intelligence Report.
   */
  generateRiskReport(liveState = {}) {
    const now = new Date().toISOString();
    const drift = liveState.drift || PSI_FEATURES;
    const health = this.calculateModelHealth(drift);
    const driftEval = this.evaluateDriftAndRecommend(drift);
    const gateEval = this.evaluatePromotionGate(0.7278, 0.7327, 0.004);

    return {
      report_id: `AURA-RISK-REP-${Date.now()}`,
      generated_at: now,
      environment: 'Production / Unity Catalog',
      active_model: {
        name: 'XGBoost Champion (Production)',
        version: 'v12',
        auc: 0.7352,
        accuracy: 0.7210,
        f1_score: 0.2635,
        dataset_records: 297664,
        features_count: 11
      },
      model_health: health,
      drift_surveillance: {
        status: driftEval.status,
        severity: driftEval.severity,
        monitored_features: drift.length,
        critical_drift_features: driftEval.affected_features,
        psi_telemetry: driftEval.evidence
      },
      agent_reasoning: {
        observation: driftEval.observation,
        evidence: driftEval.evidence,
        reasoning: driftEval.reasoning,
        recommendation: driftEval.recommended_action
      },
      deterministic_governance: {
        gate_threshold: 0.004,
        last_evaluation: {
          champion_auc: 0.7278,
          challenger_auc: 0.7327,
          delta: 0.0049,
          gate_passed: true,
          agent_recommendation: gateEval.agent_recommendation,
          system_decision: gateEval.system_decision,
          final_action: 'CHALLENGER_PROMOTED_TO_PRODUCTION'
        }
      }
    };
  }
};

async function API_getModelHealth(payload = {}) {
  await mockDelay(300);
  return AURA_RISK_INTELLIGENCE_AGENT.calculateModelHealth(payload.driftFeatures, payload.championAUC, payload.challengerStatus);
}

async function API_evaluateAgentDrift(payload = {}) {
  await mockDelay(500);
  return AURA_RISK_INTELLIGENCE_AGENT.evaluateDriftAndRecommend(payload.features || PSI_FEATURES);
}

async function API_askAURA(payload) {
  await mockDelay(600);
  const query = typeof payload === 'string' ? payload : (payload.query || '');
  return {
    query,
    answer: AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery(query, payload.liveState || {}),
    timestamp: new Date().toISOString()
  };
}

async function API_generateRiskReport(payload = {}) {
  await mockDelay(800);
  return AURA_RISK_INTELLIGENCE_AGENT.generateRiskReport(payload.liveState || {});
}

async function API_explainApplicantRisk(payload) {
  await mockDelay(300);
  return AURA_RISK_INTELLIGENCE_AGENT.explainApplicantRisk(payload.features, payload.probability, payload.approved);
}

async function API_simulateDrift() {
  await mockDelay(900);
  // Returns simulated high-drift data matching the documented project results
  return [
    { name: 'credit_income_ratio', psi: 2.7008, severity: 'high', training_mean: 7.14, production_mean: 12.30, action: 'Retrain triggered' },
    { name: 'employment_years', psi: 1.3962, severity: 'high', training_mean: 6.20, production_mean: 3.40, action: 'Retrain triggered' },
    { name: 'income', psi: 0.7726, severity: 'high', training_mean: 168797, production_mean: 124312, action: 'Retrain triggered' },
    { name: 'age_years', psi: 0.1223, severity: 'medium', training_mean: 43.10, production_mean: 39.40, action: 'Increase monitoring' },
    { name: 'debt_service_ratio', psi: 0.0941, severity: 'low', training_mean: 0.21, production_mean: 0.22, action: 'Stable' },
  ];
}



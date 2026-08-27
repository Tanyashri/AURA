# AURA — Autonomous Credit Risk AI

**Build at the Bleeding Edge of AI**

AURA is a sophisticated autonomous credit assessment platform that combines machine learning, regulatory transparency, and real-time monitoring. It delivers self-healing underwriting with an 11-feature Random Forest model, PSI drift detection, and an LLM hallucination firewall—built on Databricks, MLflow, and Unity Catalog.

## 🎯 What AURA Does

AURA automates and demystifies credit risk assessment through:

- **Algorithmic Assessment Engine**: Credit evaluation using production-grade XGBoost & Random Forest models (11 engineered features, 0.7352 Champion AUC, 72.1% accuracy)
- **AURA Risk Intelligence Agent**: Evidence-grounded observation, distribution analysis, and safe orchestration layer
- **Autonomous Drift Detection**: Monitors feature distributions via Population Stability Index (PSI) analysis
- **Deterministic Champion/Challenger Gate**: Evaluates candidate models against strict mathematical promotion threshold ($\Delta \text{AUC} \ge 0.004$)
- **LLM Hallucination Firewall & ACTR Framework**: 4-stage cross-truth reasoning ensuring compliance and zero hallucinations
- **Unity Catalog & Delta Lake Governance**: Complete audit logs separating Agent Recommendations from System Decisions

**Documented Production Stats:**
- 307,511 raw applications · 297,664 cleaned records
- 0.6166 Baseline Random Forest AUC
- 0.7278 Improved Random Forest Champion (v6) AUC
- 0.5087 Early Challenger candidate (v10) $\rightarrow$ Safely **REJECTED** by deterministic gate ($\Delta -0.2191 < 0.004$)
- 0.7327 Challenger (v11) $\rightarrow$ **PROMOTED** to production ($\Delta +0.0049 \ge 0.004$)
- 0.7352 Final XGBoost Champion (v12) AUC · 72.1% Accuracy · 0.2635 F1
- 3 Critical drift features detected & monitored: `credit_income_ratio` (PSI 2.7008), `employment_years` (PSI 1.3962), `income` (PSI 0.7726)

## 🏛️ Architecture: 3 Clear Layers of Responsibility

```
                                PRODUCTION DATA
                                      ↓
                               EXISTING PIPELINE
                                      ↓
                              FEATURE ENGINEERING
                                      ↓
                            CREDIT RISK ML MODEL (XGBoost)
                                      ↓
                                 PREDICTIONS
                                      ↓
                              PSI DRIFT MONITOR
                                      ↓
                         ┌─────────────────────────┐
                         │ AURA RISK INTELLIGENCE  │
                         │         AGENT           │
                         │                         │
                         │ • Observe               │
                         │ • Analyze               │
                         │ • Explain               │
                         │ • Recommend             │
                         │ • Orchestrate           │
                         └────────────┬────────────┘
                                      ↓
                             EXISTING RETRAINING
                                      ↓
                                 CHALLENGER
                                      ↓
                           CHAMPION vs CHALLENGER
                                      ↓
                           DETERMINISTIC GATE (0.004)
                                  /        \
                             PROMOTE      REJECT
                                ↓            ↓
                           NEW CHAMPION  KEEP CHAMPION
                                \            /
                                 ↓          ↓
                              MLflow + Unity Catalog
                                      ↓
                                 AUDIT TRAIL
                                      ↓
                                 EXISTING UI
```

### Layer Separation
1. **ML Layer**: Predicts credit risk default probabilities using the trained model and 11 engineered features.
2. **Agent Layer**: Observes live signals, analyzes distribution drift, evaluates quantitative Model Health ($0-100$), produces structured recommendations, and orchestrates workflows.
3. **Safety Layer**: The deterministic Champion/Challenger evaluation gate ($\text{Challenger AUC} - \text{Champion AUC} \ge 0.004$) is the sole authority for model promotion. The Agent **never** bypasses or overrides this gate.

## 🚀 Key Features

### 1. **Assessment Engine**
- 11-feature model with real-time probability scoring
- Auto-computed derived features (CIR, credit-per-year, ext_mean, income-age ratio)
- Expandable **Why this prediction?** risk factor attribution breakdown
- ACTR Grounded safe explanations with regulatory cross-referencing

### 2. **AURA Risk Intelligence Agent**
- **Structured States**: `STABLE`, `MONITOR`, `RETRAIN`, `PROMOTE`, `REJECT`, `ESCALATE` (`HUMAN_REVIEW_REQUIRED`).
- **Model Health Scoring ($0–100$)**: Measurable formula based on active AUC (35 pts), max PSI drift penalty (45 pts), and lineage/gate stability (20 pts).
- **"Why Did AURA Take This Action?"**: Live telemetry evidence breakdown.
- **"Ask AURA"**: Evidence-grounded Q&A engine based strictly on Delta Lake and Unity Catalog telemetry.
- **Simulate Drift [DEMO]**: Interactive simulation demonstrating end-to-end drift detection $\rightarrow$ agent analysis $\rightarrow$ retraining $\rightarrow$ deterministic gate evaluation $\rightarrow$ promotion.
- **Governance Risk Reports**: Auditable reports distinguishing Agent Recommendations from System Decisions.

### 3. **Drift Detection Engine**
- **Population Stability Index (PSI)** analysis across 5 key features:
  - `credit_income_ratio`: PSI 2.7008 (Critical)
  - `employment_years`: PSI 1.3962 (Critical)
  - `income`: PSI 0.7726 (Critical)
  - `age_years`: PSI 0.1223 (Moderate / Increased Monitoring)
  - `debt_service_ratio`: PSI 0.0941 (Stable)
- Automatic retraining trigger at PSI > 0.20

### 4. **ACTR — AI Cross-Truth Reasoning Framework**
- 4-stage pipeline for statutory citation auditing and hallucination prevention.
- Cross-references claims against RBI Guidelines Database, SEBI Regulatory Rules, and compliance constraints.


## 🔧 Configuration

Edit `data.js` to customize:

```javascript
const AURA_CONFIG = {
  champion_uri: 'models:/workspace.default.aura_credit_champion@champion',
  challenger_uri: 'models:/workspace.default.aura_credit_challenger@challenger',
  gold_tables: {
    drift_metrics: 'gold.drift_metrics',
    model_comparison: 'gold.model_comparison',
    retraining_log: 'gold.retraining_log',
    llm_evaluation: 'gold.llm_evaluation_metrics',
  },
  champion_auc: 0.7210,
  challenger_auc: 0.7540,
  feature_count: 11,
};
```

### Demo Profiles
- **high_risk**: Probability 0.424 (42.4%), rejected
- **low_risk**: Probability 0.058 (5.8%), approved

Modify under `DEMO_PROFILES` to test different scenarios.

## 📡 API Integration

AURA exposes mock API stubs ready for Databricks integration:

```javascript
// Score a loan application
await API_scoreLoan({
  income: 1.5,
  age: 34,
  credit: 5.0,
  employment_years: 5,
  ext_source_2: 0.65,
  ext_source_3: 0.70
});

// Run PSI drift analysis
await API_runPSI();

// Evaluate explanation for hallucinations
await API_evaluateExplanation({ text: "..." });

// Promote challenger to production
await API_promoteChallenger();
```

**Backend Integration**: Connect `data.js` API functions to real Databricks endpoints for production deployment.

## 🎨 Design Highlights

- **Glassmorphism UI** with blur effects and micro-interactions
- **Particle Animation System** with mouse-following dynamics
- **Responsive Grid Layouts** for KPI cards and widget grids
- **Smooth Scroll Navigation** with Intersection Observer
- **Dark Mode** optimized for long monitoring sessions
- **Custom Cursor** with hover state feedback

## 📚 Documentation

- **Assessment Engine**: Run demo presets or enter manual data. Model explains each decision.
- **System Dashboard**: Real-time KPIs and widget performance monitoring
- **Architecture Section**: Visual representation of the Bronze-Silver-Gold pipeline
- **LLM Court**: Evaluate explanation quality and detect regulatory hallucinations

## 🤝 Contributing

We welcome contributions! To get involved:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test thoroughly in the browser
5. Submit a pull request

**Focus areas:**
- Backend integration with Databricks/MLflow
- Additional feature engineering
- Enhanced explainability visualizations
- Performance optimization

## 📄 License

This project is licensed under the MIT License — see `LICENSE` file for details.

## 🔗 Resources

- **Databricks Documentation**: [databricks.com/docs](https://databricks.com/docs)
- **MLflow**: [mlflow.org](https://mlflow.org)
- **Unity Catalog**: [docs.databricks.com/unity-catalog](https://docs.databricks.com/unity-catalog)
- **RBI Regulations**: [rbi.org.in](https://www.rbi.org.in)
- **SEBI Regulations**: [sebi.gov.in](https://www.sebi.gov.in)

## ⚙️ Support & Troubleshooting

**Issue: Model not scoring applications?**
- Ensure `data.js` API functions are connected to real Databricks endpoints
- Check browser console for JavaScript errors
- Verify all 11 features are properly calculated

**Issue: Drift detection not triggering?**
- PSI threshold is > 0.2 for critical drift
- Ensure `gold.drift_metrics` table exists in Databricks
- Review PSI calculation in `DRIFT_DATA`

**Issue: Hallucinations not detected?**
- Verify regulatory citations match patterns in `detectHallucinations()`
- Update `VALID_REGULATIONS` with your organization's approved regulations
- Check `gold.llm_evaluation_metrics` table for grounding scores

## 🎯 Next Steps

1. **Deploy to Databricks**: Connect frontend to real MLflow serving endpoints
2. **Scale the Pipeline**: Automate Bronze-Silver-Gold ingestion
3. **Add Monitoring**: Set up alerts for PSI > 0.2 and hallucination thresholds
4. **Extend Features**: Engineer additional features based on domain expertise
5. **Fine-tune Model**: Retrain with challenger framework and promote winners

---

**Built with ❤️ at the Bleeding Edge of AI**

*AURA: Self-healing credit intelligence. Regulatory transparency. Autonomous MLOps.*

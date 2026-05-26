# AURA — Autonomous Credit Risk AI

**Build at the Bleeding Edge of AI**

AURA is a sophisticated autonomous credit assessment platform that combines machine learning, regulatory transparency, and real-time monitoring. It delivers self-healing underwriting with an 11-feature Random Forest model, PSI drift detection, and an LLM hallucination firewall—built on Databricks, MLflow, and Unity Catalog.

## 🎯 What AURA Does

AURA automates and demystifies credit risk assessment through:

- **Algorithmic Assessment Engine**: One-click credit evaluation using a production-grade Random Forest model (11 engineered features, 0.754 AUC)
- **Autonomous Drift Detection**: Monitors feature distributions in real time via Population Stability Index (PSI) analysis
- **Champion/Challenger Framework**: Automatically validates and promotes improved models to production
- **LLM Hallucination Firewall**: Detects and blocks regulatory false citations in explanations, ensuring compliance
- **Regulatory Transparency**: Every decision traces back to RBI/SEBI regulations with factual grounding scores

**Production Stats:**
- 297K+ applications processed
- 0.754 AUC (Champion model)
- 11 engineered features  
- 2 critical drift features detected & auto-retrained

## 🚀 Why AURA Matters

### For Lenders
- **Faster Approvals**: Real-time assessment in seconds
- **Regulatory Compliance**: Every decision cites RBI/SEBI guidelines with hallucination filtering
- **Risk Transparency**: Understand exactly why each applicant was approved or rejected
- **Self-Healing**: Automatically detects model drift and retrains without manual intervention

### For Developers
- **End-to-End MLOps**: Bronze → Silver → Gold data pipeline with Unity Catalog governance
- **Explainability**: Feature-level risk analysis + RAG-based explanations
- **Monitoring**: Live dashboards for model performance, drift, and hallucination metrics
- **Production-Ready**: Built on industry-standard Databricks/MLflow infrastructure

## ⚡ Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MS-Shamanth/Project_Aura.git
   cd Project_Aura
   ```

2. **Open in browser:**
   - Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
   - No build tools or external dependencies required—it's a static site with vanilla JavaScript

3. **Explore the demo:**
   - Navigate to the **Assessment Engine** section
   - Click "Load High Risk Customer" or "Load Low Risk Customer" preset
   - Manually enter applicant details (income, age, credit-income ratio, etc.) to test the model
   - View real-time drift metrics and model comparison in the **System Dashboard**
   - Review hallucination detection in the **LLM Court** section

### Quick Usage

#### Run a Credit Assessment
```javascript
// In browser console or embedded in your form
assessLoan();  // Scores the applicant with 11-feature model
```

#### Load Demo Profiles
- **High Risk**: 42.4% default probability → REJECTED
- **Low Risk**: 5.8% default probability → APPROVED

#### Check Real-Time Metrics
- **Active Model**: aura_credit_champion (Production)
- **Champion AUC**: 0.7210  
- **Challenger AUC**: 0.7540 (better, queued for promotion)
- **Drifted Features**: 2 critical (income, credit_income_ratio)

## 📊 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     AURA MLOps Pipeline                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Raw Data  →  Bronze  →  Silver  →  Gold  →  MLflow  →  Serving │
│  (Raw)      (ingested) (cleaned) (ML-ready) (tracking) (API)    │
│                                                                   │
│  ↓ Unity Catalog Governance (Data Lineage + Access Control)      │
│  ↓ PSI Drift Detection (gold.drift_metrics)                      │
│  ↓ Retraining Ledger (gold.retraining_log)                       │
│  ↓ LLM Evaluation Metrics (gold.llm_evaluation_metrics)          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Core Components

**Frontend (Static Web App)**
- `index.html` — Three-section landing page: Assessment, Dashboard, Architecture
- `script.js` — Interactive logic for scoring, drift visualization, hallucination evaluation
- `style.css` — Glassmorphism design with particle effects and smooth animations
- `data.js` — Mock data + API client stubs for Databricks integration

**Feature Engineering (11 Engineered Features)**
1. `income` — Scaled annual income
2. `age_years` — Applicant age
3. `credit_income_ratio` — Credit limit ÷ income
4. `employment_years` — Job tenure
5. `ext_source_1`, `ext_source_2`, `ext_source_3` — Bureau scores (external)
6. `ext_mean` — Average of external sources
7. `ext_min` — Minimum of external sources
8. `income_age_ratio` — Income normalized by age
9. `credit_per_year` — Credit per year of employment

**Model Configuration**
- **Champion**: `aura_credit_champion` (AUC: 0.7210, Production)
- **Challenger**: `aura_credit_challenger` (AUC: 0.7540, Staging)
- **Trigger**: Automatic promotion when Challenger AUC > Champion + threshold

## 📈 Key Features

### 1. **Assessment Engine**
- 11-feature Random Forest model
- Real-time probability scoring
- Auto-computed derived features
- Applicant-level explanations with regulatory citations

### 2. **System Dashboard**
- **Live KPIs**: Active model, AUC, drifted features, hallucinations blocked
- **Drift Widget**: PSI scores for each feature with severity indicators
- **Retraining Ledger**: Autonomous retrain triggers and decisions
- **Hallucination Firewall**: Tracks blocked explanations with invalid citations

### 3. **Drift Detection Engine**
- **Population Stability Index (PSI)** analysis
- Automatic trigger at PSI > 0.2
- Critical/Medium/Low severity flagging
- Historical tracking and trend analysis

### 4. **LLM Hallucination Firewall**
- Extracts regulatory citations from explanations
- Validates against `rbi_regulations` and `sebi_regulations` tables
- Blocks false citations (hallucinations)
- Returns grounding & hallucination scores

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

## 👥 Team

- **Shreyank** — Model development & MLOps
- **Shamanth** — Frontend architecture & UI/UX
- **Tanya** — Regulatory compliance & hallucination detection
- **Yashas** — Data pipeline & drift monitoring

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

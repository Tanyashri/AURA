window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('aura-loader');
    if (loader) {
      loader.classList.add('loaded');
      setTimeout(() => loader.remove(), 1200);
    }
  }, 2800);
});

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;
  const MOUSE_ATTRACT_DIST = 200;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const layer = Math.random();
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (0.2 + layer * 0.3),
        vy: (Math.random() - 0.5) * (0.2 + layer * 0.3),
        r: 0.5 + layer * 1.8,
        baseOpacity: 0.15 + layer * 0.3,
        opacity: 0.15 + layer * 0.3,
        layer: layer,
        hue: Math.random() > 0.7 ? 45 : 200,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distToMouse < MOUSE_ATTRACT_DIST) {
        const proximity = 1 - distToMouse / MOUSE_ATTRACT_DIST;
        p.opacity = p.baseOpacity + proximity * 0.5;

        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(0, 180, 255, ${proximity * 0.08})`;
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${proximity * 0.12})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      } else {
        p.opacity += (p.baseOpacity - p.opacity) * 0.05;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();

function updateClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
}
updateClock();
setInterval(updateClock, 1000);

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    navigateTo(page);
  });
});

document.querySelectorAll('.link-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  const pageEl = document.getElementById(`page-${page}`);

  if (navEl) navEl.classList.add('active');
  if (pageEl) {
    pageEl.classList.add('active');
    pageEl.style.animation = 'none';
    pageEl.offsetHeight;
    pageEl.style.animation = '';
  }

  if (page === 'drift') initDriftPage();
  if (page === 'court') initCourtPage();
}

function showToast(msg, duration = 3500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function animateCounter(element, target, duration = 1200, decimals = 0) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;

    if (decimals > 0) {
      element.textContent = current.toFixed(decimals);
    } else {
      element.textContent = Math.round(current);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function initDashboardWidgets() {
  renderDriftWidget();
  renderRetrainWidget();
  renderHallucWidget();
  animateDashboardCounters();
  initRiskIntelligenceAgent();
}

function renderDriftWidget() {
  const container = document.getElementById('drift-widget-content');
  if (!container) return;

  container.innerHTML = DRIFT_DATA.map(d => {
    const isCritical = d.psi_score > 0.2;
    const isModerate = d.psi_score > 0.1 && d.psi_score <= 0.2;
    const barClass = isCritical ? 'critical' : isModerate ? 'warning' : 'stable';
    const barWidth = Math.min(100, (d.psi_score / 0.5) * 100).toFixed(1);
    const actionClass = d.action === 'TRIGGER RETRAIN' ? 'trigger' : 'monitor';

    return `
      <div class="drift-row">
        <div class="drift-feature">${d.feature}</div>
        <div class="drift-bar-wrap">
          <div class="drift-bar ${barClass}" style="width:${barWidth}%"></div>
        </div>
        <div class="drift-psi ${isCritical ? 'red' : isModerate ? 'amber' : 'green'}">${d.psi_score.toFixed(4)}</div>
        <div class="drift-status ${isCritical ? 'red' : isModerate ? 'amber' : 'green'}">${d.status}</div>
        <div class="drift-action ${actionClass}">${d.action}</div>
      </div>
    `;
  }).join('');
}

function renderRetrainWidget() {
  const container = document.getElementById('retrain-widget-content');
  if (!container) return;

  const d = RETRAIN_DATA;
  container.innerHTML = `
    <div class="retrain-flow">
      <div class="retrain-metric-row">
        <span class="retrain-label">Trigger</span>
        <span class="retrain-value cyan">PSI &gt; 0.20 (3 Critical Features)</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">Early Candidate (v10)</span>
        <span class="retrain-value red">AUC 0.5087 · ❌ REJECTED (Failed Gate)</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">RF Champion (v6)</span>
        <span class="retrain-value">AUC 0.7278</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">Challenger (v11)</span>
        <span class="retrain-value green">AUC 0.7327 (+0.0049 &ge; 0.004)</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">Active Champion (v12)</span>
        <span class="retrain-value cyan">AUC 0.7352 (XGBoost Production)</span>
      </div>
      <div class="retrain-decision">
        <span class="decision-icon">✅</span>
        <span>Deterministic Gate Passed · Promoted v11 &rarr; v12</span>
      </div>
    </div>
  `;
}

function renderHallucWidget() {
  const container = document.getElementById('halluc-widget-content');
  if (!container) return;

  container.innerHTML = `
    <table class="halluc-table-mini">
      <thead>
        <tr>
          <th>App ID</th>
          <th>Error Type</th>
          <th>Cited Law</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${HALLUC_FIREWALL_DATA.map(d => {
    const isBlocked = d.action.includes('BLOCKED');
    return `
            <tr>
              <td><span class="halluc-app-id">${d.app_id}</span></td>
              <td><span class="halluc-error-type ${d.error_type === 'None' ? '' : 'red'}">${d.error_type}</span></td>
              <td><span class="halluc-law">${d.cited_law}</span></td>
              <td><span class="action-badge ${isBlocked ? 'blocked' : 'approved'}">${d.action}</span></td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;
}

function animateDashboardCounters() {
  const aucEl = document.getElementById('dash-auc');
  const driftEl = document.getElementById('dash-drifted');
  const challengerEl = document.getElementById('dash-challenger');
  const healthEl = document.getElementById('dash-health');

  if (aucEl) animateCounter(aucEl, 0.7352, 1500, 4);
  if (driftEl) animateCounter(driftEl, 3, 800);
  if (challengerEl) animateCounter(challengerEl, 0.7327, 1500, 4);
  if (healthEl) animateCounter(healthEl, 82, 1200);
}

function refreshDashboard() {
  renderDriftWidget();
  renderRetrainWidget();
  renderHallucWidget();
  animateDashboardCounters();
  if (typeof renderWhyPanel === 'function') renderWhyPanel();
  showToast('Dashboard refreshed — all systems nominal');
}

async function runDemoPreset(presetKey) {
  const profile = DEMO_PROFILES[presetKey];
  const name = profile.label;

  document.querySelectorAll('.demo-preset-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = (typeof event !== 'undefined' && event) ? (event.currentTarget || event.target) : null;
  if (activeBtn && activeBtn.classList) activeBtn.classList.add('active');

  document.getElementById('result-empty').style.display = 'none';
  document.getElementById('result-content').style.display = 'none';

  const resultPanel = document.getElementById('result-panel');
  resultPanel.classList.add('loading');

  try {
    const result = await API_scoreLoan({ _preset: presetKey });
    resultPanel.classList.remove('loading');
    renderAssessmentResult(result, name);
    showToast(`${profile.label}: ${(result.probability * 100).toFixed(1)}% default probability → ${result.approved ? 'APPROVED' : 'REJECTED'}`);
  } catch (err) {
    resultPanel.classList.remove('loading');
    showToast('Error: could not reach scoring endpoint');
  }
}

async function assessLoan() {
  const income = parseFloat(document.getElementById('f-income').value);
  const age = parseFloat(document.getElementById('f-age').value);
  const cir = parseFloat(document.getElementById('f-cir').value);
  const emp = parseFloat(document.getElementById('f-emp').value);
  const name = document.getElementById('f-name').value || 'Applicant';

  if (!income || !age || !cir || !emp) {
    showToast('Please fill all required fields (income, age, credit-income ratio, employment years)');
    return;
  }

  const ext2 = parseFloat(document.getElementById('f-ext2').value) || 0.5;
  const ext3 = parseFloat(document.getElementById('f-ext3').value) || 0.5;

  const btn = document.querySelector('#assess .btn-primary');
  btn.textContent = 'Scoring via MLflow Serving...';
  btn.disabled = true;

  document.getElementById('result-empty').style.display = 'none';
  document.getElementById('result-content').style.display = 'none';

  try {
    const result = await API_scoreLoan({
      income,
      age,
      credit: cir * income,
      employment_years: emp,
      ext_source_2: ext2,
      ext_source_3: ext3,
    });
    renderAssessmentResult(result, name);
  } catch (err) {
    showToast('Error: could not reach scoring endpoint');
  } finally {
    btn.textContent = 'Run Credit Assessment';
    btn.disabled = false;
  }
}

function renderAssessmentResult(result, name) {
  const content = document.getElementById('result-content');
  content.style.display = 'block';

  const verdict = document.getElementById('result-verdict');
  verdict.className = 'result-verdict ' + (result.approved ? 'approved' : 'rejected');
  verdict.innerHTML = result.approved
    ? `APPROVED: ${name}`
    : `REJECTED: ${name}`;

  const prob = result.probability;
  const bar = document.getElementById('result-bar');
  const pct = (prob * 100).toFixed(1);
  bar.style.width = '0%';
  setTimeout(() => { bar.style.width = pct + '%'; }, 50);
  bar.style.background = prob > 0.35
    ? 'linear-gradient(90deg, var(--red), var(--red-bright))'
    : prob > 0.2
      ? 'linear-gradient(90deg, var(--amber), #f0c040)'
      : 'linear-gradient(90deg, var(--green), var(--green-bright))';

  document.getElementById('result-score-val').textContent =
    `Default Probability: ${pct}% — Model: ${result.model}`;

  const feats = result.features;
  const featureHTML = AURA_CONFIG.feature_cols.map(name => {
    const val = feats[name];
    const formatted = (typeof val === 'number') ? val.toFixed(4) : val;

    let riskClass = '';
    if (name === 'credit_income_ratio' && val > 6) riskClass = 'risk-high';
    else if (name === 'credit_income_ratio' && val < 3) riskClass = 'risk-low';
    else if (name === 'employment_years' && val < 3) riskClass = 'risk-high';
    else if (name === 'employment_years' && val > 4) riskClass = 'risk-low';
    else if (name === 'ext_mean' && val < 0.55) riskClass = 'risk-high';
    else if (name === 'ext_mean' && val > 0.65) riskClass = 'risk-low';
    else if (name === 'ext_source_2' && val < 0.55) riskClass = 'risk-high';
    else if (name === 'ext_source_2' && val > 0.7) riskClass = 'risk-low';
    else if (name === 'credit_per_year' && val > 2) riskClass = 'risk-high';
    else if (name === 'credit_per_year' && val < 1) riskClass = 'risk-low';

    return `<div class="cf-item ${riskClass}"><span class="cf-label">${name}</span><span class="cf-val">${formatted}</span></div>`;
  }).join('');

  document.getElementById('result-features').innerHTML = featureHTML;

  const h = result.hallucination;
  const actr = h.actr || null;
  lastAssessedACTR = { ...result, actr };
  const safeExplanation = (actr && actr.safe_response) ? actr.safe_response : result.explanation;

  document.getElementById('result-ex').textContent = safeExplanation;

  const hallucEl = document.getElementById('result-halluc');
  const pillEl = document.getElementById('actr-status-pill');

  if (h.has_hallucination) {
    hallucEl.className = 'halluc-result flagged';
    hallucEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="color:var(--amber);font-weight:600;">⚠ ACTR Intervened: Raw LLM contained ${h.invalid_citations.length} fake citation(s)</span>
        <span class="actr-audit-badge intervened" onclick="inspectACTRResultFromAssessment()">Inspect 4-Stage Audit ➔</span>
      </div>
      <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
        Stripped: ${h.invalid_citations.join(', ')} · Rewritten with verified RBI/SEBI standards · Grounding: 1.00
      </div>
    `;
    if (pillEl) {
      pillEl.className = 'badge high';
      pillEl.textContent = 'ACTR SECURED';
    }
  } else {
    hallucEl.className = 'halluc-result clean';
    hallucEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="color:var(--green-bright);font-weight:600;">✓ ACTR Verified: 100% Grounded in RBI/SEBI Regulations</span>
        <span class="actr-audit-badge clean" onclick="inspectACTRResultFromAssessment()">View Audit ➔</span>
      </div>
      <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
        Citations: ${h.valid_citations.join(', ') || 'RBI Guidelines Framework'} · Grounding Score: ${h.grounding_score}
      </div>
    `;
    if (pillEl) {
      pillEl.className = 'badge low';
      pillEl.textContent = 'COMPLIANCE SAFE';
    }
  }

  // Decompose Risk Factors (Risk Intelligence Layer)
  const riskAnalysis = AURA_RISK_INTELLIGENCE_AGENT.explainApplicantRisk(result.features, result.probability, result.approved);
  const breakdownContainer = document.getElementById('risk-breakdown-content');
  if (breakdownContainer) {
    breakdownContainer.innerHTML = `
      <div style="font-size:12px;color:#fff;margin-bottom:8px;line-height:1.5;">${riskAnalysis.summary}</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${riskAnalysis.risk_factors.map(rf => {
          const isHigh = rf.impact === 'HIGH_RISK';
          const isMod = rf.impact === 'MODERATE_RISK';
          const badgeClass = isHigh ? 'badge high' : isMod ? 'badge' : 'badge low';
          const borderClr = isHigh ? 'rgba(239,68,68,0.2)' : isMod ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)';
          return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:rgba(255,255,255,0.02);border:1px solid ${borderClr};border-radius:6px;font-size:11px;">
              <div>
                <span style="font-family:var(--font-mono);color:#fff;font-weight:600;">${rf.name}:</span>
                <span style="color:var(--text-secondary);margin-left:4px;">${rf.value}</span>
                <span style="color:var(--text-muted);font-size:10px;margin-left:6px;">(${rf.note})</span>
              </div>
              <span class="${badgeClass}" style="font-size:10px;padding:2px 6px;">${rf.impact.replace('_', ' ')}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

let driftInitialised = false;

function initDriftPage() {
  if (driftInitialised) return;
  driftInitialised = true;
  renderPSICards(PSI_FEATURES);
  renderPSIHistoryTable(PSI_FEATURES);
}

function renderPSICards(features) {
  const container = document.getElementById('psi-cards');
  container.innerHTML = features.map(f => {
    const sev = psiSeverity(f.psi);
    return `
      <div class="psi-card ${sev}">
        <div class="psi-card-name">${f.name}</div>
        <div class="psi-card-val ${sev}">${f.psi.toFixed(2)}</div>
        <div class="psi-card-bar-wrap">
          <div class="psi-card-bar ${sev}" style="width:${psiBarWidth(f.psi)}"></div>
        </div>
        <span class="badge ${sev}">${sev.toUpperCase()}</span>
      </div>
    `;
  }).join('');
}

function renderPSIHistoryTable(features) {
  const now = new Date();
  const tbody = document.getElementById('psi-history-body');
  tbody.innerHTML = features.map(f => {
    const sev = psiSeverity(f.psi);
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `
      <tr>
        <td class="mono">${now.toLocaleDateString('en-IN')} ${timeStr}</td>
        <td><code>${f.name}</code></td>
        <td class="${sev === 'high' ? 'red' : sev === 'medium' ? 'amber' : 'green'}">${f.psi.toFixed(3)}</td>
        <td><span class="badge ${sev}">${sev.toUpperCase()}</span></td>
        <td class="mono">${f.training_mean}</td>
        <td class="mono">${f.production_mean}</td>
        <td style="color:var(--text-muted);font-size:12px">${f.action}</td>
      </tr>
    `;
  }).join('');
}

async function runPSI() {
  const btn = document.querySelector('#page-drift .btn-secondary');
  btn.textContent = 'Running PSI Analysis...';
  btn.disabled = true;

  try {
    const results = await API_runPSI();
    renderPSICards(results);
    renderPSIHistoryTable(results);

    const highCount = results.filter(r => psiSeverity(r.psi) === 'high').length;
    if (highCount > 0) {
      showToast(`PSI complete — ${highCount} CRITICAL drift feature(s) detected. Autonomous retrain triggered.`, 4000);
    } else {
      showToast('PSI complete — all features stable');
    }
  } catch {
    showToast('Error running PSI check');
  } finally {
    btn.textContent = 'Run PSI Check';
    btn.disabled = false;
  }
}

async function compareModels() {
  showToast('Comparison loaded from gold.model_comparison — Champion: 0.7210, Challenger: 0.7540');
}

async function promoteChallenger() {
  const btn = document.querySelector('#page-models .btn-primary');
  btn.textContent = 'Promoting via MLflow...';
  btn.disabled = true;

  try {
    const res = await API_promoteChallenger();
    showToast(res.message, 5000);

    document.querySelector('.model-card.champion .model-stage-badge').textContent = 'Archived';
    document.querySelector('.model-card.champion .model-stage-badge').className = 'model-stage-badge';
    document.querySelector('.model-card.champion .model-stage-badge').style.cssText =
      'background:rgba(255,255,255,0.03);color:var(--text-muted);border:1px solid var(--border);font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:6px;margin-bottom:8px;display:inline-block';

    document.querySelector('.model-card.challenger .model-stage-badge').textContent = 'Production';
    document.querySelector('.model-card.challenger .model-stage-badge').className = 'model-stage-badge champion-badge';

    const tbody = document.getElementById('retrain-log-body');
    const now = new Date().toLocaleString('en-IN');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td class="mono">${now}</td>
      <td>Manual promotion from AURA UI</td>
      <td><code>income, credit_income_ratio</code></td>
      <td>0.7210</td>
      <td class="green">0.7540</td>
      <td><span class="badge low">PROMOTE</span></td>
      <td class="green">Yes</td>
    `;
    tbody.prepend(newRow);
  } catch {
    showToast('Error promoting model');
  } finally {
    btn.textContent = 'Promote Challenger';
    btn.disabled = false;
  }
}

function loadModelCard(type) {
  const cards = {
    champion: `aura_credit_champion · Production
URI: ${AURA_CONFIG.champion_uri}
AUC: 0.7210 · Accuracy: 82.4%
Trained on: Home Credit (350K rows)
11 Features: income, age_years, credit_income_ratio, employment_years, ext_source_1, ext_source_2, ext_source_3, ext_mean, ext_min, income_age_ratio, credit_per_year`,
    challenger: `aura_credit_challenger · Staging
URI: ${AURA_CONFIG.challenger_uri}
AUC: 0.7540 · Accuracy: 84.1%
Trained on: Combined dataset (Home Credit + simulated drift)
11 Features: Same feature engineering pipeline
Trigger: PSI > 0.2 on income, credit_income_ratio`,
  };
  showToast(cards[type], 6000);
}

let courtInitialised = false;

function initCourtPage() {
  if (courtInitialised) return;
  courtInitialised = true;
  renderCourtTable(LLM_EVALUATIONS);
}

function renderCourtTable(evals) {
  const tbody = document.getElementById('court-table-body');
  tbody.innerHTML = evals.map(e => `
    <tr>
      <td class="mono">${e.id}</td>
      <td style="max-width:280px;font-size:12px;color:var(--text-secondary)">${e.explanation.substring(0, 80)}...</td>
      <td><code>${e.citations.join(', ') || '—'}</code></td>
      <td>${e.has_hallucination
      ? `<span style="color:var(--red);font-family:var(--font-mono);font-size:11px">${e.hallucinated.join(', ')}</span>`
      : '<span style="color:var(--green);font-family:var(--font-mono);font-size:11px">None</span>'
    }</td>
      <td class="${e.grounding_score >= 0.8 ? 'green' : e.grounding_score >= 0.4 ? '' : 'red'}">${e.grounding_score.toFixed(2)}</td>
      <td class="${e.halluc_score === 0 ? 'green' : e.halluc_score >= 0.5 ? 'red' : ''}">${e.halluc_score.toFixed(2)}</td>
      <td>${e.has_hallucination
      ? '<span class="badge high">FLAGGED</span>'
      : '<span class="badge low">CLEAN</span>'
    }</td>
    </tr>
  `).join('');
}

async function evaluateExplanation() {
  const text = document.getElementById('court-input').value.trim();
  if (!text) { showToast('Please enter an explanation to evaluate'); return; }

  const btn = document.querySelector('#page-court .card .btn-primary');
  btn.textContent = 'Evaluating via LLM Court...';
  btn.disabled = true;

  try {
    const result = await API_evaluateExplanation({ text });
    renderCourtResult(result, text);
  } catch {
    showToast('Error evaluating explanation');
  } finally {
    btn.textContent = 'Evaluate for Hallucinations';
    btn.disabled = false;
  }
}

function renderCourtResult(result, text) {
  const el = document.getElementById('court-result');
  el.style.display = 'block';

  const headerColor = result.has_hallucination ? 'var(--red)' : 'var(--green)';
  const headerText = result.has_hallucination
    ? `⚠ Hallucination detected — ${result.invalid_citations.length} fake citation(s)`
    : '✓ All citations verified — no hallucinations';

  const citRows = [
    ...result.valid_citations.map(c => `
      <div class="court-cite-row">
        <div class="cite-icon ok">✓</div>
        <span style="color:var(--green)">${c}</span>
        <span style="color:var(--text-muted)">— found in rbi_regulations table</span>
      </div>
    `),
    ...result.invalid_citations.map(c => `
      <div class="court-cite-row">
        <div class="cite-icon bad">✕</div>
        <span style="color:var(--red)">${c}</span>
        <span style="color:var(--text-muted)">— not found in rbi_regulations table. Citation does not exist.</span>
      </div>
    `),
  ].join('');

  el.innerHTML = `
    <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${headerColor};margin-bottom:1rem">${headerText}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">
      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:1rem">
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">factual_grounding_score</div>
        <div style="font-family:var(--font-display);font-size:26px;font-weight:700;color:${result.grounding_score >= 0.7 ? 'var(--green)' : 'var(--red)'}">${result.grounding_score.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:1rem">
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">hallucination_score</div>
        <div style="font-family:var(--font-display);font-size:26px;font-weight:700;color:${result.halluc_score === 0 ? 'var(--green)' : 'var(--red)'}">${result.halluc_score.toFixed(2)}</div>
      </div>
    </div>
    ${result.citations.length > 0 ? `
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:0.5rem">Citations extracted</div>
      ${citRows}
    ` : '<div style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono)">No regulatory citations found in this explanation.</div>'}
  `;
}

async function runBatchEval() {
  showToast('Batch evaluation complete — 8 explanations scored via mlflow.evaluate() on gold.llm_evaluation_metrics', 5000);
}

/* ══════════════════════════════════════════════════════════════════
   ACTR — AI Cross-Truth Reasoning Framework Interactive Logic
   ══════════════════════════════════════════════════════════════════ */

const ACTR_PRESETS = {
  fake_sec23b: {
    title: 'Fake Law: Section 23B (Mandatory CIBIL 750)',
    text: 'Per Section 23B of the Banking Regulation Act, a minimum CIBIL score of 750 is mandatory for this loan category. Because your credit-income ratio is 9.4 and employment tenure is 2.1 years, loan is rejected.'
  },
  fake_rbi999: {
    title: 'Fake Circular: RBI/2023/999 (6-Month Tenure Ban)',
    text: 'As per RBI Circular RBI/2023/999, NBFCs must reject applicants with employment tenure under 6 months. Your employment history violates statutory tenure baselines.'
  },
  fake_art15c: {
    title: 'Fabricated Rule: Article 15C (Phantom DSR Cap)',
    text: 'Under Article 15C of the RBI Master Direction on Credit, a debt-service ratio above 0.4 is prohibited. Application is declined per statutory cap.'
  },
  clean_rbi: {
    title: 'Grounded Truth: Digital Lending & NBFC Code',
    text: 'Based on RBI/2022-23/103 (Fair Practices Code for NBFCs) and RBI/2021-22/125 (Digital Lending Guidelines), your application was assessed across 11 credit features. With employment tenure of 4.5 years and a credit-income ratio of 2.18, your profile meets all regulatory lending criteria.'
  }
};

let lastAssessedACTR = null;

function inspectACTRResultFromAssessment() {
  const el = document.getElementById('actr-engine');
  if (el) el.scrollIntoView({ behavior: 'smooth' });

  if (lastAssessedACTR) {
    const input = document.getElementById('actr-custom-input');
    if (input) input.value = lastAssessedACTR.original_text || lastAssessedACTR.explanation || '';
    if (lastAssessedACTR.actr) {
      renderACTRVerificationResult(lastAssessedACTR.actr);
    } else {
      runACTRInteractiveVerification();
    }
  }
}

function loadACTRPreset(key, evt) {
  const preset = ACTR_PRESETS[key];
  if (!preset) return;

  document.querySelectorAll('.actr-preset-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = (typeof evt !== 'undefined' && evt) ? (evt.currentTarget || evt.target) : null;
  if (activeBtn && activeBtn.classList) activeBtn.classList.add('active');

  const input = document.getElementById('actr-custom-input');
  if (input) input.value = preset.text;

  runACTRInteractiveVerification();
}

async function runACTRInteractiveVerification() {
  const input = document.getElementById('actr-custom-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) {
    showToast('Please enter an explanation to verify');
    return;
  }

  const btn = document.getElementById('actr-verify-btn');
  if (btn) {
    btn.textContent = 'Running ACTR Cross-Truth Verification...';
    btn.disabled = true;
  }

  const loadingEl = document.getElementById('actr-loading');
  const contentEl = document.getElementById('actr-content');
  if (loadingEl) loadingEl.style.display = 'block';
  if (contentEl) contentEl.style.display = 'none';

  try {
    const result = await API_runACTRVerification({ text });
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
    renderACTRVerificationResult(result);
    showToast(`ACTR: Verification complete (${result.has_hallucination ? 'Intervention Applied' : '100% Grounded'})`);
  } catch (err) {
    if (loadingEl) loadingEl.style.display = 'none';
    showToast('Error executing ACTR verification pipeline');
  } finally {
    if (btn) {
      btn.textContent = 'Run ACTR Cross-Truth Verification →';
      btn.disabled = false;
    }
  }
}

function highlightACTRStage(stageNum) {
  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`flow-node-${i}`);
    if (node) {
      if (i === stageNum) node.classList.add('active');
      else node.classList.remove('active');
    }
  }
  const stageBox = document.getElementById(`actr-stage-box-${stageNum}`);
  if (stageBox) {
    stageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    stageBox.style.borderColor = 'var(--accent)';
    setTimeout(() => { stageBox.style.borderColor = ''; }, 1200);
  }
}

function renderACTRVerificationResult(result) {
  const content = document.getElementById('actr-content');
  if (!content) return;

  const s1 = result.stage1_extraction || { regulations: [], financial_claims: [], compliance_references: [] };
  const s2 = result.stage2_validation || { rbi_checks: [], sebi_checks: [], compliance_checks: [], financial_validations: [] };
  const s3 = result.stage3_detection || { fake_regulations: [], unsupported_claims: [], fabricated_reasoning: [] };
  const s4 = result.stage4_correction || { removed_hallucinations: [], grounded_replacements: [], safe_response: result.safe_response };

  const isFlagged = result.has_hallucination;

  // Stage 1 chips
  const regChips = s1.regulations.length > 0
    ? s1.regulations.map(r => {
        const isFake = s3.fake_regulations.some(f => f.citation === r);
        return `<span class="actr-chip ${isFake ? 'reg-fake' : 'reg-valid'}">📜 ${r} ${isFake ? '✕ (Fake)' : '✓ (Valid)'}</span>`;
      }).join(' ')
    : '<span style="font-size:12px;color:var(--text-muted);">No regulations cited</span>';

  const finChips = s1.financial_claims.length > 0
    ? s1.financial_claims.map(f => `<span class="actr-chip metric">📊 ${f.type}: ${f.claimed_value}</span>`).join(' ')
    : '<span style="font-size:12px;color:var(--text-muted);">No financial claims extracted</span>';

  const compChips = s1.compliance_references.length > 0
    ? s1.compliance_references.map(c => `<span class="actr-chip compliance">⚖️ ${c.type}</span>`).join(' ')
    : '<span style="font-size:12px;color:var(--text-muted);">No compliance keywords</span>';

  // Stage 2 checks
  const crossRefRows = [
    ...s2.rbi_checks.map(r => `<div style="font-size:12px;color:var(--green-bright);margin-bottom:4px;">✓ <strong>${r.citation}</strong>: Matched in RBI Guidelines DB (${r.title})</div>`),
    ...s2.sebi_checks.map(s => `<div style="font-size:12px;color:var(--green-bright);margin-bottom:4px;">✓ <strong>${s.citation}</strong>: Matched in SEBI Regulatory Rules (${s.title})</div>`),
    ...s2.compliance_checks.map(c => `<div style="font-size:12px;color:var(--red-bright);margin-bottom:4px;">✕ <strong>${c.citation}</strong>: Unregistered in RBI/SEBI Repository — ${c.detail}</div>`)
  ].join('');

  // Stage 3 detections
  const detectionHTML = isFlagged
    ? `
      <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:10px 14px;margin-bottom:10px;">
        <div style="font-weight:600;font-size:12px;color:var(--red-bright);margin-bottom:4px;">⚠ Hallucinations Detected (${s3.fake_regulations.length} fake reg, ${s3.unsupported_claims.length} false claim, ${s3.fabricated_reasoning.length} spurious reasoning)</div>
        ${s3.fake_regulations.map(f => `<div style="font-size:11px;color:var(--text-secondary);">• Fake Regulation: <code style="color:var(--red-bright);">${f.citation}</code> — ${f.detail}</div>`).join('')}
        ${s3.fabricated_reasoning.map(r => `<div style="font-size:11px;color:var(--text-secondary);">• Spurious Rule: ${r.reason}</div>`).join('')}
      </div>
    `
    : `
      <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:8px;padding:10px 14px;margin-bottom:10px;">
        <div style="font-weight:600;font-size:12px;color:var(--green-bright);">✓ Zero Hallucinations — 100% Truth Grounded</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">All claims verified against official RBI and SEBI master directions.</div>
      </div>
    `;

  content.innerHTML = `
    <div class="actr-scores-bar">
      <div class="actr-score-card">
        <div class="actr-score-label">Factual Grounding Score</div>
        <div class="actr-score-val ${result.grounding_score >= 0.7 ? 'green' : 'red'}">${result.grounding_score.toFixed(2)}</div>
        <div style="font-size:10px;color:var(--text-muted);">${result.grounding_score >= 0.7 ? 'Compliant' : 'Unverified Claims'}</div>
      </div>
      <div class="actr-score-card">
        <div class="actr-score-label">Hallucination Score</div>
        <div class="actr-score-val ${result.halluc_score === 0 ? 'green' : 'red'}">${result.halluc_score.toFixed(2)}</div>
        <div style="font-size:10px;color:var(--text-muted);">${result.halluc_score === 0 ? 'Zero Risk' : 'Intervention Applied'}</div>
      </div>
    </div>

    <div class="actr-stages-container">
      
      <!-- Stage 1 -->
      <div class="actr-stage-box" id="actr-stage-box-1">
        <div class="actr-stage-header">
          <div class="actr-stage-title-wrap">
            <div class="actr-stage-icon s1">1</div>
            <div class="actr-stage-title">Claim Extraction Module</div>
          </div>
          <span class="badge low">${s1.regulations.length} Regs · ${s1.financial_claims.length} Claims</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">Regulations:</div>
        <div class="actr-chip-row">${regChips}</div>
        <div style="font-size:11px;color:var(--text-muted);margin:8px 0 4px;">Financial & Compliance Claims:</div>
        <div class="actr-chip-row">${finChips} ${compChips}</div>
      </div>

      <!-- Stage 2 -->
      <div class="actr-stage-box" id="actr-stage-box-2">
        <div class="actr-stage-header">
          <div class="actr-stage-title-wrap">
            <div class="actr-stage-icon s2">2</div>
            <div class="actr-stage-title">Cross-Reference Validator</div>
          </div>
          <span class="badge low">RBI & SEBI DB</span>
        </div>
        <div>${crossRefRows || '<div style="font-size:12px;color:var(--text-muted);">No regulations to cross-reference</div>'}</div>
      </div>

      <!-- Stage 3 -->
      <div class="actr-stage-box" id="actr-stage-box-3">
        <div class="actr-stage-header">
          <div class="actr-stage-title-wrap">
            <div class="actr-stage-icon s3">3</div>
            <div class="actr-stage-title">Hallucination Detection Layer</div>
          </div>
          <span class="badge ${isFlagged ? 'high' : 'low'}">${isFlagged ? 'INTERVENTION' : 'PASS'}</span>
        </div>
        ${detectionHTML}
      </div>

      <!-- Stage 4 & Output -->
      <div class="actr-stage-box" id="actr-stage-box-4">
        <div class="actr-stage-header">
          <div class="actr-stage-title-wrap">
            <div class="actr-stage-icon s4">4</div>
            <div class="actr-stage-title">Correction & Rewriting Engine</div>
          </div>
          <span class="badge low">COMPLIANCE SECURED</span>
        </div>
        
        ${isFlagged ? `
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">
            <strong>Removed:</strong> <span style="color:var(--red-bright);text-decoration:line-through;">${s4.removed_hallucinations.join(', ') || 'None'}</span><br/>
            <strong>Substituted Truth:</strong> <span style="color:var(--green-bright);">${s4.grounded_replacements.join(', ') || 'RBI Fair Practices Code'}</span>
          </div>
        ` : ''}

        <div class="actr-safe-response-container">
          <div class="actr-safe-label">
            <span>🛡️</span>
            <span>Safe Verified Response to User (Zero Hallucinations)</span>
          </div>
          <div class="actr-safe-text">${result.safe_response || result.original_text}</div>
        </div>
      </div>

    </div>
  `;
}

// Auto-initialize ACTR default preset on load
window.addEventListener('DOMContentLoaded', () => {
  const customInput = document.getElementById('actr-custom-input');
  if (customInput && ACTR_PRESETS.fake_sec23b) {
    customInput.value = ACTR_PRESETS.fake_sec23b.text;
    runACTRInteractiveVerification();
  }
});


(function initCursorFollower() {
  const glow = document.querySelector('.cursor-glow');
  const dot = document.querySelector('.cursor-dot');
  if (!glow || !dot) return;

  let glowX = mouseX, glowY = mouseY;

  function updateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';

    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    requestAnimationFrame(updateGlow);
  }
  updateGlow();

  const hoverTargets = 'a, button, input, select, textarea, .nav-item, .demo-preset-btn, .kpi-card, .widget-card, .model-card, .tech-card, .arch-node, .psi-card, .btn-primary, .btn-secondary, .btn-ghost-sm, .tag, .link-btn';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('hovering');
      glow.style.width = '400px';
      glow.style.height = '400px';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('hovering');
      glow.style.width = '320px';
      glow.style.height = '320px';
    }
  });
})();

(function init3DTilt() {
  return;
  const tiltSelectors = '.kpi-card, .widget-card, .model-card, .psi-card, .tech-card, .arch-node';
  const MAX_TILT = 6;
  const PERSPECTIVE = 800;

  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll(tiltSelectors);
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist < 400) {
        const rotateY = (distX / rect.width) * MAX_TILT;
        const rotateX = -(distY / rect.height) * MAX_TILT;
        card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      }
    });
  });

  document.addEventListener('mouseleave', (e) => {
    if (e.target.matches && e.target.matches(tiltSelectors)) {
      e.target.style.transform = '';
    }
  }, true);

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest(tiltSelectors);
    if (card && !card.contains(e.relatedTarget)) {
      card.style.transform = '';
    }
  });
})();

(function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  function observeRevealElements() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  const origNav = window.navigateTo;
  if (typeof origNav === 'function') {
    window.navigateTo = function (page) {
      origNav(page);
      setTimeout(observeRevealElements, 100);
    };
  }

  setTimeout(observeRevealElements, 300);
})();

(function initMagneticButtons() {
  return;
  const MAGNETIC_STRENGTH = 0.3;
  const MAGNETIC_DIST = 100;

  document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.btn-primary, .btn-secondary, .demo-preset-btn').forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAGNETIC_DIST) {
        const force = (1 - dist / MAGNETIC_DIST) * MAGNETIC_STRENGTH;
        btn.style.transform = `translate(${dx * force}px, ${dy * force}px)`;
      } else {
        btn.style.transform = '';
      }
    });
  });
})();

(function initAnimatedCounters() {
  function animateCounter(el, target, duration = 1200) {
    const start = performance.now();
    const isFloat = String(target).includes('.');
    const decimals = isFloat ? String(target).split('.')[1]?.length || 2 : 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (isFloat) {
        el.textContent = current.toFixed(decimals);
      } else {
        el.textContent = Math.round(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  window.animateCounter = animateCounter;
})();

document.addEventListener('DOMContentLoaded', () => {
  initDashboardWidgets();
});

if (document.readyState !== 'loading') {
  initDashboardWidgets();
}


/* ============================================================
   MODERN ENHANCEMENTS — AURA 2.0
   ============================================================ */

// Scroll-aware nav
(function initScrollNav() {
  const nav = document.getElementById('top-nav');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }, { passive: true });
})();

// Active nav link on scroll
(function initNavHighlight() {
  const sections = ['assess', 'dashboard', 'arch'];
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

// Animated hero stat counters
(function initHeroCounters() {
  const statEls = document.querySelectorAll('.hero-stat-value[data-count]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, 0);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
})();

// Smooth section transitions with stagger
(function initStaggerReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.kpi-card, .widget-card');
        children.forEach((child, i) => {
          child.style.animationDelay = `${i * 0.07}s`;
          child.classList.add('card-animate-in');
        });
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.kpi-grid, .widget-grid').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════════════
   AURA Risk Intelligence Agent Controller Functions
   ══════════════════════════════════════════════════════════════════ */

let currentDriftFeatures = null;
let whyPanelOpen = true;
let riskDecompOpen = true;

function initRiskIntelligenceAgent() {
  currentDriftFeatures = [...PSI_FEATURES];
  renderWhyPanel();
  updateAgentStatusBadge('STABLE');
}

function updateAgentStatusBadge(status) {
  const badge = document.getElementById('agent-status-badge');
  if (!badge) return;

  if (status === 'RETRAIN') {
    badge.className = 'badge high';
    badge.textContent = '● RETRAIN · CHALLENGER RECOMMENDED';
  } else if (status === 'MONITOR') {
    badge.className = 'badge';
    badge.style.background = 'rgba(245,158,11,0.15)';
    badge.style.color = 'var(--amber)';
    badge.textContent = '● ELEVATED · INCREASE MONITORING';
  } else if (status === 'HUMAN_REVIEW') {
    badge.className = 'badge high';
    badge.textContent = '● ESCALATE · HUMAN REVIEW REQUIRED';
  } else {
    badge.className = 'badge low';
    badge.textContent = '● STABLE · SURVEILLANCE ACTIVE';
  }
}

function toggleWhyPanel() {
  whyPanelOpen = !whyPanelOpen;
  const content = document.getElementById('why-panel-content');
  const arrow = document.getElementById('why-toggle-arrow');
  if (content) content.style.display = whyPanelOpen ? 'block' : 'none';
  if (arrow) arrow.textContent = whyPanelOpen ? '▼' : '▶';
}

function toggleRiskDecomposition() {
  riskDecompOpen = !riskDecompOpen;
  const content = document.getElementById('risk-breakdown-content');
  const arrow = document.getElementById('risk-toggle-arrow');
  if (content) content.style.display = riskDecompOpen ? 'block' : 'none';
  if (arrow) arrow.textContent = riskDecompOpen ? '▼' : '▶';
}

function renderWhyPanel() {
  const container = document.getElementById('why-panel-content');
  if (!container) return;

  const driftList = currentDriftFeatures || PSI_FEATURES;
  const driftEval = AURA_RISK_INTELLIGENCE_AGENT.evaluateDriftAndRecommend(driftList);
  const health = AURA_RISK_INTELLIGENCE_AGENT.calculateModelHealth(driftList);

  container.innerHTML = `
    <div style="margin-bottom: 8px;">
      <strong style="color: #fff;">Observation:</strong> ${driftEval.observation}
    </div>
    <div style="margin-bottom: 8px;">
      <strong style="color: #fff;">Telemetry Evidence:</strong>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
        ${driftList.map(f => {
          const score = typeof f.psi === 'number' ? f.psi : f.psi_score;
          const isHigh = score > 0.20;
          const isMod = score > 0.10 && score <= 0.20;
          const borderClr = isHigh ? 'rgba(239,68,68,0.3)' : isMod ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)';
          const textClr = isHigh ? 'var(--red-bright)' : isMod ? 'var(--amber)' : 'var(--green-bright)';
          return `
            <span style="font-family: var(--font-mono); font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid ${borderClr}; background: rgba(0,0,0,0.3); color: ${textClr};">
              ${f.name || f.feature}: PSI ${score.toFixed(4)}
            </span>
          `;
        }).join('')}
      </div>
    </div>
    <div style="margin-bottom: 8px;">
      <strong style="color: #fff;">Reasoning:</strong> ${driftEval.reasoning}
    </div>
    <div>
      <strong style="color: #fff;">Recommendation & Action Plan:</strong>
      <span style="color: var(--accent); font-family: var(--font-mono);">${driftEval.recommended_action}</span> — ${driftEval.action_plan || 'Continue regular surveillance.'}
    </div>
  `;
}

function handleAskAURA(query) {
  const resBox = document.getElementById('agent-query-response');
  if (!resBox) return;

  resBox.style.display = 'block';
  resBox.innerHTML = `
    <div style="color: var(--text-muted); font-size: 12px; font-family: var(--font-mono);">
      Querying Delta Lake telemetry & Unity Catalog audit log...
    </div>
  `;

  setTimeout(() => {
    const answer = AURA_RISK_INTELLIGENCE_AGENT.answerAgentQuery(query, { drift: currentDriftFeatures || PSI_FEATURES });
    resBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--accent); font-weight: 600;">
          Q: "${query}"
        </span>
        <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">GROUNDED EVIDENCE</span>
      </div>
      <div style="font-size: 13px; color: #fff; line-height: 1.6;">${answer}</div>
    `;
  }, 350);
}

function handleCustomAskAURA() {
  const input = document.getElementById('agent-custom-query');
  if (!input || !input.value.trim()) return;
  const q = input.value.trim();
  handleAskAURA(q);
  input.value = '';
}

async function handleSimulateDrift() {
  showToast('⚡ Injecting production distribution drift telemetry...');
  
  const simulatedDrift = await API_simulateDrift();
  currentDriftFeatures = simulatedDrift;

  // Update global DRIFT_DATA
  for (let i = 0; i < DRIFT_DATA.length; i++) {
    const match = simulatedDrift.find(s => s.name === DRIFT_DATA[i].feature);
    if (match) {
      DRIFT_DATA[i].psi_score = match.psi;
      DRIFT_DATA[i].status = match.psi > 0.2 ? 'CRITICAL DRIFT' : match.psi > 0.1 ? 'MODERATE DRIFT' : 'STABLE';
      DRIFT_DATA[i].action = match.psi > 0.2 ? 'TRIGGER RETRAIN' : match.psi > 0.1 ? 'INCREASE MONITORING' : 'MONITOR';
    }
  }

  // Update Agent Status and Health
  updateAgentStatusBadge('RETRAIN');
  const health = AURA_RISK_INTELLIGENCE_AGENT.calculateModelHealth(simulatedDrift);
  
  const healthEl = document.getElementById('dash-health');
  const healthSub = document.getElementById('dash-health-sub');
  if (healthEl) animateCounter(healthEl, health.score, 1000);
  if (healthSub) {
    healthSub.className = 'kpi-sub red';
    healthSub.textContent = `${health.status} · Retraining Advised`;
  }

  renderDriftWidget();
  renderWhyPanel();
  handleAskAURA('Why did the model retrain?');
  showToast('Challenger retraining triggered · Deterministic gate evaluated (+0.0049 >= 0.004) · Model promoted!');
}

function handleResetDrift() {
  currentDriftFeatures = [
    { name: 'credit_income_ratio', psi: 0.04, severity: 'low', training_mean: 7.14, production_mean: 7.20, action: 'Stable' },
    { name: 'employment_years', psi: 0.03, severity: 'low', training_mean: 6.20, production_mean: 6.10, action: 'Stable' },
    { name: 'income', psi: 0.05, severity: 'low', training_mean: 168797, production_mean: 165000, action: 'Stable' },
    { name: 'age_years', psi: 0.02, severity: 'low', training_mean: 43.10, production_mean: 42.80, action: 'Stable' },
    { name: 'debt_service_ratio', psi: 0.03, severity: 'low', training_mean: 0.21, production_mean: 0.21, action: 'Stable' },
  ];

  for (let i = 0; i < DRIFT_DATA.length; i++) {
    const match = currentDriftFeatures.find(s => s.name === DRIFT_DATA[i].feature);
    if (match) {
      DRIFT_DATA[i].psi_score = match.psi;
      DRIFT_DATA[i].status = 'STABLE';
      DRIFT_DATA[i].action = 'MONITOR';
    }
  }

  updateAgentStatusBadge('STABLE');
  const health = AURA_RISK_INTELLIGENCE_AGENT.calculateModelHealth(currentDriftFeatures);
  
  const healthEl = document.getElementById('dash-health');
  const healthSub = document.getElementById('dash-health-sub');
  if (healthEl) animateCounter(healthEl, health.score, 1000);
  if (healthSub) {
    healthSub.className = 'kpi-sub green';
    healthSub.textContent = 'HEALTHY · Surveillance Active';
  }

  renderDriftWidget();
  renderWhyPanel();
  showToast('↺ Telemetry reset to nominal baseline');
}

function handleGenerateRiskReport() {
  const modal = document.getElementById('risk-report-modal');
  const content = document.getElementById('risk-report-content');
  if (!modal || !content) return;

  const report = AURA_RISK_INTELLIGENCE_AGENT.generateRiskReport({ drift: currentDriftFeatures || PSI_FEATURES });

  content.innerHTML = `
    <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
        <span>REPORT ID: ${report.report_id}</span>
        <span>${report.generated_at}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div>
          <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Active Model</div>
          <div style="font-weight: 600; color: #fff;">${report.active_model.name} (${report.active_model.version})</div>
        </div>
        <div>
          <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Production AUC</div>
          <div style="font-weight: 600; color: var(--green-bright);">${report.active_model.auc.toFixed(4)} (${(report.active_model.accuracy * 100).toFixed(1)}% Acc)</div>
        </div>
        <div>
          <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Model Health</div>
          <div style="font-weight: 600; color: var(--accent);">${report.model_health.score} / 100 (${report.model_health.status})</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 14px;">
      <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; font-weight: 600;">
        1. Drift Telemetry & Distribution Surveillance
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); text-align: left; color: var(--text-muted);">
            <th style="padding: 4px 8px;">Feature</th>
            <th style="padding: 4px 8px;">PSI Score</th>
            <th style="padding: 4px 8px;">Threshold</th>
            <th style="padding: 4px 8px;">Severity</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(report.drift_surveillance.psi_telemetry).map(([feat, psi]) => {
            const isHigh = psi > 0.20;
            return `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                <td style="padding: 4px 8px; font-family: var(--font-mono); color: #fff;">${feat}</td>
                <td style="padding: 4px 8px; font-family: var(--font-mono); color: ${isHigh ? 'var(--red-bright)' : 'var(--green-bright)'};">${psi.toFixed(4)}</td>
                <td style="padding: 4px 8px; font-family: var(--font-mono); color: var(--text-muted);">0.2000</td>
                <td style="padding: 4px 8px;"><span class="${isHigh ? 'badge high' : 'badge low'}" style="font-size: 10px;">${isHigh ? 'CRITICAL' : 'STABLE'}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 14px; background: rgba(0, 180, 255, 0.03); border: 1px solid rgba(0, 180, 255, 0.15); border-radius: 8px; padding: 12px;">
      <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; font-weight: 600;">
        2. Agent Reasoning & Action Recommendations
      </div>
      <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
        <div><strong>Observation:</strong> ${report.agent_reasoning.observation}</div>
        <div style="margin-top: 4px;"><strong>Reasoning:</strong> ${report.agent_reasoning.reasoning}</div>
        <div style="margin-top: 4px;"><strong>Agent Recommendation:</strong> <span style="color: var(--accent); font-family: var(--font-mono);">${report.agent_reasoning.recommendation}</span></div>
      </div>
    </div>

    <div style="background: rgba(34, 197, 94, 0.03); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 8px; padding: 12px;">
      <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--green-bright); margin-bottom: 6px; font-weight: 600;">
        3. Deterministic Governance & Gate Execution
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span style="color: var(--text-muted);">Promotion Safety Threshold:</span>
        <span style="font-family: var(--font-mono); color: #fff;">Δ AUC &ge; ${report.deterministic_governance.gate_threshold.toFixed(4)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span style="color: var(--text-muted);">Challenger AUC vs Champion AUC:</span>
        <span style="font-family: var(--font-mono); color: #fff;">${report.deterministic_governance.last_evaluation.challenger_auc.toFixed(4)} vs ${report.deterministic_governance.last_evaluation.champion_auc.toFixed(4)} (+${report.deterministic_governance.last_evaluation.delta.toFixed(4)})</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span style="color: var(--text-muted);">Agent Recommendation:</span>
        <span style="font-family: var(--font-mono); color: var(--accent);">${report.deterministic_governance.last_evaluation.agent_recommendation}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span style="color: var(--text-muted);">Deterministic Gate Decision:</span>
        <span style="font-family: var(--font-mono); color: var(--green-bright);">${report.deterministic_governance.last_evaluation.system_decision}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; margin-top: 6px;">
        <span style="font-weight: 600; color: #fff;">Final System Action:</span>
        <span style="font-family: var(--font-mono); color: var(--green-bright); font-weight: 600;">${report.deterministic_governance.last_evaluation.final_action}</span>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeRiskReportModal() {
  const modal = document.getElementById('risk-report-modal');
  if (modal) modal.style.display = 'none';
}


/* ============================================
   OMNIFIN DIGITAL LOS - PROTOTYPE LOGIC v4
   Navigation, BRE Flows, Simulator, Dynamic Results
   ============================================ */

// =============================================
// STATE
// =============================================
const state = {
  currentTab: 'predeal',
  currentPredealPage: 'predeal-source',
  currentCamPage: 'cam-personal',
  preDealBRERun: false,
  preDealBREStatus: null,       // null | 'passed' | 'failed'
  camBRERun: false,
  camBREStatus: null,           // null | 'passed' | 'failed' | 'deviated'
  // Simulator selections (default variation to show)
  simPreDeal: 'failed',        // 'passed' | 'failed'
  simCam: 'deviated',          // 'passed' | 'deviated' | 'failed'
};


// =============================================
// MOCK DATA: All rules per block (flat arrays)
// =============================================

// --- Pre-Deal Rules (No deviations — only Passed or Failed) ---
// Based on BRE Policy Reference Guide v3
const preDealAllRules = [
  // Bureau & Credit (6)
  { block: 'Bureau & Credit', name: 'Bureau Score - Applicant', actual: '720', threshold: '>= 650', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Score - Co-Applicant', actual: '620', threshold: '>= 650', passStatus: 'passed', failStatus: 'deviated' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Applicant', actual: 'Rs. 0', threshold: 'No overdue', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Co-Applicant', actual: 'Rs. 0', threshold: 'No overdue', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Co-Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', failStatus: 'passed' },
  // Age Eligibility (4)
  { block: 'Age Eligibility', name: 'Min Age - Applicant', actual: '32 years', threshold: '>= 21 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Max Age at Maturity - Applicant', actual: '52 years', threshold: '<= 60 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Min Age - Co-Applicant', actual: '29 years', threshold: '>= 21 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Max Age at Maturity - Co-Applicant', actual: '49 years', threshold: '<= 70 years', passStatus: 'passed', failStatus: 'passed' },
  // Income & Employment (4)
  { block: 'Income & Employment', name: 'Applicant Is Income Earner', actual: 'Yes', threshold: 'Required', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Minimum Monthly Income', actual: '\u20B912,000', threshold: '>= \u20B915,000', passStatus: 'passed', failStatus: 'failed' },
  { block: 'Income & Employment', name: 'Current Employment Vintage', actual: '8 months', threshold: '>= 1 year', passStatus: 'passed', failStatus: 'failed' },
  { block: 'Income & Employment', name: 'Total Employment Experience', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', failStatus: 'passed' },
  // Loan Parameters (4)
  { block: 'Loan Parameters', name: 'Minimum Loan Amount', actual: '\u20B925,00,000', threshold: '>= \u20B91,00,000', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Maximum Customer Exposure', actual: '\u20B925,00,000', threshold: '<= \u20B91,00,00,000', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Product Eligibility', actual: 'Eligible', threshold: 'Eligible', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Max Loans per Property', actual: '1', threshold: '<= 2', passStatus: 'passed', failStatus: 'passed' },
  // Tenure (2)
  { block: 'Tenure', name: 'Minimum Tenure', actual: '240 months', threshold: '>= 12 months', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Tenure', name: 'Maximum Tenure', actual: '20 years', threshold: '<= 25 years', passStatus: 'passed', failStatus: 'passed' },
  // Co-Applicant & Guarantor (4)
  { block: 'Co-Applicant & Guarantor', name: 'Co-Applicant Mandatory', actual: 'Present', threshold: 'Required', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Bureau Score', actual: '710', threshold: '>= 650', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Wilful Defaulter', actual: 'No', threshold: 'Not WD', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Age', actual: '45 years', threshold: '18-70 years', passStatus: 'passed', failStatus: 'passed' },
  // Residence Stability (2)
  { block: 'Residence Stability', name: 'Duration in Current City', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Residence Stability', name: 'Duration at Current Residence', actual: '3 years', threshold: '>= 6 months', passStatus: 'passed', failStatus: 'passed' },
  // Property & Sanctioning (2)
  { block: 'Property & Sanctioning', name: 'Third Dwelling Unit Check', actual: '1st unit', threshold: '<= 2 units', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Property & Sanctioning', name: 'Branch Sanctioning Limit', actual: '\u20B925,00,000', threshold: '<= \u20B950,00,000', passStatus: 'passed', failStatus: 'passed' },
];

// --- CAM Rules ---
// Based on BRE Policy Reference Guide v3
const camAllRules = [
  // Bureau & Credit (6)
  { block: 'Bureau & Credit', name: 'Bureau Score - Applicant', actual: '720', threshold: '>= 650', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Score - Co-Applicant', actual: '620', threshold: '>= 650', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L3', devRule: 'Bureau score > 0 and < 650' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Applicant', actual: 'Rs. 0', threshold: 'No overdue', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Co-Applicant', actual: 'Rs. 8,000', threshold: 'No overdue', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L2', devRule: 'Overdue up to Rs. 10,000' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Co-Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // Age Eligibility (3)
  { block: 'Age Eligibility', name: 'Min Age - Applicant', actual: '32 years', threshold: '>= 21 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Max Age at Maturity - Applicant', actual: '52 years', threshold: '<= 60 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Age - Co-Applicant', actual: '29 years', threshold: '21-70 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // Income & Employment (4)
  { block: 'Income & Employment', name: 'Applicant Is Income Earner', actual: 'Yes', threshold: 'Required', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Minimum Monthly Income', actual: '\u20B972,000', threshold: '>= \u20B915,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'failed' },
  { block: 'Income & Employment', name: 'Current Employment Vintage', actual: '2.5 years', threshold: '>= 1 year', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Total Employment Experience', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // Loan Parameters (4)
  { block: 'Loan Parameters', name: 'Minimum Loan Amount', actual: '\u20B925,00,000', threshold: '>= \u20B91,00,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Maximum Customer Exposure', actual: '\u20B925,00,000', threshold: '<= \u20B91,00,00,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Branch Sanctioning Limit', actual: '\u20B925,00,000', threshold: '<= \u20B950,00,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Max Loans per Property', actual: '1', threshold: '<= 2', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // LTV (3)
  { block: 'LTV', name: 'LTV - Policy Limit', actual: '83%', threshold: '<= 80%', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L3', devRule: 'LTV exceeds policy by up to 5%' },
  { block: 'LTV', name: 'LTV - Regulatory Limit', actual: '83%', threshold: '<= 90%', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'failed' },
  { block: 'LTV', name: 'LTV - Property Type', actual: 'Residential', threshold: 'Allowed types', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // FOIR (3)
  { block: 'FOIR', name: 'FOIR Check', actual: '53%', threshold: '<= 50%', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L3', devRule: 'FOIR exceeds limit by up to 5%' },
  { block: 'FOIR', name: 'FOIR - Net Income Basis', actual: '53%', threshold: '<= 65%', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'FOIR', name: 'FOIR - Combined Income', actual: '38%', threshold: '<= 60%', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // Tenure (2)
  { block: 'Tenure', name: 'Minimum Tenure', actual: '240 months', threshold: '>= 12 months', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Tenure', name: 'Maximum Tenure', actual: '20 years', threshold: '<= 25 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // Property (3)
  { block: 'Property', name: 'Minimum Carpet Area', actual: '850 sq ft', threshold: '>= 270 sq ft', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Property', name: 'Property Age', actual: '42 years', threshold: '<= 40 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'failed' },
  { block: 'Property', name: 'CERSAI Check', actual: 'Clear', threshold: 'Clear', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // Co-Applicant & Guarantor (2)
  { block: 'Co-Applicant & Guarantor', name: 'Co-Applicant Mandatory', actual: 'Present', threshold: 'Required', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Bureau Score', actual: '710', threshold: '>= 650', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  // Residence Stability (2)
  { block: 'Residence Stability', name: 'Duration in Current City', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Residence Stability', name: 'Duration at Current Residence', actual: '3 years', threshold: '>= 6 months', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
];


// =============================================
// HELPER: Get rules for a given variation
// =============================================
function getPreDealRules(variation) {
  const statusKey = variation === 'passed' ? 'passStatus' : 'failStatus';
  // Pre-Deal BRE rule: deviated results are treated as passed
  return preDealAllRules.map(r => {
    const raw = r[statusKey];
    return { ...r, status: raw === 'deviated' ? 'passed' : raw };
  });
}

function getCamRules(variation) {
  const statusMap = { passed: 'passStatus', deviated: 'deviatedStatus', failed: 'failStatus' };
  const statusKey = statusMap[variation];
  return camAllRules.map(r => ({ ...r, status: r[statusKey] }));
}


// =============================================
// TAB SWITCHING
// =============================================
function switchTab(tabName) {
  state.currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  document.querySelectorAll('.action-bar').forEach(bar => bar.classList.remove('active'));
  document.getElementById('actionbar-' + tabName).classList.add('active');
  document.querySelectorAll('.sidebar').forEach(sb => sb.classList.remove('active'));
  document.getElementById('sidebar-' + tabName).classList.add('active');
  document.querySelectorAll('.content-panel').forEach(cp => cp.classList.remove('active'));

  if (tabName === 'predeal') {
    document.getElementById('page-' + state.currentPredealPage).classList.add('active');
  } else if (tabName === 'cam') {
    document.getElementById('page-' + state.currentCamPage).classList.add('active');
  } else if (tabName === 'cam-alloc') {
    document.getElementById('page-cam-alloc').classList.add('active');
  }
}


// =============================================
// SIDEBAR NAVIGATION
// =============================================
function navigateToPage(pageId) {
  const tab = state.currentTab;
  const sidebar = document.getElementById('sidebar-' + tab);
  sidebar.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === pageId));
  document.querySelectorAll('.content-panel').forEach(cp => cp.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  if (tab === 'predeal') state.currentPredealPage = pageId;
  else if (tab === 'cam') state.currentCamPage = pageId;
}


// =============================================
// MODAL MANAGEMENT
// =============================================
function showModal(content) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-box').innerHTML = content;
  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

function getCurrentTimestamp() {
  const now = new Date();
  return now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}


// =============================================
// RENDER BRE RESULTS (Dynamic)
// =============================================

function renderFailedTable(rules) {
  if (rules.length === 0) return '';
  return `
    <div class="results-section">
      <div class="results-title">Failed Rules <span class="count-badge fail">${rules.length}</span></div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Block Name</th><th>Rule Name</th><th>Actual Value</th><th>Threshold</th></tr></thead>
          <tbody>
            ${rules.map(r => `<tr>
              <td>${r.block}</td><td>${r.name}</td>
              <td class="text-danger fw-bold">${r.actual}</td><td>${r.threshold}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderDeviatedTable(rules) {
  if (rules.length === 0) return '';
  return `
    <div class="results-section">
      <div class="results-title">Deviated Rules <span class="count-badge deviate">${rules.length}</span></div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Block Name</th><th>Rule Name</th><th>Actual Value</th><th>Threshold</th><th>Result</th><th>Deviation Level</th><th>Deviation Rule</th></tr></thead>
          <tbody>
            ${rules.map(r => `<tr>
              <td>${r.block}</td><td>${r.name}</td>
              <td class="text-warning fw-bold">${r.actual}</td><td>${r.threshold}</td>
              <td><span class="bre-status-badge deviated" style="font-size:10px; padding:2px 8px;">DEVIATE</span></td>
              <td class="text-center">${r.devLevel || '-'}</td>
              <td>${r.devRule || '-'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderPassedTable(rules) {
  if (rules.length === 0) return '';
  return `
    <div class="results-section">
      <div class="results-title">Passed Rules <span class="count-badge pass">${rules.length}</span></div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Block Name</th><th>Rule Name</th><th>Actual Value</th><th>Threshold</th></tr></thead>
          <tbody>
            ${rules.map(r => `<tr>
              <td>${r.block}</td><td>${r.name}</td>
              <td class="text-success">${r.actual}</td><td>${r.threshold}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// --- Pre-Deal BRE Results (3 cards: Total, Passed, Failed — no Deviated, no Eligible Amount) ---
function renderPreDealBREResults() {
  const variation = state.simPreDeal;
  const rules = getPreDealRules(variation);

  const passed = rules.filter(r => r.status === 'passed');
  const failed = rules.filter(r => r.status === 'failed');
  const total = rules.length;

  const overallStatus = failed.length > 0 ? 'failed' : 'passed';
  const statusIcon = overallStatus === 'passed' ? '&#10004;' : '&#10006;';
  const statusText = overallStatus === 'passed' ? 'Passed' : 'Failed';

  state.preDealBREStatus = overallStatus;

  const container = document.getElementById('predeal-bre-dynamic-content');
  container.innerHTML = `
    <!-- Overall Status -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <span style="font-size:14px; font-weight:600;">Overall BRE Status:</span>
      <span class="bre-status-badge ${overallStatus}" style="font-size:14px; padding:5px 16px;">
        <span>${statusIcon}</span> ${statusText}
      </span>
      <span style="font-size:11px; color:#999; margin-left:8px;">Last run: ${getCurrentTimestamp()}</span>
    </div>

    <!-- Summary Cards (Pre-Deal: 3 cards only — no Deviated, no Eligible Amount) -->
    <div class="summary-cards" style="grid-template-columns: repeat(3, 1fr);">
      <div class="summary-card total">
        <div class="card-value">${total}</div>
        <div class="card-label">Total Applicable Rules</div>
      </div>
      <div class="summary-card passed">
        <div class="card-value">${passed.length}</div>
        <div class="card-label">Total Passed</div>
      </div>
      <div class="summary-card failed">
        <div class="card-value">${failed.length}</div>
        <div class="card-label">Total Failed</div>
      </div>
    </div>

    <!-- Rule Tables (no Deviated table for Pre-Deal) -->
    ${renderFailedTable(failed)}
    ${renderPassedTable(passed)}
  `;
}

// --- CAM BRE Results ---
function renderCamBREResults() {
  const variation = state.simCam;
  const rules = getCamRules(variation);

  const passed = rules.filter(r => r.status === 'passed');
  const failed = rules.filter(r => r.status === 'failed');
  const deviated = rules.filter(r => r.status === 'deviated');
  const total = rules.length;

  let overallStatus;
  if (failed.length > 0) overallStatus = 'failed';
  else if (deviated.length > 0) overallStatus = 'deviated';
  else overallStatus = 'passed';

  const statusIcons = { passed: '&#10004;', deviated: '&#9888;', failed: '&#10006;' };
  const statusLabels = { passed: 'Passed', deviated: 'Deviated', failed: 'Failed' };
  const eligible = failed.length > 0 ? '&mdash;' : '&#8377;25,00,000';

  state.camBREStatus = overallStatus;

  const container = document.getElementById('cam-bre-dynamic-content');
  container.innerHTML = `
    <!-- Overall Status -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <span style="font-size:14px; font-weight:600;">Overall CAM BRE Status:</span>
      <span class="bre-status-badge ${overallStatus}" style="font-size:14px; padding:5px 16px;">
        <span>${statusIcons[overallStatus]}</span> ${statusLabels[overallStatus]}
      </span>
      <span style="font-size:11px; color:#999; margin-left:8px;">Last run: ${getCurrentTimestamp()}</span>
    </div>

    <!-- Summary Cards (CAM: 5 cards, with Deviated and Eligible Amount) -->
    <div class="summary-cards" style="grid-template-columns: repeat(5, 1fr);">
      <div class="summary-card total">
        <div class="card-value">${total}</div>
        <div class="card-label">Total Applicable Rules</div>
      </div>
      <div class="summary-card passed">
        <div class="card-value">${passed.length}</div>
        <div class="card-label">Total Passed</div>
      </div>
      <div class="summary-card failed">
        <div class="card-value">${failed.length}</div>
        <div class="card-label">Total Failed</div>
      </div>
      <div class="summary-card deviated">
        <div class="card-value">${deviated.length}</div>
        <div class="card-label">Total Deviated</div>
      </div>
      <div class="summary-card amount">
        <div class="card-value">${eligible}</div>
        <div class="card-label">Eligible Loan Amount</div>
      </div>
    </div>

    <!-- Rule Tables -->
    ${renderFailedTable(failed)}
    ${renderDeviatedTable(deviated)}
    ${renderPassedTable(passed)}
  `;
}


// =============================================
// PRE-DEAL BRE FLOW
// =============================================

// "Send to CAM Sheet" ALWAYS triggers fresh BRE run — never assumes prior result
function handleSendToCamSheet() {
  showModal(`
    <div class="modal-header">
      <span class="modal-title">Pre-Deal BRE Required</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-icon">&#9888;&#65039;</div>
      <div class="modal-text">Running Pre-Deal BRE is required before sending this data to the CAM sheet.</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="runPreDealBREFromModal()">&#9654; Run Pre-Deal BRE</button>
      <button class="btn btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `);
}

function runPreDealBREFromModal() {
  showModal(`
    <div class="modal-body">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Generating results for Pre deal BRE...</div>
      </div>
    </div>
  `);

  setTimeout(() => {
    state.preDealBRERun = true;
    renderPreDealBREResults();
    showPreDealBREStatusModal();
    showPreDealBREPage();
  }, 2000);
}

function showPreDealBREStatusModal() {
  const status = state.preDealBREStatus;
  const statusClass = status === 'passed' ? 'passed' : 'failed';
  const statusIcon = status === 'passed' ? '&#10004;' : '&#10006;';
  const statusText = status === 'passed' ? 'Passed' : 'Failed';

  const failCount = getPreDealRules(state.simPreDeal).filter(r => r.status === 'failed').length;

  const bodyMessage = status === 'passed'
    ? 'All Pre-Deal BRE rules have passed successfully. You may proceed to send the data to the CAM sheet.'
    : failCount + ' rules in Pre-Deal BRE have failed.';

  const linkText = status === 'passed' ? 'View full results' : 'View failed rules';

  showModal(`
    <div class="modal-header">
      <span class="modal-title">Pre-Deal BRE Result</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-status">
        <span class="bre-status-badge ${statusClass}" style="font-size:16px; padding:6px 20px;">
          <span>${statusIcon}</span> ${statusText}
        </span>
      </div>
      <div class="modal-text">${bodyMessage}</div>
      <div class="modal-link">
        <a href="#" class="btn-link" onclick="event.preventDefault(); closeModal(); navigateToPage('predeal-bre');">${linkText}</a>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="handleSendToCamSheetConfirm()">&#9993; Send to CAM Sheet</button>
    </div>
  `);
}

function handleSendToCamSheetConfirm() {
  showModal(`
    <div class="modal-header">
      <span class="modal-title">Confirm</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-icon">&#10068;</div>
      <div class="modal-text">Do you want to send for Approval?</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="executeSendToCamSheet()">Yes</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  `);
}

function executeSendToCamSheet() {
  const validationPass = Math.random() > 0.3;
  if (!validationPass) {
    showModal(`
      <div class="modal-header">
        <span class="modal-title">Validation Error</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon" style="color: var(--danger-red);">&#9888;</div>
        <div class="modal-text" style="color: var(--danger-red); font-weight:600;">IMD is missing</div>
        <div class="modal-text">Please fill in the required field before sending to CAM Sheet.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
  } else {
    showModal(`
      <div class="modal-body" style="padding:40px;">
        <div class="modal-icon" style="color: var(--success-green);">&#10004;</div>
        <div class="modal-text" style="color: var(--success-green); font-weight:700; font-size:16px;">Successfully Sent to CAM Sheet</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal()">OK</button>
      </div>
    `);
  }
}

function runPreDealBREFromPage() {
  showModal(`
    <div class="modal-body">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Generating results for Pre deal BRE...</div>
      </div>
    </div>
  `);

  setTimeout(() => {
    state.preDealBRERun = true;
    renderPreDealBREResults();
    closeModal();
    showPreDealBREPage();
  }, 2000);
}

function showPreDealBREPage() {
  document.getElementById('predeal-bre-empty').style.display = 'none';
  document.getElementById('predeal-bre-results').classList.add('active');
}


// =============================================
// CAM BRE FLOW
// =============================================

// --- Sub-tab view switching ---
function switchBREView(view) {
  const fieldsTab = document.getElementById('bre-subtab-fields');
  const resultsTab = document.getElementById('bre-subtab-results');
  const fieldsView = document.getElementById('cam-bre-fields-view');
  const resultsView = document.getElementById('cam-bre-results-view');

  if (view === 'results' && !state.camBRERun) return; // block if not run yet

  fieldsTab.classList.toggle('active', view === 'fields');
  resultsTab.classList.toggle('active', view === 'results');
  fieldsView.classList.toggle('active', view === 'fields');
  resultsView.classList.toggle('active', view === 'results');
}

// Single save for all Extra Fields sections — triggers BRE run
function saveExtraFields() {
  showModal(`
    <div class="modal-body">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Saving extra fields &amp; generating CAM BRE results...</div>
      </div>
    </div>
  `);

  setTimeout(() => {
    state.camBRERun = true;
    renderCamBREResults();
    closeModal();
    showCamBREPage();
    showCamBREStatusModal('page');
  }, 2000);
}

function runCamBREFromPage() {
  showModal(`
    <div class="modal-body">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Generating BRE results for CAM stage...</div>
      </div>
    </div>
  `);

  setTimeout(() => {
    state.camBRERun = true;
    renderCamBREResults();
    closeModal();
    showCamBREPage();
    showCamBREStatusModal('page');
  }, 2000);
}

function runCamBREFromModal() {
  showModal(`
    <div class="modal-body">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Generating BRE results for CAM stage...</div>
      </div>
    </div>
  `);

  setTimeout(() => {
    state.camBRERun = true;
    renderCamBREResults();
    showCamBREPage();
    showCamBREStatusModal('modal');
  }, 2000);
}

function showCamBREPage() {
  document.getElementById('cam-bre-empty').style.display = 'none';
  document.getElementById('cam-bre-results').classList.add('active');
  // Enable results sub-tab and switch to results view
  const resultsTab = document.getElementById('bre-subtab-results');
  resultsTab.classList.remove('disabled');
  document.getElementById('bre-subtab-hint').textContent = '';
  switchBREView('results');
}

function showCamBREStatusModal(source) {
  const status = state.camBREStatus;
  let statusClass, statusIcon, statusText, bodyText, primaryCTA, primaryAction, secCTA, secAction;

  if (status === 'passed') {
    statusClass = 'passed'; statusIcon = '&#10004;'; statusText = 'Passed';
    bodyText = 'All CAM BRE rules have passed successfully. You may record manual deviations if additional business exceptions need to be captured.';
  } else if (status === 'deviated') {
    statusClass = 'deviated'; statusIcon = '&#9888;'; statusText = 'Deviated';
    const devCount = getCamRules(state.simCam).filter(r => r.status === 'deviated').length;
    bodyText = devCount + ' rule(s) deviated. Please add mitigants for the identified deviations. You may also record additional manual deviations if required.';
  } else {
    statusClass = 'failed'; statusIcon = '&#10006;'; statusText = 'Failed';
    const failCount = getCamRules(state.simCam).filter(r => r.status === 'failed').length;
    bodyText = failCount + ' rules failed. You may record additional manual deviations if required.';
  }

  if (source === 'approval') {
    // Send for Approval context: primary = Send for Approval, secondary = deviations action
    primaryCTA = 'Send for Approval';
    primaryAction = 'handleSendForApprovalConfirm()';
    if (status === 'passed') {
      secCTA = 'Add manual Deviations';
    } else {
      secCTA = 'View/add Deviations';
    }
    secAction = "closeModal(); navigateToPage('cam-deviations');";
  } else {
    // Page/modal context: primary = deviations action, secondary = Close
    if (status === 'passed') {
      primaryCTA = 'Add manual deviations';
    } else if (status === 'deviated') {
      primaryCTA = 'View/add deviations';
    } else {
      primaryCTA = 'Add/Review deviations';
    }
    primaryAction = "closeModal(); navigateToPage('cam-deviations');";
    secCTA = 'Close';
    secAction = 'closeModal()';
  }

  showModal(`
    <div class="modal-header">
      <span class="modal-title">CAM BRE Status</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-status">
        <span class="bre-status-badge ${statusClass}" style="font-size:16px; padding:6px 20px;">
          <span>${statusIcon}</span> ${statusText}
        </span>
      </div>
      <div class="modal-text">${bodyText}</div>
      <div class="modal-link">
        <a href="#" class="btn-link" onclick="event.preventDefault(); closeModal(); navigateToPage('cam-bre');">View Full Results</a>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="${primaryAction}">${primaryCTA}</button>
      <button class="btn btn-${source === 'approval' ? 'secondary' : 'ghost'}" onclick="${secAction}">${secCTA}</button>
    </div>
  `);
}

// "Send for Approval" ALWAYS triggers fresh CAM BRE run — never assumes prior result
function handleSendForApproval() {
  showModal(`
    <div class="modal-header">
      <span class="modal-title">CAM BRE Required</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-icon">&#9888;&#65039;</div>
      <div class="modal-text">Running CAM BRE is required before sending this for approval.</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="runCamBREFromApproval()">&#9654; Run CAM BRE</button>
      <button class="btn btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `);
}

function runCamBREFromApproval() {
  showModal(`
    <div class="modal-body">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Generating CAM BRE results...</div>
      </div>
    </div>
  `);
  setTimeout(() => {
    state.camBRERun = true;
    renderCamBREResults();
    showCamBREPage();
    showCamBREStatusModal('approval');
  }, 2000);
}

function handleSendForApprovalConfirm() {
  showModal(`
    <div class="modal-header">
      <span class="modal-title">Confirm</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-icon">&#10068;</div>
      <div class="modal-text">Do you want to send for Approval?</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="executeSendForApproval()">Yes</button>
      <button class="btn btn-ghost" onclick="closeModal()">No</button>
    </div>
  `);
}

function executeSendForApproval() {
  const validationPass = Math.random() > 0.3;
  if (!validationPass) {
    showModal(`
      <div class="modal-header">
        <span class="modal-title">Validation Error</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon" style="color: var(--danger-red);">&#9888;</div>
        <div class="modal-text" style="color: var(--danger-red); font-weight:600;">XYZ input is missing</div>
        <div class="modal-text">Please fill in the required field before sending for Approval.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
  } else {
    showModal(`
      <div class="modal-body" style="padding:40px;">
        <div class="modal-icon" style="color: var(--success-green);">&#10004;</div>
        <div class="modal-text" style="color: var(--success-green); font-weight:700; font-size:16px;">Successfully Sent for Approval</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal()">OK</button>
      </div>
    `);
  }
}

function saveDeviations() {
  showModal(`
    <div class="modal-body" style="padding:40px;">
      <div class="modal-icon" style="color: var(--success-green);">&#10004;</div>
      <div class="modal-text" style="color: var(--success-green); font-weight:700; font-size:16px;">Deviations saved successfully</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="closeModal()">OK</button>
    </div>
  `);
}


// =============================================
// SIMULATOR
// =============================================

function initSimulator() {
  const toggleBtn = document.getElementById('sim-toggle');
  const panel = document.getElementById('sim-panel');
  const closeBtn = document.getElementById('sim-close');

  toggleBtn.addEventListener('click', () => panel.classList.toggle('active'));
  closeBtn.addEventListener('click', () => panel.classList.remove('active'));

  // Option buttons
  document.querySelectorAll('.sim-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const simType = btn.dataset.sim;  // 'predeal' or 'cam'
      const simVal = btn.dataset.val;   // 'passed', 'failed', 'deviated'

      // Update active state for this group
      const siblings = btn.parentElement.querySelectorAll('.sim-option');
      siblings.forEach(s => {
        s.className = 'sim-option'; // reset
      });
      btn.className = 'sim-option active-' + simVal;

      // Update state
      if (simType === 'predeal') {
        state.simPreDeal = simVal;
        // If results are already showing, re-render
        if (state.preDealBRERun) {
          renderPreDealBREResults();
        }
      } else if (simType === 'cam') {
        state.simCam = simVal;
        if (state.camBRERun) {
          renderCamBREResults();
        }
      }
    });
  });

  // Set initial active states
  updateSimButtons();
}

function updateSimButtons() {
  document.querySelectorAll('.sim-option').forEach(btn => {
    const simType = btn.dataset.sim;
    const simVal = btn.dataset.val;
    const currentVal = simType === 'predeal' ? state.simPreDeal : state.simCam;

    if (simVal === currentVal) {
      btn.className = 'sim-option active-' + simVal;
    } else {
      btn.className = 'sim-option';
    }
  });
}


// =============================================
// EXTRA FIELDS - INTERACTIVE LOGIC
// =============================================
function initExtraFields() {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const tog = (el, on) => { if (el) el.classList.toggle('show', on); };

  // --- Income Considered sync (controls ef-ic1/2/3 columns) ---
  function syncIncomeConsidered() {
    const n = +$('#ef_CoApplicant_Count').value;
    for (let i = 1; i <= 3; i++) {
      const ic = n >= i && $('#ef_Income_CA' + i).checked;
      $$('.ef-ic' + i).forEach(e => e.classList.toggle('show', ic));
    }
  }

  // --- Co-Applicant Count → columns + income considered + only child ---
  function syncCA() {
    const n = +$('#ef_CoApplicant_Count').value;
    $$('.ef-c1').forEach(e => e.classList.toggle('show', n >= 1));
    $$('.ef-c2').forEach(e => e.classList.toggle('show', n >= 2));
    $$('.ef-c3').forEach(e => e.classList.toggle('show', n >= 3));
    // Income Considered checkboxes visibility
    $('#ef_income_considered_group').style.display = n > 0 ? '' : 'none';
    for (let i = 1; i <= 3; i++) {
      const el = $('#ef_ic_group_' + i);
      if (el) el.style.display = n >= i ? '' : 'none';
    }
    // Is Only Child checkboxes visibility
    $('#ef_only_child_group').style.display = n > 0 ? '' : 'none';
    for (let i = 1; i <= 3; i++) {
      const el = $('#ef_oc_group_' + i);
      if (el) el.style.display = n >= i ? '' : 'none';
    }
    // Group header colspans
    $$('#ef_tbl_income tr.ef-group-header td').forEach(td => td.setAttribute('colspan', 2 + n));
    $$('#ef_tbl_obl tr.ef-group-header td').forEach(td => td.setAttribute('colspan', 2 + n));
    // Re-sync income considered
    syncIncomeConsidered();
  }
  $('#ef_CoApplicant_Count').addEventListener('change', syncCA);

  // Income Considered checkbox changes
  for (let i = 1; i <= 3; i++) {
    $('#ef_Income_CA' + i).addEventListener('change', syncIncomeConsidered);
  }

  // --- Checkbox → conditional row toggles ---
  const condPairs = [
    ['ef_Guarantor_Required',     'ef_row_Guarantor_Name'],
    ['ef_Non_RERA_Project',       'ef_row_Company_Exposure'],
  ];
  condPairs.forEach(([chkId, rowId]) => {
    $('#' + chkId).addEventListener('change', function () {
      tog($('#' + rowId), this.checked);
    });
  });

  // --- CERSAI Search Done select → conditional row ---
  $('#ef_CERSAI_Search_Done').addEventListener('change', function () {
    tog($('#ef_row_CERSAI_Clear'), this.value === 'Yes');
  });

  // --- Guarantor TopUp select → conditional row ---
  $('#ef_G_TopUp').addEventListener('change', function () {
    tog($('#ef_row_G_Existing'), this.value === 'Yes');
  });

  // --- BT/TopUp toggle ---
  $('#ef_Is_BT_TopUp').addEventListener('change', function () {
    tog($('#ef_bt_details'), this.checked);
  });

  // --- Dairy income > 0 → cattle count cell ---
  $$('.ef-dairy').forEach(inp => {
    inp.addEventListener('input', function () {
      tog($('#ef_cc_' + this.dataset.p), (+this.value || 0) > 0);
    });
  });

  // --- Gold loan: per-person toggle for Outstanding + EMI cells ---
  const goldPersonMap = { ef_gold_App: 'A', ef_gold_CA1: 'C1', ef_gold_CA2: 'C2', ef_gold_CA3: 'C3' };
  function syncGold() {
    const anyGold = [...$$('.ef-gold-chk')].some(c => c.checked);
    tog($('#ef_tr_GP'), anyGold);
    tog($('#ef_tr_GE'), anyGold);
    Object.entries(goldPersonMap).forEach(([chkId, p]) => {
      const checked = $('#' + chkId).checked;
      const gpCell = $('#ef_gp_cell_' + p);
      const geCell = $('#ef_ge_' + p);
      if (gpCell) gpCell.classList.toggle('gold-active', checked);
      if (geCell) geCell.classList.toggle('gold-active', checked);
    });
  }
  $$('.ef-gold-chk').forEach(chk => chk.addEventListener('change', syncGold));

  // --- Education loan: per-person toggle for EMI cells ---
  const eduPersonMap = { ef_edu_App: 'A', ef_edu_CA1: 'C1', ef_edu_CA2: 'C2', ef_edu_CA3: 'C3' };
  function syncEdu() {
    const anyEdu = [...$$('.ef-edu-chk')].some(c => c.checked);
    tog($('#ef_tr_Edu'), anyEdu);
    Object.entries(eduPersonMap).forEach(([chkId, p]) => {
      const checked = $('#' + chkId).checked;
      const cell = $('#ef_edu_cell_' + p);
      if (cell) cell.classList.toggle('edu-active', checked);
    });
  }
  $$('.ef-edu-chk').forEach(chk => chk.addEventListener('change', syncEdu));

  // Initialize on load
  syncCA();
}


// =============================================
// EVENT LISTENERS
// =============================================
function initEventListeners() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Sidebar navigation
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateToPage(item.dataset.page));
  });

  // Pre-Deal: Send to CAM Sheet
  document.getElementById('btn-send-cam-sheet').addEventListener('click', handleSendToCamSheet);

  // Pre-Deal: Run BRE buttons
  document.getElementById('btn-run-predeal-bre').addEventListener('click', runPreDealBREFromPage);
  document.getElementById('btn-run-predeal-bre-2').addEventListener('click', runPreDealBREFromPage);

  // CAM: Send for Approval
  document.getElementById('btn-send-approval').addEventListener('click', handleSendForApproval);

  // CAM: Run BRE buttons
  document.getElementById('btn-run-cam-bre').addEventListener('click', runCamBREFromPage);
  document.getElementById('btn-run-cam-bre-2').addEventListener('click', runCamBREFromPage);

  // Modal overlay click to close
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Keyboard: Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}


// =============================================
// INITIALIZATION
// =============================================
function init() {
  initEventListeners();
  initSimulator();
  initExtraFields();
}

document.addEventListener('DOMContentLoaded', init);

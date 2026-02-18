/* ============================================
   OMNIFIN DIGITAL LOS - PROTOTYPE LOGIC v4
   Navigation, BRE Flows, Simulator, Dynamic Results
   ============================================ */

// =============================================
// STATE
// =============================================
const state = {
  currentTab: 'cam',
  currentPredealPage: 'predeal-source',
  currentCamPage: 'cam-personal',
  preDealBRERun: false,
  preDealBREStatus: null,       // null | 'passed' | 'failed'
  camBRERun: false,
  camBREStatus: null,           // null | 'passed' | 'failed' | 'deviated'
  lastBRERunTime: null,
  camSheetLastUpdated: null,
  extraFieldsSaved: false,
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
  // Guard: Block navigation to Deviations if BRE hasn't been run
  if (pageId === 'cam-deviations' && !state.camBRERun) {
    showModal(`
      <div class="modal-header">
        <span class="modal-title">BRE Required</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon">&#9888;&#65039;</div>
        <div class="modal-text">You must run the CAM BRE before adding deviations to this application.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal(); runCamBREFromPage();">Run CAM BRE</button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
    return;
  }

  const tab = state.currentTab;
  const sidebar = document.getElementById('sidebar-' + tab);
  sidebar.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === pageId));
  document.querySelectorAll('.content-panel').forEach(cp => cp.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  if (tab === 'predeal') state.currentPredealPage = pageId;
  else if (tab === 'cam') state.currentCamPage = pageId;

  // Render BRE data when navigating to deviations page
  if (pageId === 'cam-deviations') {
    renderBREDataOnDeviationsPage();
  }
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

// --- CAM BRE Results (status computation only — results sub-view removed in v2) ---
function renderCamBREResults() {
  const variation = state.simCam;
  const rules = getCamRules(variation);

  const failed = rules.filter(r => r.status === 'failed');
  const deviated = rules.filter(r => r.status === 'deviated');

  let overallStatus;
  if (failed.length > 0) overallStatus = 'failed';
  else if (deviated.length > 0) overallStatus = 'deviated';
  else overallStatus = 'passed';

  state.camBREStatus = overallStatus;

  // Update BRE data on deviations page if visible
  renderBREDataOnDeviationsPage();
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

// =============================================
// EXTRA FIELDS VALIDATION
// =============================================

function validateExtraFields() {
  const missing = [];
  const $ = s => document.querySelector(s);
  const n = +$('#ef_CoApplicant_Count').value;

  // Check key income fields
  const netIncome = $('#ef_I_Net_A');
  if (netIncome && (!netIncome.value || +netIncome.value === 0)) missing.push('Net Business / Salary (Applicant)');

  // Check Residual Life
  const residual = $('#ef_Residual_Life_Years');
  if (residual && (!residual.value || +residual.value === 0)) missing.push('Residual Life (Years)');

  // Check Wilful Defaulter fields
  const wdApp = $('#ef_WD_App');
  if (wdApp && !wdApp.value) missing.push('Wilful Defaulter (Applicant)');

  // Check CERSAI
  const cersai = $('#ef_CERSAI_Search_Done');
  if (cersai && cersai.value === 'Yes') {
    const cersaiClear = $('#ef_CERSAI_Clear');
    if (cersaiClear && !cersaiClear.value) missing.push('CERSAI Clear');
  }

  return missing;
}

// LOS compulsory input fields validation (simulated)
function validateLOSFields() {
  const missing = [];
  // Simulate checking LOS fields — in production, these would come from the actual LOS data
  // For prototype: randomly pass or check a few fields from the CAM sheet
  return missing;
}

// Save Extra Fields only — does NOT run BRE
function saveExtraFields() {
  const missingFields = validateExtraFields();
  if (missingFields.length > 0) {
    const fieldList = missingFields.map(f => '<li>' + f + '</li>').join('');
    showModal(`
      <div class="modal-header">
        <span class="modal-title">Extra Fields Missing</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon" style="color: var(--warning-orange);">&#9888;</div>
        <div class="modal-text" style="text-align:left;">Some extra fields are missing. Please fill them and then proceed.<ul style="margin-top:8px; padding-left:20px;">${fieldList}</ul></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
    return;
  }

  // Save fields
  showModal(`
    <div class="modal-body">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Saving extra fields...</div>
      </div>
    </div>
  `);

  setTimeout(() => {
    state.extraFieldsSaved = true;
    showModal(`
      <div class="modal-header">
        <span class="modal-title">Saved</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon" style="color: var(--success-green);">&#10004;</div>
        <div class="modal-text" style="color: var(--success-green); font-weight:600;">Extra fields saved successfully. You can now run CAM BRE.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal(); runCamBREFromPage();">Run CAM BRE</button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
  }, 1200);
}

// Run CAM BRE from page button — checks extra fields saved first
function runCamBREFromPage() {
  if (!state.extraFieldsSaved) {
    showModal(`
      <div class="modal-header">
        <span class="modal-title">Extra Fields Required</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon" style="color: var(--warning-orange);">&#9888;</div>
        <div class="modal-text">Some extra fields are missing. Please fill them and then proceed.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
    return;
  }

  // Check LOS compulsory fields
  const losMissing = validateLOSFields();
  if (losMissing.length > 0) {
    const fieldList = losMissing.map(f => '<li>' + f + '</li>').join('');
    showModal(`
      <div class="modal-header">
        <span class="modal-title">Input Fields Missing</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon" style="color: var(--warning-orange);">&#9888;</div>
        <div class="modal-text" style="text-align:left;">Some Input fields are missing:<ul style="margin-top:8px; padding-left:20px;">${fieldList}</ul></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
    return;
  }

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
    state.lastBRERunTime = Date.now();
    state.camSheetLastUpdated = null;
    renderCamBREResults();
    closeModal();
    showCamBREStatusModal('page');
  }, 2000);
}

function showCamBREStatusModal(source) {
  const status = state.camBREStatus;
  const rules = getCamRules(state.simCam);
  const failedCount = rules.filter(r => r.status === 'failed').length;
  const deviatedCount = rules.filter(r => r.status === 'deviated').length;

  let statusClass, statusIcon, statusText, bodyText, primaryCTA, primaryAction, secCTA, secAction;

  if (status === 'passed') {
    statusClass = 'passed'; statusIcon = '&#10004;'; statusText = 'Passed';
    bodyText = 'All CAM BRE rules have passed successfully.<br>You may record manual deviations if additional business exceptions need to be captured.';
    primaryCTA = 'Add manual deviations';
    primaryAction = "closeModal(); navigateToPage('cam-deviations');";
    secCTA = 'Close';
    secAction = 'closeModal()';
  } else if (status === 'deviated') {
    statusClass = 'deviated'; statusIcon = '&#9888;'; statusText = 'Deviated';
    bodyText = deviatedCount + ' rule(s) deviated. Please add mitigants and remarks for the identified deviations. You may also record additional manual deviations if required.';
    primaryCTA = 'View/add deviations';
    primaryAction = "closeModal(); navigateToPage('cam-deviations');";
    secCTA = 'Close';
    secAction = 'closeModal()';
  } else {
    statusClass = 'failed'; statusIcon = '&#10006;'; statusText = 'Failed';
    bodyText = failedCount + ' rule(s) Failed. This application is not eligible for submission. To proceed, please update the required fields and re-run the BRE, or reject the case.';
    primaryCTA = 'View Failed rules';
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
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="${primaryAction}">${primaryCTA}</button>
      <button class="btn btn-ghost" onclick="${secAction}">${secCTA}</button>
    </div>
  `);
}

// Send for Approval — 4-case flow with staleness detection
function handleSendForApproval() {
  // Case 0: BRE never ran — offer to run inline
  if (!state.camBRERun) {
    showModal(`
      <div class="modal-header">
        <span class="modal-title">CAM BRE Required</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon">&#9888;&#65039;</div>
        <div class="modal-text">You must run the CAM BRE before sending CAM Sheet for approval.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal(); runCamBREFromPage();">Run CAM BRE</button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
    return;
  }

  // Case 3: Fields updated after last BRE run
  if (state.camSheetLastUpdated !== null && state.camSheetLastUpdated >= state.lastBRERunTime) {
    showModal(`
      <div class="modal-header">
        <span class="modal-title">BRE Re-run Required</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon">&#9888;&#65039;</div>
        <div class="modal-text">Some fields were updated recently after the BRE was run. Please re-run the BRE.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal(); runCamBREFromPage();">Re-run CAM BRE</button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
    return;
  }

  // Case: BRE failed — block submission
  if (state.camBREStatus === 'failed') {
    const rules = getCamRules(state.simCam);
    const failedCount = rules.filter(r => r.status === 'failed').length;
    showModal(`
      <div class="modal-header">
        <span class="modal-title">CAM BRE Status</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-status">
          <span class="bre-status-badge failed" style="font-size:16px; padding:6px 20px;">
            <span>&#10006;</span> Failed
          </span>
        </div>
        <div class="modal-text">${failedCount} rule(s) Failed. This application is not eligible for submission. You can update the required fields and re-run the BRE, or reject the case.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal(); navigateToPage('cam-deviations');">View Failed Rules</button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
    return;
  }

  // Case 1: Ticked deviations missing mitigants/remarks
  {
    const devErrors = getDeviationValidationErrors();
    if (devErrors.length > 0) {
      showModal(`
        <div class="modal-header">
          <span class="modal-title">Deviations Incomplete</span>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-icon">&#9888;&#65039;</div>
          <div class="modal-text">Please add mitigants and remarks for deviations to proceed.</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModal(); navigateToPage('cam-deviations');">Go to Deviations</button>
          <button class="btn btn-ghost" onclick="closeModal()">Close</button>
        </div>
      `);
      return;
    }
  }

  // Case 2: All clear — confirm
  showModal(`
    <div class="modal-header">
      <span class="modal-title">Confirm</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-icon">&#10068;</div>
      <div class="modal-text">Do you want to send this CAM Sheet for approval?</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="executeSendForApproval()">Yes</button>
      <button class="btn btn-ghost" onclick="closeModal()">No</button>
    </div>
  `);
}

function executeSendForApproval() {
  showModal(`
    <div class="modal-body" style="padding:40px;">
      <div class="modal-icon" style="color: var(--success-green);">&#10004;</div>
      <div class="modal-text" style="color: var(--success-green); font-weight:700; font-size:16px;">CAM Sheet Successfully Sent for approval!</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="closeModal()">Close</button>
    </div>
  `);
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
// BRE DATA ON DEVIATIONS PAGE
// =============================================

function renderBREDataOnDeviationsPage() {
  renderBRESummaryOnDeviationsPage();
  renderFailedRulesOnDeviationsPage();
  renderBREIdentifiedDeviations();
}

function renderBRESummaryOnDeviationsPage() {
  const container = document.getElementById('bre-summary-section');
  if (!container) return;

  if (!state.camBRERun) {
    container.innerHTML = '';
    return;
  }

  const status = state.camBREStatus;
  const statusClass = status === 'passed' ? 'passed' : status === 'deviated' ? 'deviated' : 'failed';
  const statusIcon = status === 'passed' ? '&#10004;' : status === 'deviated' ? '&#9888;' : '&#10006;';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  container.innerHTML = `<span class="bre-status-badge ${statusClass}" style="font-size: 12px; padding: 3px 12px;">${statusIcon} ${statusText}</span>`;
}

function renderFailedRulesOnDeviationsPage() {
  const container = document.getElementById('bre-failed-rules-section');
  if (!container) return;

  if (!state.camBRERun) {
    container.innerHTML = '';
    return;
  }

  const rules = getCamRules(state.simCam);
  const failed = rules.filter(r => r.status === 'failed');

  if (failed.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="deviation-section">
      <div class="deviation-section-title" style="color: #c62828;">Failed Rules <span class="count-badge fail" style="color:#fff; font-size:10px; padding:1px 8px; border-radius:10px;">${failed.length}</span></div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Block Name</th><th>Rule Name</th><th>Actual Value</th><th>Threshold</th></tr></thead>
          <tbody>
            ${failed.map(r => `<tr>
              <td>${r.block}</td><td>${r.name}</td>
              <td class="text-danger fw-bold">${r.actual}</td><td>${r.threshold}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBREIdentifiedDeviations() {
  const section = document.getElementById('bre-identified-deviations-section');
  const tbody = document.getElementById('bre-identified-deviations-tbody');
  if (!tbody) return;

  if (!state.camBRERun) {
    if (section) section.style.display = 'none';
    return;
  }

  const deviated = getCamRules(state.simCam).filter(r => r.status === 'deviated');

  if (deviated.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }

  if (section) section.style.display = '';

  // Block abbreviation map for ID generation
  const blockAbbrev = {
    'Bureau & Credit': 'B',
    'LTV': 'L',
    'FOIR': 'F',
    'Income & Employment': 'I',
    'Age Eligibility': 'A',
    'Loan Parameters': 'P',
    'Tenure': 'T',
    'Property': 'R',
    'Co-Applicant & Guarantor': 'G',
    'Residence Stability': 'S'
  };

  // Count per prefix for sequential IDs
  const counters = {};
  tbody.innerHTML = deviated.map(r => {
    const prefix = blockAbbrev[r.block] || r.block.charAt(0).toUpperCase();
    counters[prefix] = (counters[prefix] || 0) + 1;
    const id = prefix + String(counters[prefix]).padStart(3, '0');
    return `<tr class="frozen-row">
      <td class="cell-center"><input type="checkbox" checked disabled></td>
      <td>${id}</td>
      <td>${r.devRule || r.name}</td>
      <td class="cell-center">${r.devLevel || '-'}</td>
      <td><input type="text" value="${r.actual}" readonly style="background:#f5f5f5; border-color:#e0e0e0;"></td>
      <td><input type="text" value="" placeholder=""></td>
      <td><input type="text" value="" placeholder=""></td>
    </tr>`;
  }).join('');
}


// =============================================
// MANUAL DEVIATION ROW
// =============================================

function addManualDeviationRow() {
  const tbody = document.getElementById('manual-deviations-tbody');
  if (!tbody) return;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="cell-center"><input type="checkbox"></td>
    <td><input type="text" placeholder="ID"></td>
    <td><input type="text" placeholder="Rule Description"></td>
    <td><input type="text" placeholder="L" style="width:40px; text-align:center;"></td>
    <td><input type="text" placeholder="Actual Value"></td>
    <td><input type="text" placeholder="Justification/Mitigants"></td>
    <td><input type="text" placeholder="Remarks"></td>
  `;
  tbody.appendChild(row);
}


// =============================================
// DEVIATION VALIDATION
// =============================================

function getDeviationValidationErrors() {
  const errors = [];
  const deviationsPage = document.getElementById('page-cam-deviations');
  if (!deviationsPage) return errors;

  const rows = deviationsPage.querySelectorAll('table.data-table tbody tr');
  rows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked) {
      const inputs = row.querySelectorAll('input[type="text"]');
      if (inputs.length >= 3) {
        // Last two text inputs are Justification/Mitigants and Remarks
        const justification = inputs[inputs.length - 2].value.trim();
        const remarks = inputs[inputs.length - 1].value.trim();
        if (!justification || !remarks) {
          errors.push(row);
        }
      }
    }
  });
  return errors;
}


// =============================================
// CAM SHEET CHANGE TRACKING
// =============================================

function initCamSheetChangeTracking() {
  // Track changes on all CAM sheet pages and extra fields
  const camPages = document.querySelectorAll('[id^="page-cam-"]');
  camPages.forEach(page => {
    // Skip the deviations page — changes there shouldn't trigger staleness
    if (page.id === 'page-cam-deviations') return;
    page.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('change', () => { state.camSheetLastUpdated = Date.now(); });
      if (field.tagName !== 'SELECT') {
        field.addEventListener('input', () => { state.camSheetLastUpdated = Date.now(); });
      }
    });
  });
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
// EXTRA FIELDS - DEFAULT VALUES (pre-fill for prototype)
// =============================================
function prefillExtraFields() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const chk = (id, on) =>  { const el = document.getElementById(id); if (el) el.checked = on; };

  // Income (Monthly) — Applicant
  set('ef_I_Net_A', 85000);
  set('ef_I_Inc_A', 5000);
  set('ef_I_Bon_A', 12000);
  set('ef_I_Pen_A', 0);
  set('ef_I_Alw_A', 3000);
  set('ef_I_Ren_A', 15000);
  set('ef_I_Dai_A', 0);
  set('ef_I_Tui_A', 0);
  set('ef_I_PT_A', 0);

  // Income — Co-applicant 1
  set('ef_I_Net_C1', 45000);
  set('ef_I_Inc_C1', 0);
  set('ef_I_Bon_C1', 6000);
  set('ef_I_Pen_C1', 0);
  set('ef_I_Alw_C1', 0);
  set('ef_I_Ren_C1', 0);
  set('ef_I_Dai_C1', 0);
  set('ef_I_Tui_C1', 0);
  set('ef_I_PT_C1', 0);

  // Income — Co-applicant 2
  set('ef_I_Net_C2', 32000);
  set('ef_I_Inc_C2', 0);
  set('ef_I_Bon_C2', 0);
  set('ef_I_Pen_C2', 0);
  set('ef_I_Alw_C2', 0);
  set('ef_I_Ren_C2', 0);
  set('ef_I_Dai_C2', 0);
  set('ef_I_Tui_C2', 0);
  set('ef_I_PT_C2', 0);

  // Obligations (Monthly)
  set('ef_O_EMI_A', 8500);
  set('ef_O_EMI_C1', 4000);
  set('ef_O_EMI_C2', 0);
  set('ef_O_CC_A', 25000);
  set('ef_O_CC_C1', 10000);
  set('ef_O_CC_C2', 0);

  // Property & CERSAI
  set('ef_Residual_Life_Years', 35);
  set('ef_CERSAI_Search_Done', 'Yes');
  set('ef_CERSAI_Clear', 'Yes');

  // Verification — check all visit/verified boxes for applicant
  chk('ef_Res_Visit_App', true);
  chk('ef_Office_Visit_App', true);
  chk('ef_Emp_Verified_App', true);
  chk('ef_Emp_Photos_App', true);
  chk('ef_Res_Visit_CA1', true);
  chk('ef_Office_Visit_CA1', true);
  chk('ef_Emp_Verified_CA1', true);
  chk('ef_Emp_Photos_CA1', true);
  chk('ef_Res_Visit_CA2', true);
}

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
    ['ef_Firm_Income_Considered', 'ef_row_All_Partners'],
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

  // --- Gold loan per-person: if ANY checked → show Gold POS + EMI rows ---
  $$('.ef-gold-chk').forEach(chk => {
    chk.addEventListener('change', function () {
      const anyGold = [...$$('.ef-gold-chk')].some(c => c.checked);
      tog($('#ef_tr_GP'), anyGold);
      tog($('#ef_tr_GE'), anyGold);
    });
  });

  // --- Gold POS > 0 → gold EMI cell (per person) ---
  $$('.ef-gp').forEach(inp => {
    inp.addEventListener('input', function () {
      tog($('#ef_ge_' + this.dataset.p), (+this.value || 0) > 0);
    });
  });

  // --- Education loan per-person: if ANY checked → show Education EMI row ---
  $$('.ef-edu-chk').forEach(chk => {
    chk.addEventListener('change', function () {
      const anyEdu = [...$$('.ef-edu-chk')].some(c => c.checked);
      tog($('#ef_tr_Edu'), anyEdu);
    });
  });

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

  // CAM: Run BRE button
  document.getElementById('btn-run-cam-bre').addEventListener('click', runCamBREFromPage);

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
  prefillExtraFields();
  initExtraFields();
  initCamSheetChangeTracking();
  // Open directly on CAM Sheet tab
  switchTab('cam');
}

document.addEventListener('DOMContentLoaded', init);

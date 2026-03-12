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

// --- Pre-Deal Rules (No deviations -- only Passed or Failed) ---
const preDealAllRules = [
  { block: 'Bureau & Credit', name: 'Bureau Score - Applicant', actual: '720', threshold: '>= 650', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Score - Co-Applicant', actual: '620', threshold: '>= 650', passStatus: 'passed', failStatus: 'deviated' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Applicant', actual: 'Rs. 0', threshold: 'No overdue', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Co-Applicant', actual: 'Rs. 0', threshold: 'No overdue', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Co-Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Min Age - Applicant', actual: '32 years', threshold: '>= 21 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Max Age at Maturity - Applicant', actual: '52 years', threshold: '<= 60 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Min Age - Co-Applicant', actual: '29 years', threshold: '>= 21 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Max Age at Maturity - Co-Applicant', actual: '49 years', threshold: '<= 70 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Applicant Is Income Earner', actual: 'Yes', threshold: 'Required', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Minimum Monthly Income', actual: '\u20B912,000', threshold: '>= \u20B915,000', passStatus: 'passed', failStatus: 'failed' },
  { block: 'Income & Employment', name: 'Current Employment Vintage', actual: '8 months', threshold: '>= 1 year', passStatus: 'passed', failStatus: 'failed' },
  { block: 'Income & Employment', name: 'Total Employment Experience', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Minimum Loan Amount', actual: '\u20B925,00,000', threshold: '>= \u20B91,00,000', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Maximum Customer Exposure', actual: '\u20B925,00,000', threshold: '<= \u20B91,00,00,000', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Product Eligibility', actual: 'Eligible', threshold: 'Eligible', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Max Loans per Property', actual: '1', threshold: '<= 2', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Tenure', name: 'Minimum Tenure', actual: '240 months', threshold: '>= 12 months', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Tenure', name: 'Maximum Tenure', actual: '20 years', threshold: '<= 25 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Co-Applicant Mandatory', actual: 'Present', threshold: 'Required', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Bureau Score', actual: '710', threshold: '>= 650', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Wilful Defaulter', actual: 'No', threshold: 'Not WD', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Age', actual: '45 years', threshold: '18-70 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Residence Stability', name: 'Duration in Current City', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Residence Stability', name: 'Duration at Current Residence', actual: '3 years', threshold: '>= 6 months', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Property & Sanctioning', name: 'Third Dwelling Unit Check', actual: '1st unit', threshold: '<= 2 units', passStatus: 'passed', failStatus: 'passed' },
  { block: 'Property & Sanctioning', name: 'Branch Sanctioning Limit', actual: '\u20B925,00,000', threshold: '<= \u20B950,00,000', passStatus: 'passed', failStatus: 'passed' },
];

// --- CAM Rules ---
const camAllRules = [
  { block: 'Bureau & Credit', name: 'Bureau Score - Applicant', actual: '720', threshold: '>= 650', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Score - Co-Applicant', actual: '620', threshold: '>= 650', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L3', devRule: 'Bureau score > 0 and < 650' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Applicant', actual: 'Rs. 0', threshold: 'No overdue', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Bureau Overdue - Co-Applicant', actual: 'Rs. 8,000', threshold: 'No overdue', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L2', devRule: 'Overdue up to Rs. 10,000' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Bureau & Credit', name: 'Wilful Defaulter - Co-Applicant', actual: 'No', threshold: 'Not WD', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Min Age - Applicant', actual: '32 years', threshold: '>= 21 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Max Age at Maturity - Applicant', actual: '52 years', threshold: '<= 60 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Age Eligibility', name: 'Age - Co-Applicant', actual: '29 years', threshold: '21-70 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Applicant Is Income Earner', actual: 'Yes', threshold: 'Required', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Minimum Monthly Income', actual: '\u20B972,000', threshold: '>= \u20B915,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'failed' },
  { block: 'Income & Employment', name: 'Current Employment Vintage', actual: '2.5 years', threshold: '>= 1 year', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Income & Employment', name: 'Total Employment Experience', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Minimum Loan Amount', actual: '\u20B925,00,000', threshold: '>= \u20B91,00,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Maximum Customer Exposure', actual: '\u20B925,00,000', threshold: '<= \u20B91,00,00,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Branch Sanctioning Limit', actual: '\u20B925,00,000', threshold: '<= \u20B950,00,000', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Loan Parameters', name: 'Max Loans per Property', actual: '1', threshold: '<= 2', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'LTV', name: 'LTV - Policy Limit', actual: '83%', threshold: '<= 80%', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L3', devRule: 'LTV exceeds policy by up to 5%' },
  { block: 'LTV', name: 'LTV - Regulatory Limit', actual: '83%', threshold: '<= 90%', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'failed' },
  { block: 'LTV', name: 'LTV - Property Type', actual: 'Residential', threshold: 'Allowed types', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'FOIR', name: 'FOIR Check', actual: '53%', threshold: '<= 50%', passStatus: 'passed', deviatedStatus: 'deviated', failStatus: 'deviated', devLevel: 'L3', devRule: 'FOIR exceeds limit by up to 5%' },
  { block: 'FOIR', name: 'FOIR - Net Income Basis', actual: '53%', threshold: '<= 65%', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'FOIR', name: 'FOIR - Combined Income', actual: '38%', threshold: '<= 60%', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Tenure', name: 'Minimum Tenure', actual: '240 months', threshold: '>= 12 months', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Tenure', name: 'Maximum Tenure', actual: '20 years', threshold: '<= 25 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Property', name: 'Minimum Carpet Area', actual: '850 sq ft', threshold: '>= 270 sq ft', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Property', name: 'Property Age', actual: '42 years', threshold: '<= 40 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'failed' },
  { block: 'Property', name: 'CERSAI Check', actual: 'Clear', threshold: 'Clear', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Co-Applicant Mandatory', actual: 'Present', threshold: 'Required', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Co-Applicant & Guarantor', name: 'Guarantor Bureau Score', actual: '710', threshold: '>= 650', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Residence Stability', name: 'Duration in Current City', actual: '5 years', threshold: '>= 2 years', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
  { block: 'Residence Stability', name: 'Duration at Current Residence', actual: '3 years', threshold: '>= 6 months', passStatus: 'passed', deviatedStatus: 'passed', failStatus: 'passed' },
];


// =============================================
// HELPER: Get rules for a given variation
// =============================================
function getPreDealRules(variation) {
  const statusKey = variation === 'passed' ? 'passStatus' : 'failStatus';
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
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <span style="font-size:14px; font-weight:600;">Overall BRE Status:</span>
      <span class="bre-status-badge ${overallStatus}" style="font-size:14px; padding:5px 16px;">
        <span>${statusIcon}</span> ${statusText}
      </span>
      <span style="font-size:11px; color:#999; margin-left:8px;">Last run: ${getCurrentTimestamp()}</span>
    </div>
    <div class="summary-cards" style="grid-template-columns: repeat(3, 1fr);">
      <div class="summary-card total"><div class="card-value">${total}</div><div class="card-label">Total Applicable Rules</div></div>
      <div class="summary-card passed"><div class="card-value">${passed.length}</div><div class="card-label">Total Passed</div></div>
      <div class="summary-card failed"><div class="card-value">${failed.length}</div><div class="card-label">Total Failed</div></div>
    </div>
    ${renderFailedTable(failed)}
    ${renderPassedTable(passed)}
  `;
}

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
  renderBREDataOnDeviationsPage();
}


// =============================================
// PRE-DEAL BRE FLOW
// =============================================

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
// EXTRA FIELDS VALIDATION (v4 - accordion/toggle)
// =============================================

function validateExtraFields() {
  const missing = [];
  const getVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  if (!getVal('ef_INP_132')) missing.push('Scheme');

  const salary = getVal('ef_INP_028_A');
  if (!salary || +salary === 0) missing.push('Applicant Core Salary / Business Income');

  const residual = getVal('ef_INP_182');
  if (!residual || +residual === 0) missing.push('Estimated Residual Life (Years)');

  return missing;
}

// LOS compulsory input fields validation (simulated)
function validateLOSFields() {
  const missing = [];
  return missing;
}

// Save Extra Fields only -- does NOT run BRE
function saveExtraFields() {
  const missingFields = validateExtraFields();
  if (missingFields.length > 0) {
    const fieldList = missingFields.map(f => '<li>' + f + '</li>').join('');
    showModal(`
      <div class="modal-header">
        <span class="modal-title">Fields Missing</span>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-icon" style="color: var(--warning-orange);">&#9888;</div>
        <div class="modal-text" style="text-align:left;">Some required fields are missing. Please fill them and then proceed.<ul style="margin-top:8px; padding-left:20px;">${fieldList}</ul></div>
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
        <div class="loading-text">Saving all fields...</div>
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
        <div class="modal-text" style="color: var(--success-green); font-weight:600;">All fields saved successfully. You can now run CAM BRE.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal(); runCamBREFromPage();">Run CAM BRE</button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    `);
  }, 1200);
}

// Run CAM BRE from page button
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

// Send for Approval
function handleSendForApproval() {
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
  if (!state.camBRERun) { container.innerHTML = ''; return; }
  const status = state.camBREStatus;
  const statusClass = status === 'passed' ? 'passed' : status === 'deviated' ? 'deviated' : 'failed';
  const statusIcon = status === 'passed' ? '&#10004;' : status === 'deviated' ? '&#9888;' : '&#10006;';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  container.innerHTML = `<span class="bre-status-badge ${statusClass}" style="font-size: 12px; padding: 3px 12px;">${statusIcon} ${statusText}</span>`;
}

function renderFailedRulesOnDeviationsPage() {
  const container = document.getElementById('bre-failed-rules-section');
  if (!container) return;
  if (!state.camBRERun) { container.innerHTML = ''; return; }
  const rules = getCamRules(state.simCam);
  const failed = rules.filter(r => r.status === 'failed');
  if (failed.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = `
    <div class="deviation-section">
      <div class="deviation-section-title" style="color: #c62828;">Failed Rules <span class="count-badge fail" style="color:#fff; font-size:10px; padding:1px 8px; border-radius:10px;">${failed.length}</span></div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Block Name</th><th>Rule Name</th><th>Actual Value</th><th>Threshold</th></tr></thead>
          <tbody>
            ${failed.map(r => `<tr><td>${r.block}</td><td>${r.name}</td><td class="text-danger fw-bold">${r.actual}</td><td>${r.threshold}</td></tr>`).join('')}
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
  if (!state.camBRERun) { if (section) section.style.display = 'none'; return; }
  const deviated = getCamRules(state.simCam).filter(r => r.status === 'deviated');
  if (deviated.length === 0) { if (section) section.style.display = 'none'; return; }
  if (section) section.style.display = '';

  const blockAbbrev = {
    'Bureau & Credit': 'B', 'LTV': 'L', 'FOIR': 'F', 'Income & Employment': 'I',
    'Age Eligibility': 'A', 'Loan Parameters': 'P', 'Tenure': 'T', 'Property': 'R',
    'Co-Applicant & Guarantor': 'G', 'Residence Stability': 'S'
  };
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
        const justification = inputs[inputs.length - 2].value.trim();
        const remarks = inputs[inputs.length - 1].value.trim();
        if (!justification || !remarks) { errors.push(row); }
      }
    }
  });
  return errors;
}


// =============================================
// CAM SHEET CHANGE TRACKING
// =============================================

function initCamSheetChangeTracking() {
  const camPages = document.querySelectorAll('[id^="page-cam-"]');
  camPages.forEach(page => {
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

  document.querySelectorAll('.sim-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const simType = btn.dataset.sim;
      const simVal = btn.dataset.val;
      const siblings = btn.parentElement.querySelectorAll('.sim-option');
      siblings.forEach(s => { s.className = 'sim-option'; });
      btn.className = 'sim-option active-' + simVal;
      if (simType === 'predeal') {
        state.simPreDeal = simVal;
        if (state.preDealBRERun) { renderPreDealBREResults(); }
      } else if (simType === 'cam') {
        state.simCam = simVal;
        if (state.camBRERun) { renderCamBREResults(); }
      }
    });
  });

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
// ACCORDION TOGGLE
// =============================================
function toggleAccordion(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('collapsed');
}

function togglePersonCard(el) {
  const card = el.closest('.ef-person-card');
  if (card) card.classList.toggle('collapsed');
}

// =============================================
// EXTRA FIELDS - DEFAULT VALUES (pre-fill for prototype v4)
// =============================================
function prefillExtraFields() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  // Case Setup (SIM)
  set('ef_INP_132', 'HOME LOAN');
  set('ef_CoApplicant_Count', '2');
  set('ef_Guarantor_Count', '0');

  // Applicant Profile
  set('ef_INP_016_A', 'Normal');

  // Applicant Credit
  set('ef_INP_015_A', 'No');
  set('ef_INP_018_A', 'No');
  set('ef_INP_222_A', 'No');
  set('ef_INP_223_A', 'No');

  // Applicant Employment
  set('ef_INP_008_A', '96');
  set('ef_INP_009_A', 'No');
  set('ef_INP_010_A', 'No');
  set('ef_INP_010B_A', 'No');
  set('ef_INP_012_A', '8');

  // Applicant Exposure & Verification
  set('ef_INP_019_A', '0');
  set('ef_INP_020_A', '0');
  set('ef_INP_021_A', 'Yes');
  set('ef_INP_024_A', 'Yes');
  set('ef_INP_136_A', '8500');
  set('ef_INP_025_A', 'Yes');
  set('ef_INP_026_A', 'Yes');
  // Applicant Income
  set('ef_INP_028_A', '85000');
  set('ef_INP_029_A', '5000');
  set('ef_INP_030_A', '3000');
  set('ef_INP_031_A', '12000');
  set('ef_INP_032_A', '0');
  set('ef_INP_033_A', '15000');
  set('ef_INP_034_A', '0');
  set('ef_INP_035_A', '0');
  set('ef_INP_036_A', '0');

  // Loan & Obligations
  set('ef_INP_160', '0');
  set('ef_INP_144', 'No');

  // Property
  set('ef_INP_182', '35');
  set('ef_INP_168', '0');
  set('ef_INP_171', '60');
  set('ef_INP_174', 'Self-Occupied');
  set('ef_INP_163', 'Freehold');
  set('ef_INP_165', 'Clear');
  set('ef_INP_170', 'Self-Occupation');
  set('ef_INP_167', 'No');

  // BT (hidden by default since scheme is HOME LOAN)
  set('ef_INP_147', '0');
  set('ef_INP_148', '0');
  set('ef_INP_190', '0');
  set('ef_INP_191', '0');
  set('ef_INP_192', '0');
  set('ef_INP_193', 'No');
  set('ef_INP_194', 'No');
}


// =============================================
// EXTRA FIELDS - DYNAMIC CO-APPLICANT / GUARANTOR GENERATION (v4)
// =============================================

function generateCoApplicantCard(idx) {
  const suffix = 'C' + idx;
  return `
  <div class="ef-person-card" id="ef_ca_card_${idx}" data-ca-idx="${idx}">
    <div class="ef-person-card-header" onclick="togglePersonCard(this)">
      <span>Co-Applicant ${idx}</span>
      <span class="acc-chevron">&#9660;</span>
    </div>
    <div class="ef-person-card-body">

      <div class="ef-block-label">Profile</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Profile Status</label>
          <select id="ef_INP_016_${suffix}">
            <option value="Normal" selected>Normal</option>
            <option value="Caution">Caution</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </div>

      <div class="ef-block-label">Credit &amp; Bureau</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Wilful Defaulter?</label>
          <select id="ef_INP_015_${suffix}"><option value="No" selected>No</option><option value="Yes (currently)">Yes (currently)</option><option value="Not currently but in past">Not currently but in past</option></select>
        </div>
        <div class="form-group ef-cond-select" data-cond-field="ef_INP_015_${suffix}" data-cond-value="Not currently but in past">
          <label>Months Since Removal</label>
          <input type="number" id="ef_INP_221_${suffix}" min="0" max="600">
        </div>
        <div class="form-group">
          <label>Settlement/Restructure Last 12M?</label>
          <select id="ef_INP_018_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select>
        </div>
        <div class="form-group">
          <label>Track Record Verified?</label>
          <select id="ef_INP_222_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select>
        </div>
        <div class="form-group">
          <label>Clearance Proof Available?</label>
          <select id="ef_INP_223_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select>
        </div>
      </div>

      <div class="ef-block-label">Employment &amp; Stability</div>
      <div class="form-grid">
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried">
          <label>Total Experience (Months)</label>
          <input type="number" id="ef_INP_008_${suffix}" min="0" max="1200">
        </div>
        <div class="form-group">
          <label>Duration in Current City (Years)</label>
          <input type="number" id="ef_INP_012_${suffix}" min="0" max="100" step="0.1">
        </div>
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried">
          <label>Govt. Employee with Pension (OPS)?</label>
          <select id="ef_INP_010_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select>
        </div>
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried">
          <label>Currently a Govt. Employee?</label>
          <select id="ef_INP_010B_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select>
        </div>
      </div>

      <div class="ef-block-label">Exposure &amp; Verification</div>
      <div class="form-grid">
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried,SEP,SENP"><label>Existing Exposure with Company (&#8377;)</label><input type="number" id="ef_INP_019_${suffix}" min="0" step="1"></div>
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried,SEP,SENP"><label>Properties Already Financed</label><input type="number" id="ef_INP_020_${suffix}" min="0" max="10"></div>
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried,SEP,SENP"><label>First-Time Home Buyer?</label><select id="ef_INP_021_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select></div>
        <div class="form-group"><label>Residence Visit Done?</label><select id="ef_INP_024_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select></div>
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried,SEP,SENP"><label>Total Existing Obligations (&#8377;)</label><input type="number" id="ef_INP_136_${suffix}" min="0" step="1"></div>
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Cash Salaried,SEP,SENP"><label>Office/Business Visit Done?</label><select id="ef_INP_025_${suffix}"><option value="No">No</option><option value="Yes" selected>Yes</option></select></div>
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="Bank Salaried,Cash Salaried"><label>Employment Verified?</label><select id="ef_INP_026_${suffix}"><option value="No">No</option><option value="Yes" selected>Yes</option></select></div>
      </div>

      <div class="ef-income-block" data-person="${suffix}">
      <div class="ef-block-label">Income Details</div>
      <div class="form-grid">
        <div class="form-group"><label>Core Salary / Business Income (&#8377;/mo)</label><input type="number" id="ef_INP_028_${suffix}" min="0" step="1"></div>
      </div>
      <div class="ef-block-label" style="font-size:10px; color:#888; text-transform:uppercase; letter-spacing:0.5px;">Other Salary Components</div>
      <div class="form-grid">
        <div class="form-group"><label>Monthly Incentive / Variable Pay (&#8377;)</label><input type="number" id="ef_INP_029_${suffix}" min="0" step="1"></div>
        <div class="form-group"><label>Travel &amp; Conveyance Allowance (&#8377;)</label><input type="number" id="ef_INP_030_${suffix}" min="0" step="1"></div>
        <div class="form-group"><label>Annual Bonus Amount (&#8377;)</label><input type="number" id="ef_INP_031_${suffix}" min="0" step="1"></div>
        <div class="form-group"><label>Monthly Pension Income (&#8377;)</label><input type="number" id="ef_INP_032_${suffix}" min="0" step="1"></div>
      </div>
      <div class="ef-block-label" style="font-size:10px; color:#888; text-transform:uppercase; letter-spacing:0.5px;">Other Income Sources</div>
      <div class="form-grid">
        <div class="form-group"><label>Monthly Rental Income (&#8377;)</label><input type="number" id="ef_INP_033_${suffix}" min="0" step="1"></div>
        <div class="form-group"><label>Monthly Dairy Income (&#8377;)</label><input type="number" id="ef_INP_034_${suffix}" min="0" step="1" class="ef-dairy-input" data-person="${suffix}"></div>
        <div class="form-group ef-cond-dairy" data-person="${suffix}" style="display:none;"><label>No. of Milking Cattle</label><input type="number" id="ef_INP_034B_${suffix}" min="0"></div>
        <div class="form-group"><label>Monthly Tuition Income (&#8377;)</label><input type="number" id="ef_INP_035_${suffix}" min="0" step="1"></div>
        <div class="form-group"><label>Part-Time Employment Income (&#8377;)</label><input type="number" id="ef_INP_036_${suffix}" min="0" step="1"></div>
      </div>
      </div>

    </div>
  </div>`;
}

function generateGuarantorCard(idx) {
  const suffix = 'G' + idx;
  return `
  <div class="ef-person-card" id="ef_guar_card_${idx}" data-guar-idx="${idx}">
    <div class="ef-person-card-header" onclick="togglePersonCard(this)">
      <span>Guarantor ${idx}</span>
      <span class="acc-chevron">&#9660;</span>
    </div>
    <div class="ef-person-card-body">

      <div class="ef-block-label">Profile</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Profile Status</label>
          <select id="ef_INP_016_${suffix}">
            <option value="Normal" selected>Normal</option>
            <option value="Caution">Caution</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </div>

      <div class="ef-block-label">Credit &amp; Bureau</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Wilful Defaulter?</label>
          <select id="ef_INP_015_${suffix}"><option value="No" selected>No</option><option value="Yes (currently)">Yes (currently)</option><option value="Not currently but in past">Not currently but in past</option></select>
        </div>
        <div class="form-group ef-cond-select" data-cond-field="ef_INP_015_${suffix}" data-cond-value="Not currently but in past">
          <label>Months Since Removal</label>
          <input type="number" id="ef_INP_221_${suffix}" min="0" max="600">
        </div>
      </div>

      <div class="ef-block-label">Verification</div>
      <div class="form-grid">
        <div class="form-group"><label>Same Guarantor as Existing Loan?</label><select id="ef_INP_114_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select></div>
        <div class="form-group"><label>Tele-Verification Done?</label><select id="ef_INP_120_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select></div>
      </div>

      <div class="ef-block-label">Firm &amp; Income</div>
      <div class="form-grid">
        <div class="form-group ef-seg-vis" data-person="${suffix}" data-segments="SEP,SENP">
          <label>Firm Income Considered?</label>
          <select id="ef_INP_200_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select>
        </div>
        <div class="form-group ef-cond-select" data-cond-field="ef_INP_200_${suffix}" data-cond-value="Yes">
          <label>Firm Added as Guarantor?</label>
          <select id="ef_INP_201_${suffix}"><option value="No" selected>No</option><option value="Yes">Yes</option></select>
        </div>
      </div>

    </div>
  </div>`;
}

function prefillCoApplicant(idx) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const suffix = 'C' + idx;
  if (idx === 1) {
    set('ef_INP_016_' + suffix, 'Normal');
    set('ef_INP_015_' + suffix, 'No');
    set('ef_INP_018_' + suffix, 'No');
    set('ef_INP_222_' + suffix, 'No');
    set('ef_INP_223_' + suffix, 'No');
    set('ef_INP_008_' + suffix, '48');
    set('ef_INP_012_' + suffix, '5');
    set('ef_INP_024_' + suffix, 'Yes');
    set('ef_INP_136_' + suffix, '5000');
    set('ef_INP_025_' + suffix, 'Yes');
    set('ef_INP_026_' + suffix, 'Yes');
    set('ef_INP_028_' + suffix, '45000');
    set('ef_INP_031_' + suffix, '6000');
  } else if (idx === 2) {
    set('ef_INP_016_' + suffix, 'Normal');
    set('ef_INP_015_' + suffix, 'No');
    set('ef_INP_018_' + suffix, 'No');
    set('ef_INP_222_' + suffix, 'No');
    set('ef_INP_223_' + suffix, 'No');
    set('ef_INP_008_' + suffix, '180');
    set('ef_INP_012_' + suffix, '15');
    set('ef_INP_024_' + suffix, 'Yes');
    set('ef_INP_136_' + suffix, '3000');
    set('ef_INP_025_' + suffix, 'Yes');
    set('ef_INP_026_' + suffix, 'Yes');
    set('ef_INP_028_' + suffix, '32000');
  }
}


// =============================================
// EXTRA FIELDS - INTERACTIVE LOGIC (v4 - accordion/toggle)
// =============================================
function initExtraFields() {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // --- Generate co-applicant and guarantor cards ---
  function syncCA() {
    const n = +($('#ef_CoApplicant_Count') || {}).value || 0;
    const container = document.getElementById('ef_coapplicants_container');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= n; i++) {
      html += generateCoApplicantCard(i);
    }
    container.innerHTML = html;

    const badge = document.getElementById('ca-count-badge');
    if (badge) badge.textContent = n;

    for (let i = 1; i <= Math.min(n, 2); i++) {
      prefillCoApplicant(i);
    }

    updateSimSegmentList();
    rebindAllLogic();
  }

  function syncGuarantors() {
    const n = +($('#ef_Guarantor_Count') || {}).value || 0;
    const container = document.getElementById('ef_guarantors_container');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= n; i++) {
      html += generateGuarantorCard(i);
    }
    container.innerHTML = html;

    const badge = document.getElementById('guar-count-badge');
    if (badge) badge.textContent = n;

    updateSimSegmentList();
    rebindAllLogic();
  }

  function rebindAllLogic() {
    bindSelectConditionals();
    bindSegmentVisibility();
    bindIncomeBlockVisibility();
    bindDairyLogic();
    bindPropertyLogic();
    bindSchemeLogic();
  }

  // --- Hide entire income block when segment is "Income not considered" ---
  function bindIncomeBlockVisibility() {
    $$('.ef-income-block').forEach(el => {
      const person = el.dataset.person;
      if (!person) return;
      const segSelect = document.getElementById('ef_INP_003_' + person);
      if (!segSelect) return;

      function update() {
        el.style.display = segSelect.value === 'Income not considered' ? 'none' : '';
      }
      segSelect.removeEventListener('change', update);
      segSelect.addEventListener('change', update);
      update();
    });
  }

  // --- Select-based conditional visibility (replaces toggle conditionals) ---
  function bindSelectConditionals() {
    $$('.ef-cond-select').forEach(el => {
      const fieldId = el.dataset.condField;
      const condValue = el.dataset.condValue;
      if (!fieldId) return;
      const field = document.getElementById(fieldId);
      if (!field) return;

      function update() {
        const show = field.value === condValue;
        el.classList.toggle('ef-cond-hide', !show);
        if (!show) {
          el.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
          el.querySelectorAll('input[type="number"], input[type="text"]').forEach(c => { c.value = ''; });
        }
      }
      field.removeEventListener('change', update);
      field.addEventListener('change', update);
      update();
    });
  }

  // --- Segment-driven visibility ---
  function bindSegmentVisibility() {
    $$('.ef-seg-vis').forEach(el => {
      const person = el.dataset.person;
      const segments = (el.dataset.segments || '').split(',');
      if (!person) return;
      const segSelect = document.getElementById('ef_INP_003_' + person);
      if (!segSelect) return;

      function update() {
        const show = segments.includes(segSelect.value);
        el.classList.toggle('ef-cond-hide', !show);
      }
      segSelect.removeEventListener('change', update);
      segSelect.addEventListener('change', update);
      update();
    });
  }

  // --- Dairy income > 0 -> show cattle count ---
  function bindDairyLogic() {
    $$('.ef-dairy-input').forEach(inp => {
      const person = inp.dataset.person;
      const condEl = document.querySelector('.ef-cond-dairy[data-person="' + person + '"]');
      if (!condEl) return;

      function update() {
        condEl.style.display = (parseFloat(inp.value) || 0) > 0 ? '' : 'none';
      }
      inp.removeEventListener('input', update);
      inp.addEventListener('input', update);
      update();
    });
  }

  // --- Property logic (plot block now handled by bindSelectConditionals via data-cond-field) ---
  function bindPropertyLogic() {
    // No custom logic needed
  }

  // --- Scheme -> show/hide BT section ---
  function bindSchemeLogic() {
    const scheme = $('#ef_INP_132');
    const btSection = document.getElementById('acc-bt');
    if (scheme && btSection) {
      function updateBT() {
        const val = (scheme.value || '').toUpperCase();
        const isBT = val.includes('BALANCE TRANSFER') || val.includes('TOP UP');
        btSection.classList.toggle('show', isBT);
      }
      scheme.removeEventListener('change', updateBT);
      scheme.addEventListener('change', updateBT);
      updateBT();
    }
  }

  // --- Event listeners for count changes ---
  if ($('#ef_CoApplicant_Count')) {
    $('#ef_CoApplicant_Count').addEventListener('change', syncCA);
  }
  if ($('#ef_Guarantor_Count')) {
    $('#ef_Guarantor_Count').addEventListener('change', syncGuarantors);
  }

  // Segment change in simulator -> rebind visibility on form
  document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('ef-segment-select')) {
      bindSegmentVisibility();
      bindIncomeBlockVisibility();
    }
  });

  // Initial render
  syncCA();
  syncGuarantors();
  rebindAllLogic();
}

// =============================================
// SIMULATOR: per-person segment list
// =============================================
function updateSimSegmentList() {
  const container = document.getElementById('ef_segment_grid');
  if (!container) return;

  const segOptionsBase = '<option value="">--Select--</option><option value="Bank Salaried">Bank Salaried</option><option value="Cash Salaried">Cash Salaried</option><option value="SEP">SEP</option><option value="SENP">SENP</option>';
  const segOptionsCoapp = segOptionsBase + '<option value="Income not considered">Income not considered</option>';

  // Preserve existing values before re-rendering
  const oldAppSeg = document.getElementById('ef_INP_003_A');
  const oldAppVal = oldAppSeg ? oldAppSeg.value : '';
  const caCount = +(document.getElementById('ef_CoApplicant_Count') || {}).value || 0;
  const guarCount = +(document.getElementById('ef_Guarantor_Count') || {}).value || 0;
  const oldCaVals = {};
  for (let i = 1; i <= caCount; i++) {
    const sel = document.getElementById('ef_INP_003_C' + i);
    oldCaVals[i] = sel ? sel.value : '';
  }
  const oldGuarVals = {};
  for (let i = 1; i <= guarCount; i++) {
    const sel = document.getElementById('ef_INP_003_G' + i);
    oldGuarVals[i] = sel ? sel.value : '';
  }

  let html = '';
  html += '<div class="form-group"><label>Applicant <span class="sim-badge">SIM</span></label><select id="ef_INP_003_A" class="ef-segment-select">' + segOptionsBase + '</select></div>';

  for (let i = 1; i <= caCount; i++) {
    html += '<div class="form-group"><label>Co-Applicant ' + i + ' <span class="sim-badge">SIM</span></label><select id="ef_INP_003_C' + i + '" class="ef-segment-select">' + segOptionsCoapp + '</select></div>';
  }

  for (let i = 1; i <= guarCount; i++) {
    html += '<div class="form-group"><label>Guarantor ' + i + ' <span class="sim-badge">SIM</span></label><select id="ef_INP_003_G' + i + '" class="ef-segment-select">' + segOptionsBase + '</select></div>';
  }

  container.innerHTML = html;

  // Restore values
  const newAppSeg = document.getElementById('ef_INP_003_A');
  if (newAppSeg && oldAppVal) newAppSeg.value = oldAppVal;
  for (let i = 1; i <= caCount; i++) {
    const sel = document.getElementById('ef_INP_003_C' + i);
    if (sel && oldCaVals[i]) sel.value = oldCaVals[i];
  }
  for (let i = 1; i <= guarCount; i++) {
    const sel = document.getElementById('ef_INP_003_G' + i);
    if (sel && oldGuarVals[i]) sel.value = oldGuarVals[i];
  }
}


// =============================================
// EVENT LISTENERS
// =============================================
function initEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateToPage(item.dataset.page));
  });

  document.getElementById('btn-send-cam-sheet').addEventListener('click', handleSendToCamSheet);
  document.getElementById('btn-run-predeal-bre').addEventListener('click', runPreDealBREFromPage);
  document.getElementById('btn-run-predeal-bre-2').addEventListener('click', runPreDealBREFromPage);
  document.getElementById('btn-send-approval').addEventListener('click', handleSendForApproval);
  document.getElementById('btn-run-cam-bre').addEventListener('click', runCamBREFromPage);

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}


// =============================================
// INITIALIZATION
// =============================================
function prefillSimSegments() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('ef_INP_003_A', 'Bank Salaried');
  set('ef_INP_003_C1', 'Cash Salaried');
  set('ef_INP_003_C2', 'Bank Salaried');
}

function init() {
  initEventListeners();
  initSimulator();
  prefillExtraFields();
  initExtraFields();
  updateSimSegmentList();
  prefillSimSegments();
  initCamSheetChangeTracking();
  // Open directly on CAM Sheet tab
  switchTab('cam');
}

document.addEventListener('DOMContentLoaded', init);

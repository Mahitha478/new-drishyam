/**
 * DRISHYAM Primary Application Controller & Router
 */
let currentRole = null;
let currentSlideIndex = 0;
let thumbHoldTimeout = null;
let thumbProgressInterval = null;

// --- Carousel Controller ---
const carouselTrack = document.getElementById('carouselTrack');
const dots = document.querySelectorAll('.dot');

function setSlide(idx) {
  currentSlideIndex = idx;
  carouselTrack.style.transform = `translateX(-${currentSlideIndex * 33.333}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

let billboardTimer = setInterval(() => {
  setSlide((currentSlideIndex + 1) % 3);
}, 5000);

const highlightBox = document.getElementById('highlights');
highlightBox.addEventListener('mouseenter', () => clearInterval(billboardTimer));
highlightBox.addEventListener('mouseleave', () => {
  billboardTimer = setInterval(() => setSlide((currentSlideIndex + 1) % 3), 5000);
});

// --- Modal & Gate Routing ---
function openAuthModal(role) {
  currentRole = role;
  BiometricEnclave.reset();

  if (role === 'inspector') {
    document.getElementById('faceMatchStatus').innerText = "Idle";
    document.getElementById('faceMatchStatus').style.color = "var(--text-muted)";
    document.getElementById('scannerPrompt').innerText = "Press & Hold to scan minutiae points";
    document.getElementById('scannerPrompt').style.color = "var(--text-muted)";
    document.getElementById('hudProgress').style.width = "0%";
    document.getElementById('inspectorAuthModal').style.display = 'flex';
  } else {
    document.getElementById('authIdentityLabel').innerText = 
      role === 'manufacturer' ? 'Corporate Identity / Authorized Email' : 'Email Address / User Handle';
    document.getElementById('gstinGroup').style.display = role === 'manufacturer' ? 'block' : 'none';
    document.getElementById('basicAuthModal').style.display = 'flex';
  }
}

function switchAuthTab(isLogin) {
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
  }
});

// --- Biometric Enclave Handshake ---
function runBiometricVectorScan() {
  const statusEl = document.getElementById('faceMatchStatus');
  statusEl.innerText = "Analyzing 128-D Tensors...";
  statusEl.style.color = "var(--accent-warning)";

  BiometricEnclave.verifyFaceDescriptor((success, distance) => {
    if (success) {
      statusEl.innerText = `Matched (d = ${distance} < 0.52) PASS`;
      statusEl.style.color = "var(--accent-pass)";
    } else {
      statusEl.innerText = `Rejected (d = ${distance} >= 0.52) FAIL`;
      statusEl.style.color = "var(--accent-alert)";
    }
  });
}

function startFingerprintScan() {
  const hud = document.getElementById('hudScanner');
  const prompt = document.getElementById('scannerPrompt');
  const bar = document.getElementById('hudProgress');

  hud.classList.add('scanning');
  prompt.innerText = "Capturing biometric ridges...";
  prompt.style.color = "var(--primary)";

  let progress = 0;
  thumbProgressInterval = setInterval(() => {
    progress += 5;
    bar.style.width = progress + "%";
    if (progress >= 100) clearInterval(thumbProgressInterval);
  }, 70);

  thumbHoldTimeout = setTimeout(() => {
    BiometricEnclave.isThumbVerified = true;
    prompt.innerText = "Minutiae Profile Verified (100%) PASS";
    prompt.style.color = "var(--accent-pass)";
    hud.classList.remove('scanning');
  }, 1400);
}

function abortFingerprintScan() {
  const hud = document.getElementById('hudScanner');
  const prompt = document.getElementById('scannerPrompt');
  const bar = document.getElementById('hudProgress');

  if (!BiometricEnclave.isThumbVerified) {
    clearTimeout(thumbHoldTimeout);
    clearInterval(thumbProgressInterval);
    hud.classList.remove('scanning');
    bar.style.width = "0%";
    prompt.innerText = "Hold incomplete. Acquisition aborted.";
    prompt.style.color = "var(--accent-alert)";
  }
}

function finalizeInspectorAccess() {
  if (!BiometricEnclave.isFaceVerified) {
    alert("Authorization Denied: Neural Landmark Descriptor vector has not matched ($d < 0.52).");
    return;
  }
  if (!BiometricEnclave.isThumbVerified) {
    alert("Authorization Denied: Optical minutiae thumbprint capture incomplete.");
    return;
  }
  launchWorkspace("Legal Metrology Inspector Desk", "Officer Cadre: " + document.getElementById('cadreId').value);
}

function submitBasicAuth() {
  const id = document.getElementById('authIdentity').value || "Authenticated Party";
  launchWorkspace(currentRole === 'manufacturer' ? "Enterprise Pre-Market Clearance Desk" : "Consumer Grievance Desk", id);
}

function launchWorkspace(title, sub) {
  document.getElementById('basicAuthModal').style.display = 'none';
  document.getElementById('inspectorAuthModal').style.display = 'none';
  document.getElementById('landingSection').style.display = 'none';
  document.getElementById('workspaceSection').style.display = 'block';

  document.getElementById('workspaceTitle').innerText = title;
  document.getElementById('workspaceSubtitle').innerText = "Session Identity: " + sub;

  document.getElementById('inspectorFeaturePanel').style.display = currentRole === 'inspector' ? 'block' : 'none';
  document.getElementById('consumerFeaturePanel').style.display = currentRole === 'consumer' ? 'block' : 'none';
  document.getElementById('manufacturerFeaturePanel').style.display = currentRole === 'manufacturer' ? 'block' : 'none';
}

// --- Image Handling & Standard Mock Data ---
function loadDemoPackage() {
  document.getElementById('ocrText').value = 
`Mfg By: Himalayan Organics Ltd, Plot 14, Phase II, Solan, HP - 173211
Generic Commodity: Cold Pressed Mustard Seed Oil
Net Quantity: 200 ml
Month & Year of Packing: 07/2026
MRP: ₹ 165.00 (Inclusive of all taxes)
Consumer Care: help@himalayanorganics.in | Tel: 1800-11-2244
Best Before: 9 Months from Packaging Date`;

  document.getElementById('qrText').value = "http://claim-free-cashback.com/scratch-and-win?packet=4091";
  executeLegalAnalysis();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('scanStatus');
  statusEl.innerText = "Loading optical buffer...";

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = async function() {
      // 1. Process QR via aux canvas
      const canvas = document.getElementById('auxCanvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const qrResult = QRScannerEngine.scanCanvas(canvas);
      if (qrResult) {
        document.getElementById('qrText').value = qrResult;
      }

      // 2. Process OCR via Tesseract
      const text = await OCREngine.processImage(img, (s) => statusEl.innerText = s);
      if (text && text.trim().length > 0) {
        document.getElementById('ocrText').value = text;
      }
      statusEl.innerText = "Processing finished.";
      executeLegalAnalysis();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// --- Execution of Shared Compliance Engines ---
function executeLegalAnalysis() {
  const ocrText = document.getElementById('ocrText').value;
  const qrUrl = document.getElementById('qrText').value;

  // 1. Rule 6 Engine
  const results = OCREngine.evaluateRule6(ocrText);
  const container = document.getElementById('ruleResultsBox');
  container.innerHTML = "";

  results.forEach(r => {
    const row = document.createElement('div');
    row.style.marginBottom = "0.6rem";
    row.innerHTML = `
      <div style="font-size:0.82rem;"><strong>${r.rule}:</strong> ${r.title}</div>
      <div>
        <span class="rule-tag ${r.isCompliant ? 'tag-pass' : 'tag-fail'}">
          ${r.isCompliant ? '✓ Compliant' : '✕ Missing / Format Violation'}
        </span>
        <span style="font-size:0.75rem; color:var(--text-muted);">${r.citation}</span>
      </div>
    `;
    container.appendChild(row);
  });

  // 2. Anti-Fraud QR Shield
  const threat = QRScannerEngine.evaluateThreatRating(qrUrl, ocrText);
  const threatContainer = document.getElementById('qrThreatBox');
  threatContainer.innerHTML = `
    <div>
      <span class="rule-tag ${threat.tagClass}">${threat.headline}</span>
      <p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.4rem;">${threat.details}</p>
    </div>
  `;
}

// --- Specific Role Powers ---
function recalculateAQL() {
  const N = parseInt(document.getElementById('batchSize').value) || 0;
  let n = 50, ac = 3, re = 4;
  if (N <= 25) { n = 5; ac = 0; re = 1; }
  else if (N <= 90) { n = 13; ac = 1; re = 2; }
  else if (N <= 150) { n = 20; ac = 1; re = 2; }
  else if (N <= 280) { n = 32; ac = 2; re = 3; }
  else if (N <= 500) { n = 50; ac = 3; re = 4; }
  else if (N <= 1200) { n = 80; ac = 5; re = 6; }
  else { n = 125; ac = 7; re = 8; }

  document.getElementById('aqlSampleSize').value = n;
  document.getElementById('aqlAcceptance').value = `${ac} / ${re}`;
}

function dispatchFormIVMemo() {
  DocumentGenerators.generateFormIVMemo({
    cadreId: document.getElementById('cadreId').value,
    batchSize: document.getElementById('batchSize').value,
    sampleCount: document.getElementById('aqlSampleSize').value,
    nominalMass: parseFloat(document.getElementById('nominalMass').value),
    measuredMass: parseFloat(document.getElementById('measuredMass').value)
  });
}

function downloadConsumerGrievance() {
  const ocrText = document.getElementById('ocrText').value;
  const qrUrl = document.getElementById('qrText').value;
  const threat = QRScannerEngine.evaluateThreatRating(qrUrl, ocrText);
  DocumentGenerators.generateConsumerComplaintPDF(ocrText, threat);
}

function issueManufacturerPass() {
  DocumentGenerators.generateClearanceCertificate({
    batchCode: document.getElementById('mfgBatchCode').value,
    tare: parseFloat(document.getElementById('tareWeightVal').value),
    gross: parseFloat(document.getElementById('grossWeightVal').value)
  });
}
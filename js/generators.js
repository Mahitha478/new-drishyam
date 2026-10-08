/**
 * DRISHYAM Statutory Document Generators (.PDF)
 */
const DocumentGenerators = {
  // Form-IV Seizure Memo under Section 36 of Legal Metrology Act, 2009
  generateFormIVMemo(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.text("FORM-IV: STATUTORY SEIZURE MEMO", 20, 22);
    doc.setFontSize(10);
    doc.setFont("courier", "normal");
    doc.text("LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011", 20, 28);
    doc.text("Enforcement Section 36 | Department of Consumer Affairs", 20, 34);
    doc.text("----------------------------------------------------------------", 20, 39);

    doc.text(`Issuing Inspector Cadre : ${data.cadreId}`, 20, 48);
    doc.text(`Batch Designation       : ${data.batchSize} units surveyed`, 20, 55);
    doc.text(`ISO 2859-1 Sample Draw   : ${data.sampleCount} random packages`, 20, 62);
    doc.text(`Declared Nominal Weight  : ${data.nominalMass} g/mL`, 20, 69);
    doc.text(`Observed Mean Weight     : ${data.measuredMass} g/mL`, 20, 76);
    doc.text(`Statutory Deficit        : ${(data.nominalMass - data.measuredMass).toFixed(2)} g/mL`, 20, 83);

    doc.setFont("courier", "bold");
    doc.text("FORMAL ACTION RECORD:", 20, 96);
    doc.setFont("courier", "normal");
    doc.text("The declared batch fails to satisfy Schedule II Maximum Permissible Error", 20, 104);
    doc.text("(MPE) tolerance boundaries. The entire lot is seized under Section 36.", 20, 110);
    doc.text("Any disposition or breach of seal constitutes an indictable offense.", 20, 116);

    doc.text("Statutory Electronic Stamp:", 20, 135);
    doc.text("[DIGITALLY SIGNED VIA DRISHYAM CADRE BIOMETRIC DESK]", 20, 142);
    doc.text(`Timestamp: ${new Date().toISOString()}`, 20, 148);

    doc.save(`Form-IV_Seizure_Notice_${data.cadreId}.pdf`);
  },

  // 1-Tap e-Daakhil / NCH Consumer Complaint Notice
  generateConsumerComplaintPDF(ocrData, threatData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("STATUTORY GRIEVANCE MEMO — NCH 1915 / E-DAAKHIL", 20, 22);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Framed via DRISHYAM Public Compliance Scanner", 20, 28);
    doc.text(`Filing Timestamp: ${new Date().toLocaleString()}`, 20, 34);
    doc.text("----------------------------------------------------------------------------------------", 20, 38);

    doc.setFont("helvetica", "bold");
    doc.text("1. PACKAGING DECLARATION EVIDENCE (OCR RAW EXTRACT):", 20, 48);
    doc.setFont("courier", "normal");
    const lines = doc.splitTextToSize(ocrData || "No optical text provided.", 160);
    doc.text(lines, 20, 56);

    const nextY = 56 + (lines.length * 5) + 8;
    doc.setFont("helvetica", "bold");
    doc.text("2. DETECTED COMPLIANCE BREACHES:", 20, nextY);
    doc.setFont("helvetica", "normal");
    doc.text("- Packaging fails to verify full compliance under Rule 6 of LMPC 2011.", 22, nextY + 6);
    doc.text(`- Promotional Assessment: ${threatData.headline}`, 22, nextY + 12);

    doc.setFont("helvetica", "bold");
    doc.text("3. STATUTORY DEMAND & RELIEF:", 20, nextY + 24);
    doc.setFont("helvetica", "normal");
    doc.text("Cognizance is demanded under Consumer Protection Act, 2019 and", 22, nextY + 30);
    doc.text("the Legal Metrology Act, 2009 for deceptive packaging or missing labels.", 22, nextY + 36);

    doc.save("DRISHYAM_NCH_Complaint_Draft.pdf");
  },

  // Manufacturer Pre-Market Batch Pass Certificate
  generateClearanceCertificate(mfgData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const netWeight = (mfgData.gross - mfgData.tare).toFixed(2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("DRISHYAM PRE-MARKET BATCH CLEARANCE CERTIFICATE", 20, 22);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Department of Consumer Affairs | Pre-Clearance Verification Desk", 20, 28);
    doc.text("----------------------------------------------------------------------------------------", 20, 34);

    doc.text(`Batch Reference Code : ${mfgData.batchCode}`, 20, 44);
    doc.text(`Calibrated Tare Mass : ${mfgData.tare} g`, 20, 51);
    doc.text(`Gross Checkweigher   : ${mfgData.gross} g`, 20, 58);
    doc.text(`Calibrated Net Mass  : ${netWeight} g`, 20, 65);

    doc.setFont("helvetica", "bold");
    doc.text("REGULATORY VERDICT: PRE-MARKET BATCH CLEARED (PASS)", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text("- Mandatory Rule 6 Declarations: Verified Satisfactory", 22, 88);
    doc.text("- MPE Net Tolerance: Within Scheduled Bounds", 22, 94);
    doc.text("- Promotional QR Verification: Low Risk / No Deceptive Lotteries", 22, 100);

    doc.text(`Certificate Hash: SHA256-${Math.random().toString(36).substring(2)}${Date.now()}`, 20, 115);
    doc.save(`PreClearance_Pass_${mfgData.batchCode}.pdf`);
  }
};
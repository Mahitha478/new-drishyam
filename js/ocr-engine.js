/**
 * DRISHYAM LMPC 2011 Rule 6 Optical Engine & Legal RegEx Evaluator
 */
const OCREngine = {
  // Execute Tesseract OCR on raw image elements or canvas
  async processImage(imageSource, statusCallback) {
    try {
      statusCallback("Initializing neural OCR worker...");
      const worker = await Tesseract.createWorker('eng');
      statusCallback("Decomposing optical text layers...");
      const ret = await worker.recognize(imageSource);
      statusCallback("Optical parsing complete.");
      await worker.terminate();
      return ret.data.text;
    } catch (err) {
      console.error("Tesseract Engine error:", err);
      statusCallback("OCR engine fallback invoked.");
      return null;
    }
  },

  // Statutory evaluation under Rule 6 of LMPC Rules 2011
  evaluateRule6(rawText) {
    const text = rawText || "";
    return [
      {
        rule: "Rule 6(1)(a)",
        title: "Manufacturer / Packer / Importer Name & Full Address",
        isCompliant: /(Mfg By|Packer|Manufactured by|Imported by|Marketed by|Registered Office|Plot|Industrial Area)/i.test(text),
        citation: "Mandatory identification of commercial manufacturer or packing establishment."
      },
      {
        rule: "Rule 6(1)(b)",
        title: "Generic or Common Commodity Designation",
        isCompliant: /(Generic Name|Commodity|Seed Oil|Oil|Flour|Atta|Rice|Grain|Biscuits|Detergent)/i.test(text),
        citation: "Definite generic naming required; trade name alone is impermissible."
      },
      {
        rule: "Rule 6(1)(c)",
        title: "Net Quantity Notation (Standard Units)",
        isCompliant: /(Net Qty|Net Quantity|Net Mass|Net Volume|Net Wt)[\s:]*(\d+(\.\d+)?)\s*(g|kg|ml|l)\b/i.test(text),
        citation: "Must declare net measure in standard metric notation (g, kg, ml, l)."
      },
      {
        rule: "Rule 6(1)(d)",
        title: "Month & Year of Manufacture / Packing / Import",
        isCompliant: /(Mfg|Manufactured|Packed|Packing|Pkd|Imported)[\s:]*([0-1]?[0-9]\/[1-2][0-9]{3}|[A-Za-z]{3}\s*[1-2][0-9]{3})/i.test(text),
        citation: "Month and calendar year of manufacturing or retail pre-packing."
      },
      {
        rule: "Rule 6(1)(e)",
        title: "MRP Declaration (Inclusive of All Taxes, ₹ symbol)",
        isCompliant: /(MRP|Maximum Retail Price)[\s:]*₹?\s*(\d+(\.\d+)?).*incl/i.test(text) || /(₹\s*\d+.*incl)/i.test(text),
        citation: "Max Retail Price in Indian Rupee denomination inclusive of all statutory levies."
      },
      {
        rule: "Rule 6(1)(f)",
        title: "Consumer Care Redressal Mechanism",
        isCompliant: /(Consumer Care|Customer Care|Care Cell|Toll Free|Email|support@|1800-)/i.test(text),
        citation: "Contact person, phone contact, and registered email address are compulsory."
      },
      {
        rule: "Rule 6(1)(da)",
        title: "Best Before / Expiry Indication",
        isCompliant: /(Best Before|Expiry Date|Use By|Exp Date)/i.test(text),
        citation: "Best before duration or definitive expiry declaration."
      }
    ];
  }
};
/**
 * DRISHYAM Anti-Fraud Label & Phishing QR Shield
 */
const QRScannerEngine = {
  // Scan canvas image data using jsQR
  scanCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    return code ? code.data : null;
  },

  // Algorithmic evaluation of marketing QR links & sweepstakes claims
  evaluateThreatRating(qrUrl, ocrText) {
    const url = (qrUrl || "").toLowerCase();
    const text = (ocrText || "").toLowerCase();

    const highRiskKeywords = [
      "win-", "free-cashback", "lottery", "lucky-draw",
      "guaranteed-prize", "claim-reward", "redirect", "paytm-cash"
    ];

    const deceptivePackagingPhrases = [
      "scan to win", "guaranteed cash prize", "scratch & win cash",
      "instant reward ₹", "bumper prize"
    ];

    const urlFlagged = highRiskKeywords.some(pattern => url.includes(pattern));
    const textFlagged = deceptivePackagingPhrases.some(phrase => text.includes(phrase));

    if (urlFlagged || (textFlagged && url.length > 0)) {
      return {
        level: "HIGH",
        tagClass: "tag-fail",
        headline: "High Fraud Risk: Deceptive Promotional Scheme Intercepted",
        details: "Scheme detected violating Section 2(47) of Consumer Protection Act, 2019 (Deceptive promotional lottery redirection)."
      };
    } else if (url.length > 0 && !url.startsWith("https://")) {
      return {
        level: "MEDIUM",
        tagClass: "tag-warn",
        headline: "Warning: Unencrypted Insecure HTTP Endpoint",
        details: "Destination endpoint does not support TLS encryption, exposing consumers to man-in-the-middle exploits."
      };
    }

    return {
      level: "LOW",
      tagClass: "tag-pass",
      headline: "Authorized Packaging Destination Target",
      details: "No deceptive schemes, sweepstake traps, or suspicious redirects detected."
    };
  }
};
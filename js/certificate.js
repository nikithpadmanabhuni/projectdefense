/**
 * certificate.js
 * Automatic certificate generator for ProjectDefense students scoring 50%+ in their defense.
 * Features:
 * - Dynamic certificate generation with unique verification ID
 * - High-resolution Canvas rendering (1200x850)
 * - PNG download & Print / PDF saving
 * - Local storage persistence
 */

import { getProfile, saveCertificate, getCertificate } from './storage.js';

/**
 * Checks score eligibility (>= 50%) and automatically issues/updates the certificate.
 * @param {{
 *   score: number,
 *   maxScore: number,
 *   type?: string,
 *   projectOrFile?: string,
 *   candidateName?: string
 * }} options
 * @returns {{ issued: boolean, cert: any, isNew: boolean }}
 */
export function checkAndIssueCertificate(options) {
  const { score, maxScore = 45, type = 'Oral Project Defense', projectOrFile = 'Capstone Project', candidateName } = options;
  const pct = Math.round((score / maxScore) * 100);

  if (pct < 50) {
    return { issued: false, cert: null, isNew: false, pct };
  }

  const existing = getCertificate();
  const profile = getProfile();
  const name = candidateName || (profile && profile.fullName) || 'Engineering Scholar';
  const college = (profile && profile.college) || 'B.Tech Engineering Program';
  const branch = (profile && profile.branch) || 'Computer Science & Engineering';

  // Only replace if new score is higher or equal, or if no previous certificate
  if (existing && existing.score >= pct) {
    return { issued: true, cert: existing, isNew: false, pct };
  }

  const randomId = 'PD-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const newCert = {
    id: existing ? existing.id : randomId,
    recipientName: name,
    college,
    branch,
    score: pct,
    type,
    projectOrFile,
    issuedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    timestamp: new Date().toISOString(),
    verified: true,
    issuer: 'ProjectDefense Verification Authority'
  };

  saveCertificate(newCert);
  return { issued: true, cert: newCert, isNew: true, pct };
}

/**
 * Renders the official credential certificate onto an HTML5 Canvas (1200x850 high-res).
 * @param {any} cert 
 * @param {HTMLCanvasElement} canvas 
 */
export function renderCertificateToCanvas(cert, canvas) {
  if (!canvas || !cert) return;

  const ctx = canvas.getContext('2d');
  const width = (canvas.width = 1200);
  const height = (canvas.height = 850);

  // 1. Rich Executive Slate Background
  ctx.fillStyle = '#0B0F17';
  ctx.fillRect(0, 0, width, height);

  // Subtle background pattern lines
  ctx.strokeStyle = '#151D2C';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 2. Outer Gold & Emerald Dual Border
  ctx.strokeStyle = '#D97706'; // Gold
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = '#10B981'; // Emerald inner line
  ctx.lineWidth = 1.5;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Corner decorative notches
  const cornerSize = 24;
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(30, 30, cornerSize, 6);
  ctx.fillRect(30, 30, 6, cornerSize);
  ctx.fillRect(width - 30 - cornerSize, 30, cornerSize, 6);
  ctx.fillRect(width - 36, 30, 6, cornerSize);
  ctx.fillRect(30, height - 36, cornerSize, 6);
  ctx.fillRect(30, height - 30 - cornerSize, 6, cornerSize);
  ctx.fillRect(width - 30 - cornerSize, height - 36, cornerSize, 6);
  ctx.fillRect(width - 36, height - 30 - cornerSize, 6, cornerSize);

  // 3. Authority Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 14px "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('PROJECTDEFENSE VERIFICATION AUTHORITY • B.TECH CAPSTONE READINESS', width / 2, 95);

  // 4. Main Certificate Title
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 38px Georgia, "Times New Roman", serif';
  ctx.fillText('CERTIFICATE OF TECHNICAL DEFENSE', width / 2, 160);

  // Divider ribbon
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, 185);
  ctx.lineTo(width / 2 + 180, 185);
  ctx.stroke();

  // 5. Narrative: "This is to certify that"
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillText('This official credential certifies that', width / 2, 235);

  // 6. Recipient Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(cert.recipientName || 'Engineering Scholar', width / 2, 295);

  // College / Branch
  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 17px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${cert.college} • ${cert.branch}`, width / 2, 335);

  // 7. Statement of Achievement
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '17px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('has successfully defended the technical implementation, architectural decisions,', width / 2, 385);
  ctx.fillText('and error-handling mechanisms for the repository and module:', width / 2, 412);

  // Highlighted Project / File
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 20px "Courier New", Courier, monospace';
  ctx.fillText(`"${cert.projectOrFile}"`, width / 2, 455);

  // 8. Verified Score Badge Box
  const badgeWidth = 460;
  const badgeHeight = 64;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 495;

  ctx.fillStyle = '#111827';
  ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);

  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`DEFENSE SCORE: ${cert.score}% • VERIFIED CLEARANCE`, width / 2, badgeY + 40);

  // 9. Official Seal (Left)
  const sealX = 180;
  const sealY = 670;
  ctx.save();
  ctx.beginPath();
  ctx.arc(sealX, sealY, 52, 0, Math.PI * 2);
  ctx.fillStyle = '#111827';
  ctx.fill();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('VERIFIED', sealX, sealY - 8);
  ctx.fillText('DEFENSE', sealX, sealY + 6);
  ctx.fillText('PASS', sealX, sealY + 20);
  ctx.restore();

  // 10. Dual Signatures / Verification Details (Center & Right)
  // Left: Date
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.fillText(`Date Issued: ${cert.issuedAt}`, 260, 660);
  ctx.fillText(`Credential ID: ${cert.id}`, 260, 685);

  // Right Signatures
  ctx.textAlign = 'center';
  const sigX = 940;
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sigX - 120, 675);
  ctx.lineTo(sigX + 120, 675);
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'italic bold 18px Georgia, serif';
  ctx.fillText('ProjectDefense Engine', sigX, 665);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px "Segoe UI", sans-serif';
  ctx.fillText('Automated Technical Defense Authority', sigX, 695);

  // Bottom Notice
  ctx.fillStyle = '#475569';
  ctx.font = '11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Verification key cryptographically tied to student submission session • projectdefense-xi.vercel.app', width / 2, 790);
}

/**
 * Downloads the certificate as a high-resolution PNG image.
 * @param {any} cert 
 */
export function downloadCertificate(cert) {
  if (!cert) return;

  const canvas = document.createElement('canvas');
  renderCertificateToCanvas(cert, canvas);

  try {
    canvas.toBlob((blob) => {
      if (!blob) {
        fallbackDataUrlDownload(canvas, cert);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ProjectDefense-Certificate-${slugify(cert.recipientName)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  } catch (err) {
    fallbackDataUrlDownload(canvas, cert);
  }
}

function fallbackDataUrlDownload(canvas, cert) {
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `ProjectDefense-Certificate-${slugify(cert.recipientName)}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function slugify(text) {
  return (text || 'student')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Renders the visual certificate component inside a DOM container.
 * @param {HTMLElement} container 
 * @param {any} cert 
 */
export function renderCertificateUI(container, cert) {
  if (!container) return;
  container.innerHTML = '';

  if (!cert || cert.score < 50) {
    // Locked State Card
    const lockedCard = document.createElement('div');
    lockedCard.className = 'p-6 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between';
    
    lockedCard.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center justify-center sm:justify-start gap-2">
          <span class="text-amber-400 font-mono text-sm">🔒 Locked</span>
          <h3 class="text-sm font-semibold text-white">Certificate of Technical Defense</h3>
        </div>
        <p class="text-xs text-slate-400 max-w-xl">
          Score 50% or above in an oral Project Defense exam or complete 50%+ on your readiness checklist to automatically unlock your official certificate.
        </p>
      </div>
      <a href="defense.html" class="inline-block mt-3 sm:mt-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-smooth shadow-sm whitespace-nowrap">
        Take Defense Exam &rarr;
      </a>
    `;
    container.appendChild(lockedCard);
    return;
  }

  // Unlocked Certificate Card
  const certCard = document.createElement('div');
  certCard.className = 'p-6 rounded-xl bg-gradient-to-br from-[#111827] via-[#0D1526] to-[#0B0F17] border-2 border-amber-500/40 space-y-5 shadow-lg';

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2937] pb-4';
  headerRow.innerHTML = `
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>Official Certificate of Technical Defense</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Verified</span>
        </h3>
      </div>
      <p class="text-xs text-slate-400 font-mono">
        Credential ID: <span class="text-slate-200 font-bold">${cert.id}</span> &bull; Issued on ${cert.issuedAt}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" id="cert-download-btn" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-smooth shadow-sm flex items-center gap-1.5 min-h-[44px]">
        <span>📥</span>
        <span>Download PNG</span>
      </button>
      <button type="button" id="cert-print-btn" class="px-3.5 py-2 rounded-lg bg-[#1F2937] hover:bg-slate-700 text-slate-200 font-medium text-xs transition-smooth border border-slate-700 flex items-center gap-1.5 min-h-[44px]">
        <span>🖨️</span>
        <span>Print / Save PDF</span>
      </button>
    </div>
  `;

  // Visual Certificate Preview (Scaled Canvas)
  const previewContainer = document.createElement('div');
  previewContainer.className = 'w-full rounded-lg overflow-hidden border border-[#1F2937] bg-black shadow-inner flex justify-center items-center';

  const canvas = document.createElement('canvas');
  canvas.className = 'w-full max-w-full h-auto block';
  previewContainer.appendChild(canvas);

  // Render canvas content
  renderCertificateToCanvas(cert, canvas);

  certCard.appendChild(headerRow);
  certCard.appendChild(previewContainer);
  container.appendChild(certCard);

  // Event handlers
  const downloadBtn = certCard.querySelector('#cert-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      downloadCertificate(cert);
    });
  }

  const printBtn = certCard.querySelector('#cert-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const printWin = window.open('', '_blank');
      if (!printWin) {
        window.print();
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate - ${cert.recipientName}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; background: #000; min-height: 100vh; }
            img { max-width: 100%; height: auto; display: block; }
          </style>
        </head>
        <body onload="window.print();">
          <img src="${dataUrl}" alt="Certificate" />
        </body>
        </html>
      `);
      printWin.document.close();
    });
  }
}

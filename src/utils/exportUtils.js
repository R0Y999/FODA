import html2pdf from 'html2pdf.js';

export function exportToPdf(element) {
  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'analisis-foda.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  };
  return html2pdf().set(opt).from(element).save();
}

export async function copyToClipboard(fodaResult) {
  const sections = [
    { title: 'FORTALEZAS', items: fodaResult.fortalezas },
    { title: 'OPORTUNIDADES', items: fodaResult.oportunidades },
    { title: 'DEBILIDADES', items: fodaResult.debilidades },
    { title: 'AMENAZAS', items: fodaResult.amenazas },
  ];

  const text = sections
    .map(
      (s) =>
        `═══ ${s.title} ═══\n${s.items.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}`
    )
    .join('\n\n');

  const header = '╔══════════════════════════════╗\n║     ANÁLISIS FODA            ║\n╚══════════════════════════════╝\n\n';

  await navigator.clipboard.writeText(header + text);
}

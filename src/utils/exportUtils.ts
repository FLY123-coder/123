import type { SavedQuiz } from '@/types/savedQuizTypes';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

export const exportQuizToJSON = (quiz: SavedQuiz) => {
  const dataStr = JSON.stringify(quiz, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  saveAs(blob, `${quiz.title}_试卷.json`);
};

function createPrintableHTML(quiz: SavedQuiz): string {
  let html = `
    <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
      <h1 style="text-align: center; margin-bottom: 30px; font-size: 24px; font-weight: bold; color: #000;">
        ${quiz.title || '试卷'}
      </h1>
      <p style="text-align: right; margin-bottom: 30px; font-size: 12px; color: #666;">
        题目数量: ${quiz.questions.length}题
      </p>
  `;

  quiz.questions.forEach((q, idx) => {
    html += `<div style="margin-bottom: 25px; page-break-inside: avoid;"><div style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">${idx + 1}. ${q.question}</div>`;
    if ((q.type === 'single-choice' || q.type === 'multiple-choice') && 'options' in q && q.options) {
      html += `<div style="margin-left: 20px;">`;
      q.options.forEach((opt: string, oi: number) => {
        const label = String.fromCharCode(65 + oi);
        html += `<div style="margin-bottom: 8px; font-size: 14px;">${label}. ${opt}</div>`;
      });
      html += `</div>`;
    }
    if (q.type === 'fill-blank') {
      html += `<div style="margin-top: 15px; margin-left: 20px;"><div style="border-bottom: 2px solid #ccc; height: 25px; margin-bottom: 10px;"></div></div>`;
    }
    if (q.type === 'short-answer') {
      html += `<div style="margin-top: 15px; margin-left: 20px;">${Array(4).fill(0).map(() => `<div style=\"border-bottom: 1px solid #ccc; height: 25px; margin-bottom: 8px;\"></div>`).join('')}</div>`;
    }
    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

export const exportQuizToPDF = async (quiz: SavedQuiz) => {
  const htmlContent = createPrintableHTML(quiz);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '20px';
  tempDiv.style.fontFamily = "Arial, 'Microsoft YaHei', sans-serif";
  document.body.appendChild(tempDiv);
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${quiz.title}_试卷.pdf`);
  } finally {
    document.body.removeChild(tempDiv);
  }
};

export const exportQuizToWord = async (quiz: SavedQuiz) => {
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${quiz.title}</title></head><body>`;
  html += `<h1 style="text-align:center;">${quiz.title}</h1><p style="text-align:right;">题目数量: ${quiz.questions.length}题</p>`;
  quiz.questions.forEach((q, i) => {
    html += `<div><h3>${i + 1}. ${q.question}</h3></div>`;
  });
  html += `</body></html>`;
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  saveAs(blob, `${quiz.title}_试卷.doc`);
};

export const exportQuiz = async (quiz: SavedQuiz, format: 'pdf' | 'word' | 'json') => {
  switch (format) {
    case 'json':
      return exportQuizToJSON(quiz);
    case 'pdf':
      return exportQuizToPDF(quiz);
    case 'word':
      return exportQuizToWord(quiz);
    default:
      throw new Error('不支持的导出格式');
  }
};




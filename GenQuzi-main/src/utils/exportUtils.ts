/**
 * 试卷导出工具函数
 * 支持导出为PDF、Word、JSON格式
 */

import type { SavedQuiz, Question } from '@/types';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

/**
 * 导出试卷为JSON格式
 * @param quiz 试卷对象
 */
export const exportQuizToJSON = (quiz: SavedQuiz) => {
  try {
    const dataStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `${quiz.title}_试卷.json`);
  } catch (error) {
    console.error('导出JSON失败:', error);
    throw new Error('导出JSON失败');
  }
};

/**
 * 将题目转换为HTML格式
 * @param question 题目对象
 * @param index 题目索引（从1开始）
 * @returns HTML字符串
 */
const questionToHTML = (question: Question, index: number): string => {
  let html = `<div style="margin-bottom: 20px;">`;
  html += `<h3>${index}. ${question.question}</h3>`;

  switch (question.type) {
    case 'single-choice':
    case 'multiple-choice':
      if ('options' in question) {
        html +=
          '<ul style="list-style-type: upper-alpha; padding-left: 20px;">';
        question.options.forEach(option => {
          html += `<li>${option}</li>`;
        });
        html += '</ul>';
      }
      break;

    case 'fill-blank':
      if ('correctAnswers' in question) {
        // 显示填空数量
        html += `<p>（共${question.correctAnswers.length}个空）</p>`;
      }
      break;

    case 'short-answer':
    case 'code-output':
    case 'code-writing':
      // 这些题型不需要额外显示选项
      break;
  }

  html += '</div>';
  return html;
};

/**
 * 导出试卷为PDF格式
 * @param quiz 试卷对象
 */
export const exportQuizToPDF = async (quiz: SavedQuiz) => {
  try {
    console.log('开始创建PDF，试卷信息:', {
      title: quiz.title,
      questionCount: quiz.questions.length,
    });

    // 创建HTML内容
    const htmlContent = createPrintableHTML(quiz);

    // 创建临时的HTML元素
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, "Microsoft YaHei", sans-serif';

    document.body.appendChild(tempDiv);

    try {
      // 动态导入html2canvas
      const html2canvas = (await import('html2canvas')).default;

      // 将HTML转换为Canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();

      const imgWidth = 210; // A4宽度(mm)
      const pageHeight = 295; // A4高度(mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果内容超过一页，添加更多页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 保存PDF
      pdf.save(`${quiz.title}_试卷.pdf`);

      console.log('PDF创建成功');
    } finally {
      // 清理临时元素
      document.body.removeChild(tempDiv);
    }
  } catch (error) {
    console.error('导出PDF失败:', error);
    throw new Error(
      `导出PDF失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
};

// 创建可打印的HTML内容
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

  quiz.questions.forEach((question, index) => {
    html += `
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <div style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">
          ${index + 1}. ${question.question}
        </div>
    `;

    // 添加选项
    if (
      question.type === 'single-choice' ||
      question.type === 'multiple-choice'
    ) {
      if ('options' in question && question.options) {
        html += `<div style="margin-left: 20px;">`;
        question.options.forEach((option, optionIndex) => {
          const optionLabel = String.fromCharCode(65 + optionIndex);
          html += `
            <div style="margin-bottom: 8px; font-size: 14px;">
              ${optionLabel}. ${option}
            </div>
          `;
        });
        html += `</div>`;
      }
    }

    // 为填空题添加答题空间
    if (question.type === 'fill-blank') {
      html += `
        <div style="margin-top: 15px; margin-left: 20px;">
          <div style="border-bottom: 2px solid #ccc; height: 25px; margin-bottom: 10px;"></div>
        </div>
      `;
    }

    // 为简答题添加答题空间
    if (question.type === 'short-answer') {
      html += `
        <div style="margin-top: 15px; margin-left: 20px;">
          ${Array(4)
            .fill(0)
            .map(
              () =>
                `<div style="border-bottom: 1px solid #ccc; height: 25px; margin-bottom: 8px;"></div>`
            )
            .join('')}
        </div>
      `;
    }

    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

/**
 * 导出试卷为Word格式
 * @param quiz 试卷对象
 */
export const exportQuizToWord = async (quiz: SavedQuiz) => {
  try {
    // 创建HTML内容
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${quiz.title}</title>
      </head>
      <body>
        <h1 style="text-align: center;">${quiz.title}</h1>
        <p style="text-align: right;">题目数量: ${quiz.questions.length}题</p>
    `;

    // 添加所有题目
    quiz.questions.forEach((question, index) => {
      htmlContent += questionToHTML(question, index + 1);
    });

    htmlContent += `
      </body>
      </html>
    `;

    // 创建Blob对象并导出为Word文档
    const blob = new Blob([htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    saveAs(blob, `${quiz.title}_试卷.doc`);
  } catch (error) {
    console.error('导出Word失败:', error);
    throw new Error('导出Word失败');
  }
};

/**
 * 根据格式导出试卷
 * @param quiz 试卷对象
 * @param format 导出格式
 */
export const exportQuiz = async (
  quiz: SavedQuiz,
  format: 'pdf' | 'word' | 'json'
) => {
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

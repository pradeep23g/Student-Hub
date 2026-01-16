import * as pdfjsLib from "pdfjs-dist";

// ✅ FIXED: Hardcoded to version 3.11.174 to match your installed package
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const extractTextFromPDF = async (url) => {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    
    let fullText = "";

    // Loop through pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += `\n--- Page ${i} ---\n${pageText}`;
    }
    
    return fullText;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return "";
  }
};
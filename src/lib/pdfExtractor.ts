// Client-side PDF text extraction using pdfjs-dist
// This matches the architecture described in the parse-pdf edge function

let pdfjsLib: any = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Use the worker from CDN to avoid bundling issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
}

export interface ExtractedPdf {
  text: string;
  pageCount: number;
  pages: string[];
}

export async function extractPdfText(
  arrayBuffer: ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPdf> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  const pages: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(pageText);
    onProgress?.(i, pageCount);
  }

  return {
    text: pages.join('\n\n'),
    pageCount,
    pages,
  };
}

export async function extractPdfFromUrl(
  url: string,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPdf> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch PDF');
  const arrayBuffer = await response.arrayBuffer();
  return extractPdfText(arrayBuffer, onProgress);
}

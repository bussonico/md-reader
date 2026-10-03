// Use pdfjs-dist to extract text from PDF, then format as markdown
export async function pdfToMarkdown(file: File): Promise<string> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let markdown = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str)
      .join(' ')
      .trim()
    if (pageText) {
      markdown += pageText + '\n\n'
    }
  }

  return markdown
}

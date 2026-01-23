import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PdfNotParsedError, PdfSizeError } from './exceptions/exceptions';
import * as pdfjs from 'pdfjs-dist/build/pdf';


@Injectable()
export class PdfParserService {
  constructor(private httpService: HttpService) {}


async parsePdf(file: Buffer): Promise<string> {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(file) });
  const pdf = await loadingTask.promise;

  let text = '';

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();

    const pageText = content.items 
      .map((item: any) => item.str.trim())  //create a new array where each element is the str of the item and removes both ends whitespace.
      .filter(Boolean)   //Removes any empty strings from the array.
      .join(' ');

    if (pageText) {
      const cleaned = pageText.replace(/\s{3,}/g, '   ');

      text += cleaned + `\n---PAGE ${pageNo}---\n`;
    }
  }

  text = text.trim();

  if (!text) throw new PdfNotParsedError();

  return text;
}


  async loadPdfFromUrl(url: string) {
    const MAX_SIZE = 5 * 1024 * 1024;

    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 10_000,
    });

    const contentLength = Number(response.headers['content-length']);

    if (!isNaN(contentLength) && contentLength > MAX_SIZE) {
      throw new PdfSizeError();
    }

    const buffer = Buffer.from(response.data, 'binary');

    if (buffer.length > MAX_SIZE) {  //if actual file size greaer than max-size
      throw new PdfSizeError();
    }

    return buffer;
  }
}

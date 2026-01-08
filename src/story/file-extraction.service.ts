import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as mammoth from 'mammoth';

// Polyfill DOMMatrix for pdf-parse
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    constructor(init?: string | number[]) {
      if (init) {
        if (typeof init === 'string') {
          const values = init.match(/matrix\(([^)]+)\)/)?.[1]?.split(',').map(Number);
          if (values && values.length === 6) {
            this.a = values[0];
            this.b = values[1];
            this.c = values[2];
            this.d = values[3];
            this.e = values[4];
            this.f = values[5];
          }
        } else if (Array.isArray(init) && init.length === 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        }
      }
    }
  } as any;
}

// Lazy import pdf-parse to avoid DOMMatrix issues at module load time
let pdfParse: any = null;
async function getPdfParse() {
  if (!pdfParse) {
    pdfParse = await import('pdf-parse');
  }
  return pdfParse;
}

@Injectable()
export class FileExtractionService {
  async extractText(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'txt':
      case 'md':
        return this.extractTextFile(file);
      case 'pdf':
        return this.extractPdf(file);
      case 'docx':
        return this.extractDocx(file);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  private async extractTextFile(file: Express.Multer.File): Promise<string> {
    return file.buffer.toString('utf-8');
  }

  private async extractPdf(file: Express.Multer.File): Promise<string> {
    const pdfParseModule = await getPdfParse();
    const data = await pdfParseModule.default(file.buffer);
    return data.text;
  }

  private async extractDocx(file: Express.Multer.File): Promise<string> {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength);
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';

export class PdfSizeError extends HttpException {
  constructor(maxSizeMB = 5) {
    super(
      {
        message: `The PDF file is larger than ${maxSizeMB}MB`,
        error: 'PDF_SIZE_LIMIT_EXCEEDED',
      },
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}

export class PdfNotParsedError extends HttpException {
  constructor() {
    super(
      {
        message:
          'The PDF file could not be parsed. It may not contain plain text or information in text format.',
        error: 'PDF_NOT_PARSABLE',
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

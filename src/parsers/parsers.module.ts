import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser/pdf-parser.service';
import { PdfParserController } from './pdf-parser/pdf-parser.controller';


@Module({
  controllers: [PdfParserController],
  providers: [PdfParserService]
})
export class ParsersModule {}

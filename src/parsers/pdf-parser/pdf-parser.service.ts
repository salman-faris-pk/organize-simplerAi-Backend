import { Injectable } from '@nestjs/common';
import Poppler from 'node-poppler';
import { map } from 'rxjs';

@Injectable()
export class PdfParserService {

    async parsePdf(file:Buffer){
         
        const poppler=new Poppler(process.env.POPPLER_BIN_PATH)

        const output= (await poppler.pdfToText(file, undefined, {
            maintainLayout: true,
            quiet: true,
        })) as any

      if(output.length === 0){
         throw new Error('pdf has no values contains')
      };

      return this.postProcessText(output);
    };


    private postProcessText(text:string){
        const processedText=text
             .split('\n')       //Split the text into lines
             .map((line) => line.trim())   //Remove spaces at start & end of each line
             .filter((line,index, arr) => line !== '' || arr[index - 1] !== '') ////keep only one line if multiple lines are empty
             .map((line) => line.replace(/\s{3,}/g, '   ')) ////remove whitespace in lines if there are more than 3 spaces
             .join('\n'); //Join lines back into text

             return processedText;
    };




};

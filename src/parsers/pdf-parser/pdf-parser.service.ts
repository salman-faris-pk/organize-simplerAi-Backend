import '../pdfjs-node-polyfill';
import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as pdfjs from 'pdfjs-dist';
import { HttpService } from "@nestjs/axios"



@Injectable()
export class PdfParserService {

    constructor(private httpService:HttpService){}

    async parsePdf(file:Buffer){
         
        const loadingTask=pdfjs.getDocument({ data: new Uint8Array(file)});
        const pdf=await loadingTask.promise;

        let text='';

        for(let pageNo= 1; pageNo <= pdf.numPages; pageNo++){
             const page=await pdf.getPage(pageNo);
             const content= await page.getTextContent();

             text+=content.items.map((item:any)=> item.str).join(' ') + '\n';

        };


        if (text.trim().length === 0) {
            throw new UnprocessableEntityException('PDF does not contain extractable text (likely scanned)');
        };


       return this.postProcessText(text)

    };


    private postProcessText(text:string):string{
        const processedText=text
             .split('\n')       //Split the text into lines
             .map((line) => line.trim())   //Remove spaces at start & end of each line
             .filter((line,index, arr) => line !== '' || arr[index - 1] !== '') ////keep only one line if multiple lines are empty
             .map((line) => line.replace(/\s{3,}/g, '   ')) ////remove whitespace in lines if there are more than 3 spaces
             .join('\n'); //Join lines back into text

             return processedText;
    };

  async loadPdfFromUrl(url:string){
    const response=await this.httpService.axiosRef({
        url,
        method:'GET',
        responseType:"arraybuffer"
    });
 
    if (response.headers['content-length'] > 10 * 1024 * 1024) {
      throw new BadRequestException('pdf size larger tah 10 mb ');
    };

     return Buffer.from(response.data, 'binary')

  };

};

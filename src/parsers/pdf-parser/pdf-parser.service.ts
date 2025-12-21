import { Injectable } from '@nestjs/common';
import { HttpService } from "@nestjs/axios"
import { PdfNotParsedError, PdfSizeError } from './exceptions/exceptions';
import * as pdfjs from 'pdfjs-dist/build/pdf';

    

@Injectable()
export class PdfParserService {

    constructor(private httpService:HttpService){}

    async parsePdf(file:Buffer){
         
        const loadingTask=pdfjs.getDocument({ data: new Uint8Array(file) });
        const pdf=await loadingTask.promise;

        let text='';

        for(let pageNo= 1; pageNo <= pdf.numPages; pageNo++){
             const page=await pdf.getPage(pageNo);
             const content= await page.getTextContent();

             text+=content.items.map((item:any)=> item.str).join(' ') + '\n';

        };


        if (text.trim().length === 0) {
            throw new PdfNotParsedError();
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
    const MAX_SIZE = 5 * 1024 * 1024;

    const response=await this.httpService.axiosRef({
        url,
        method:'GET',
        responseType:"arraybuffer",
        timeout: 10_000
    });
  
    const contentLength = Number(response.headers['content-length']);

     if (!isNaN(contentLength) && contentLength > MAX_SIZE) {
       throw new PdfSizeError();
     };

     const buffer= Buffer.from(response.data, 'binary')

     if(buffer.length > MAX_SIZE){    //if actual file size greaer than max-size
      throw new PdfSizeError();
     };

     return buffer;

  };

};

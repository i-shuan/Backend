import express from 'express';
import axios from 'axios';
import fs from 'fs';
import { Transform } from 'stream';
import split2 from 'split2';
import iconv from 'iconv-lite';
import DetectFileCode from './DetectFileCode.js';
import getStream from 'get-stream';

/* Local File */
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let isMasked = false;

const maskLine = (line) => {
    const timeStampRegExp = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/;

    if (line.match(/S7F\d{1,2}/) || line.includes('TxName')) {
        isMasked = true;
    } else if (line.match(timeStampRegExp)) {
        isMasked = false;
    }

    if (isMasked) {
        const time = line.match(timeStampRegExp);
        if (time !== null) {
            return `${time[0]} - ******Content*****\n`;
        } else return "";
    } else {
        return line + '\n';
    }
};


const MaskDownloadFile = async (filename, res) => {

    return new Promise(async (resolve, reject) => {
        try {
            // const url = `http://example.com/`;
            // const response = await axios({
            //     method: 'POST',
            //     url: url,
            //     timeout: 5000,
            //     responseType: 'stream',
            //     data: {
            //         filename: filename
            //     }
            // });

            /* Local File */
            // 定義原始檔案的路徑
            const filePath = path.resolve(__dirname, '../Log/TAPSECS.log');
            
            // 讀取原始檔案，並將其內容作為 buffer 儲存到 fileBuffer
            var readerForDetecting = fs.createReadStream(filePath);
            console.log("filePath", filePath)
            const fileBuffer = await getStream.buffer(readerForDetecting);
            const detectedEncoding = await DetectFileCode(fileBuffer);
            console.log("detectedEncoding", detectedEncoding)
            const decodedStream = iconv.decodeStream("UTF-8");
            // response.data
            //     .pipe(decodedStream)
            //     .pipe(split2())
            //     .pipe(new Transform({
            //         transform(chunk, encoding, callback) {
            //             const maskedLine = maskLine(chunk.toString());
            //             this.push(maskedLine);
            //             callback();
            //         }
            //     }))
            //     .pipe(res)
            //     .on('finish', () => resolve({ 
            //         status: 'success', 
            //         message: 'File processed successfully' 
            //     }))
            //     .on('error', reject);

            /* _readableState 中的 ended 屬性為 true，代表讀取過程已結束，這可能是導致無法讀取資料的原因。
            solve: 重新fs.createReadStream(filePath); */
            readerForDetecting = fs.createReadStream(filePath);

            
            readerForDetecting
            .on('error', err => { console.error('Error reading file:', err); })
            .pipe(decodedStream)
            .on('error', err => { console.error('Error decoding stream:', err); })
            .pipe(split2())
            .on('error', err => { console.error('Error splitting lines:', err); })
            .pipe(new Transform({
                transform(chunk, encoding, callback) {
                    console.log("chunk.toString()", chunk.toString())
                    const maskedLine = maskLine(chunk.toString());
                    this.push(maskedLine);
                    callback();
                }
            }))
            .on('error', err => { console.error('Error transforming data:', err); })
            .pipe(res)
            .on('finish', () => resolve({ 
                status: 'success', 
                message: 'File processed successfully' 
            }))
            .on('error', err => { console.error('Error piping to response:', err); });
        
        res.on('error', (err) => console.error('Response error:', err));
        

        } catch (err) {
            reject(err);
        }
    });


}

export default MaskDownloadFile;
// ProcessFile.js
import axios from 'axios';
import fs from 'fs';
/* Local File */
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Transform } from 'stream';
import split2 from 'split2';
import iconv from 'iconv-lite';
import DetectFileCode from './DetectFileCode.js';
import getStream from 'get-stream';
import archiver from 'archiver';

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
        }
        else return "";
    } else {
        return line + '\n';
    }
};

const archiveFiletoZip = (filePath, outputName) => {

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputName);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve({ status: 'success', message: 'File zipped successfully' });
        });

        archive.on('error', (err) => {
            reject(err);
        });

        // pipe archive data to the file
        archive.pipe(output);

        // append a file
        /*第一个参数filePath是你想要添加到压缩文件中的文件的完整路径 
        第二個通常是你要添加的文件的文件名*/
        archive.file(filePath, { name: path.basename(filePath) });
        
        archive.finalize();
    });
};

const processFile = async (filename) => {
   
    // /* Server download File */
    // const url = `http://example.com/`;
    // const response = await axios({
    //     method: 'POST',
    //     url: url,
    //     responseType: 'stream',
    //     data: {
    //         filename: filename
    //     }
    // });


    /* Local File */
    // 定義原始檔案的路徑
    const filePath = path.resolve(__dirname, '../Log/TAPSECS.log');

    // 定義處理後的檔案的路徑
    const outputFilePath = path.join(__dirname, '../DownloadedFiles', "1111");

    // 建立可寫入的檔案流，將處理後的數據寫入到 outputFilePath 指定的路徑
    const writer = fs.createWriteStream(outputFilePath);

    /* Detect File Coding */
    // 讀取原始檔案，並將其內容作為 buffer 儲存到 fileBuffer
    const readerForDetecting = fs.createReadStream(filePath);
    const fileBuffer = await getStream.buffer(readerForDetecting);

    // 偵測檔案的編碼方式
    const detectedEncoding = await DetectFileCode(fileBuffer);
    console.log("detectedEncoding", detectedEncoding);

    /* Decoding */
    // 再次讀取原始檔案，並使用偵測到的編碼方式對其解碼
    const readerForDecoding = fs.createReadStream(filePath);
    const decodedStream = iconv.decodeStream(detectedEncoding);

    
   // 使用 pipe 函數將讀取到的數據流傳送到接下來的處理過程
    readerForDecoding
    .pipe(decodedStream) // 將數據流傳送到解碼器
    .pipe(split2()) // 將解碼後的數據流以行為單位切割
    .pipe(new Transform({ // 將切割後的數據流傳送到變形流，進行額外的處理
        transform(chunk, encoding, callback) {
            const maskedLine = maskLine(chunk.toString()); // 對每一行的數據進行處理
            this.push(maskedLine); // 將處理後的數據放回到數據流中
            callback();
        }
    }))
    .pipe(writer); // 將最後的數據流傳送到 writer，寫入到檔案中
    
    // 回傳一個新的 Promise 對象，以處理非同步的操作
    return new Promise((resolve, reject) => {
        // 監聽 writer 物件的 'finish' 事件，當所有數據寫入完成且文件已經關閉時，會觸發該事件
        writer.on('finish', async () => {
            // 定義壓縮檔案的路徑
            const zipFilename = path.join(__dirname, '../DownloadedFiles', "11111" + '.zip');
            try {
                // 將原始檔案壓縮為zip檔案
                const archiveResult = await archiveFiletoZip(filePath, zipFilename);
                // 壓縮完成後，呼叫resolve函數，並將成功的狀態和信息返回
                resolve({ status: 'success', message: 'File processed and zipped successfully', archiveResult });
            } catch (err) {
                // 如果在壓縮過程中出錯，則呼叫reject函數，並將錯誤物件返回
                reject(err);
            }
        });
        // 監聽 writer 物件的 'error' 事件，如果在寫入數據過程中出現錯誤，則觸發該事件
        writer.on('error', reject);
    });

};

export default processFile;

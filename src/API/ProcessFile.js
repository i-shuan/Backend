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

// 定義一個將檔案壓縮為zip的函數，需要兩個參數，一個是要被壓縮的檔案路徑，另一個是壓縮後的輸出名稱
const archiveFiletoZip = (filePath, outputName) => {
    // 返回一個新的 Promise
    return new Promise((resolve, reject) => {
        // 建立一個寫入流到輸出名稱的位置
        const output = fs.createWriteStream(outputName);
        // 建立一個新的壓縮物件，壓縮等級設定為9
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // 當寫入流關閉時，打印出壓縮後的總位元組並解決 Promise
        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve({ status: 'success', message: 'File zipped successfully' });
        });

        // 當壓縮出現錯誤時，拒絕 Promise
        archive.on('error', (err) => {
            reject(err);
        });

        // 將壓縮資料導入到寫入流
        archive.pipe(output);

        // 添加一個檔案到壓縮檔中
        /* 第一個參數filePath是你想要添加到壓縮檔中的檔案的完整路徑 
        第二個參數通常是你要添加的檔案的檔案名 */

        /*
當你在調用 archive.file() 函數時，你只需提供要壓縮的文件的路徑，archiver 庫會創建一個讀取流去讀取這個文件，然後進行壓縮。 */
        archive.file(filePath, { name: path.basename(filePath) });
        
        // 完成壓縮操作
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

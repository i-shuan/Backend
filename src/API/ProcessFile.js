// ProcessFile.js
import axios from 'axios';
import fs from 'fs';
/* Local File */
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Transform } from 'stream';
import split2 from 'split2';
import iconv from 'iconv-lite';
import DetectFileCode from './DetectFileCode';
import getStream from 'get-stream';

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


const processFile = async (filename) => {
   
    /* Server download File */
    const url = `http://example.com/`;
    const response = await axios({
        method: 'POST',
        url: url,
        responseType: 'stream',
        data: {
            filename: filename
        }
    });

    /* Add */
    const fileBuffer = await getStream.buffer(response.data);
    const detectedEncoding = await DetectFileCode(fileBuffer);

    const decodedStream = iconv.decodeStream(detectedEncoding);
    const encodeStream = iconv.encodeStream('utf8');

    const filePath = path.join(__dirname, '../DownloadedFiles', path.basename(url));
    const writer = fs.createWriteStream(filePath);

    decodedStream
        .pipe(split2())
        .pipe(new Transform({
            transform(chunk, encoding, callback) {
                const maskedLine = maskLine(chunk.toString());
                this.push(maskedLine);
                callback();
            }
        }))
        .pipe(encodeStream) // 编码成UTF-8
        .pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve({ status: 'success', message: 'File processed successfully' }));
        writer.on('error', reject);
    });
};

export default processFile;

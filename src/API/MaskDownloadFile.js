import express from 'express';
import axios from 'axios';
import { Transform } from 'stream';
import split2 from 'split2';
import iconv from 'iconv-lite';
import DetectFileCode from './DetectFileCode.js';
import getStream from 'get-stream';

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
    try {
        const url = `http://example.com/`;
        const response = await axios({
            method: 'POST',
            url: url,
            timeout: 5000,
            responseType: 'stream',
            data: {
                filename: filename
            }
        });

        const decodedStream = iconv.decodeStream("UTF-8");
        response.data
            .on('error', err => {
                console.error('Stream error', err);
                response.data.destroy();  // Close and clean up the stream
            })
            .pipe(decodedStream)
            .pipe(split2())
            .pipe(new Transform({
                transform(chunk, encoding, callback) {
                    const maskedLine = maskLine(chunk.toString());
                    this.push(maskedLine);
                    callback();
                }
            }))
            .pipe(res)

        

    } catch (err) {
        console.error(err);
        res.status(500).send({error: err.message});
    }
};

export default MaskDownloadFile;

import axios from 'axios';
import { Transform } from 'stream';
import split2 from 'split2';
import iconv from 'iconv-lite';

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

export const MaskFileStream = async (stream) =>{
    const decodedStream = iconv.decodeStream("UTF-8");
    return stream
        .pipe(decodedStream)
        .pipe(split2())
        .pipe(new Transform({
            transform(chunk, encoding, callback) {
                const maskedLine = maskLine(chunk.toString());
                this.push(maskedLine);
                callback();
            }
        }));
}


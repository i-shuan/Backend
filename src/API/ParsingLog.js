import express from 'express';
import axios from 'axios';
import { Transform } from 'stream';
import split2 from 'split2';
import iconv from 'iconv-lite';
import DetectFileCode from './DetectFileCode.js';
import getStream from 'get-stream';



const parseAlarmLog = (line, globalConfig) => {
    const timeStampRegExp = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/;
    const alarmIdRegExp = /alarmid='([A-Z0-9]+)'/;

    if (line.match(/TxName="AlarmCIM"/)) {
        // 如果currentLog有內容，則將其推入parsedLog並清空
        if (globalConfig.currentLog.length > 0) {
            const time = globalConfig.currentLog.match(timeStampRegExp);
            const alarmId = globalConfig.currentLog.match(alarmIdRegExp);
            if (time !== null && alarmId !== null) {
                globalConfig.parsedLog.push({
                    time: time[0],
                    content: globalConfig.currentLog,
                    alarmId: alarmId[1]  // 從正則表達式匹配中獲取 alarmid
                });
            }
            globalConfig.currentLog = '';
        }
        globalConfig.isAlarmTxName = true;
    } else if (line.match(timeStampRegExp)) {
        globalConfig.isAlarmTxName = false;
    }

    // 如果isAlarmTxName為true，則將行追加到currentLog
    if (globalConfig.isAlarmTxName || line.match(timeStampRegExp)) {
        globalConfig.currentLog += line + '\n';
    }
};


const ParsingLog = async (filename, res) => {
    var globalConfig = {
        isAlarmTxName: false,
        parsedLog: [],
        currentLog: ''  // 更改此行
    }

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
        const transformStream = new Transform({
            transform(chunk, encoding, callback) {
                parseAlarmLog(chunk.toString(), globalConfig);
                callback();
            }
        });

        // 從伺服器獲取數據
        response.data
        // 若在接收數據時出現錯誤，打印錯誤並清理數據流
        .on('error', err => {
            console.error('Stream error', err);
            response.data.destroy();  // 關閉並清理數據流
        })
        // 將數據流解碼
        .pipe(decodedStream)
        // 利用 split2 將數據流分割為單獨的行
        .pipe(split2())
        // 將每一行通過轉換流進行處理
        .pipe(transformStream)
        // 當轉換流完成處理所有數據後
        .on('finish', () => {

            // 確保了即使文件的最後一部分日誌並未以時間戳記結束，它仍然可以被正確地添加到解析的日誌列表中。
            if (globalConfig.currentLog.length !== 0) {
                globalConfig.parsedLog.push(globalConfig.currentLog);
            }
            // 將解析的日誌以 JSON 格式返回給客戶端
            res.json(globalConfig.parsedLog);
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({error: err.message});
    }
};


export default ParsingLog;

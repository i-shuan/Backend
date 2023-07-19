import express from 'express';
import axios from 'axios';
import { Transform } from 'stream';
import split2 from 'split2';
import iconv from 'iconv-lite';
import DetectFileCode from './DetectFileCode.js';
import getStream from 'get-stream';



// 建立用於解析警告日誌的函數
const parseAlarmLog = (line, globalConfig) => {
    // 建立時間戳記的正則表達式
    const timeStampRegExp = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/;
    // 建立 alarmid 的正則表達式
    const alarmIdRegExp = /alarmid='([A-Z0-9]+)'/;

    // 檢查行是否包含 "TxName="AlarmCIM""
    if (line.match(/TxName="AlarmCIM"/)) {
        // 如果當前日誌(currentLog)不為空，則將其添加到已解析的日誌列表(parsedLog)中，然後清空當前日誌(currentLog)
        if (globalConfig.currentLog.length !== 0) {
            globalConfig.parsedLog.push(globalConfig.currentLog);
            globalConfig.currentLog = [];
        }
        // 將 isAlarmTxName 設置為真
        globalConfig.isAlarmTxName = true;
    // 檢查行是否包含時間戳記
    } else if (line.match(timeStampRegExp)) {
        // 如果包含，則將 isAlarmTxName 設置為假
        globalConfig.isAlarmTxName = false;
    }

    // 如果 isAlarmTxName 為真
    if (globalConfig.isAlarmTxName) {
        // 從行中匹配時間和 alarmid
        const time = line.match(timeStampRegExp);
        const alarmId = line.match(alarmIdRegExp);
        // 如果時間和 alarmid 都存在
        if (time !== null && alarmId !== null) {
            // 將時間、行內容和 alarmid 添加到當前日誌中
            globalConfig.currentLog.push({
                time: time[0],
                content: line,
                alarmId: alarmId[1]  // 從正則表達式匹配中獲取 alarmid
            });
        }
    }
};

const ParsingLog = async (filename, res) => {
    var globalConfig = {
        isAlarmTxName : false,
        parsedLog: [],
        currentLog: []
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

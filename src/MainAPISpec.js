// MainAPISpec.js
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import k8s from '@kubernetes/client-node';

/*創建 Kubernetes 配置和 API 客戶端 */
// const kc = new k8s.KubeConfig();
// const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
// kc.loadFromDefault();

/* API Files */
import ProcessFile from './API/ProcessFileToZIP.js';
import ProcessTest from './API/ProcessTest.js'
import MaskDownloadFile from './API/MaskDownloadFile.js'
import ExtractFileFromZip from './API/ExtractFileFromZip.js';

const api = express.Router();

/*創建一個新的路由來獲取 Kubernetes 命名空間列表 */
api.get('/k8s/namespaces', async (req, res) => {
  try {
      const response = await k8sApi.listNamespace();
      res.json(response.body);
  } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
  }
});

api.post('/extractFromZip', async (req, res) => {
  try {
      
      const result = await ExtractFileFromZip(req, res);
      console.log(result.message);
      
  } catch (error) {
    // res.status(500).json({
    //   status: 'fail',
    //   message: 'File processing failed'
    // });
  }
});

api.post('/test', async (req, res) => {
 
  const { filename } = req.body;
 
  try {
    if (filename.endsWith('.zip')) {
      try {
        await ProcessZipFile(filename);
        res.download(filePath);
      } catch (error) {
        res.status(500).send(`Error processing query: ${error}`);
      }
    } 
    else{
      try {
        const result = await MaskDownloadFile(filename, res);
        console.log(result.message);
      } catch (err) {
          res.status(500).json({
              status: 'fail',
              message: 'File processing failed'
        });
      }
    }
  } catch (error) {
    res.status(500).send(`Error processing query: ${error}`);
  }
 
});


export default api;

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
import ExtractFileFromZip from './API/ExtractFileFromZip.js';
import MutiAPIFlow from './API/Utils/MutiAPIFlow.js';
import {DownloadZipFromURL, ScanZipContent} from './API/DownloadFile/DownloadZip.js';
import {DownloadFileAsStream} from './API/DownloadFile/DownloadFileAsStream.js';
import {MaskFileStream} from './API/DownloadFile/MaskFileStream.js';

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

api.post('/get-zip-content', async (req, res) => {
  try {
      const zipUrl = 'https://example.com/path/to/your.zip';
      const zipBuffer = await DownloadZipFromURL(zipUrl);
      const fileNames = ScanZipContent(zipBuffer);

      res.json({
          files: fileNames
      });
  } catch (error) {
      res.status(500).send('An error occurred while fetching the ZIP content.');
  }
});

/**
 * @swagger
 * /api/mutiApiFlow:
 *   post:
 *     summary: Muti API Flow
 *     description: An API for executing multiple API flows.
 *     requestBody:
 *       $ref: "#/components/requestBodies/UserInput"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/SuccessfulResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
api.post('/mutiApiFlow', async (req, res) => {
 
  try {
    const result = await MutiAPIFlow();
    res.send(result);

  } catch (err) {
      console.error(err);
      res.status(500).send({ error: err.message });
  }
 
});

api.post('/test', async (req, res) => {
 
  try {
    const fileStream = await DownloadFileAsStream(req.params.filename);
    const maskedStream = MaskFileStream(fileStream);
    maskedStream.pipe(res);
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: err.message });
  }
 
});


export default api;

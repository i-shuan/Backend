// MainAPISpec.js
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ProcessFile from './API/ProcessFile.js';
import ProcessTest from './API/ProcessTest.js'

const api = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


api.get('/file/:id', async (req, res) => {
    const fileId = req.params.id;
    
    try {
        const result = await ProcessFile(fileId);
        res.send(result);
    } catch (error) {
        res.status(500).send(`Error processing file: ${error}`);
    }
});

api.post('/test', async (req, res) => {
  const { filename } = req.body;
  const filePath = path.resolve(__dirname, './DownloadedFiles', filename);

  if (fs.existsSync(filePath)) {
    console.log("__________________");
    res.download(filePath);
  } else {
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
        await ProcessFile(filename);
        console.log("filePath", filePath);
        res.download(filePath);
      }
    } catch (error) {
      res.status(500).send(`Error processing query: ${error}`);
    }
  }
});


export default api;

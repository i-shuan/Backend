import express from 'express';
import { Worker } from 'worker_threads';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// router.post('/downloadFile', (req, res) => {
//   const worker = new Worker(path.join(__dirname, './DownloadFile.js'));

//   worker.on('message', (message) => {
//     if (message.error) {
//       console.error(message.error);
//       res.status(500).json({ message: 'Error downloading or extracting file' });
//     } else {
//       fs.readFile(message.firstEntry, 'utf8', (err, data) => {
//         if (err) {
//           console.error(err);
//           res.status(500).json({ message: 'Error reading file' });
//         } else {
//           res.json({ data });
//         }
//       });
//     }
//   });

//   worker.postMessage('./Downloads.zip'); // replace with the path of your local zip file
// });

router.post('/test', (req, res) => {
  const worker = new Worker('./Test.js');

  worker.on('message', (message) => {
    console.log("message", message);
    if (message.error) {
      console.error(message.error);
      res.status(500).json({ message: 'Test Error' });
    } else {
      res.json({ message: 'Test Success' });
    }
  });

  worker.postMessage('Hello');
});

export default router;

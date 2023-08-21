import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { Transform } from 'stream';
import { Readable } from 'stream'; // 导入 Readable 类

// A transform stream to mask the content
class MaskTransform extends Transform {
    _transform(chunk, encoding, callback) {
        const maskedChunk = chunk.toString('utf-8').replace(/[a-zA-Z]/g, '*');
        this.push(maskedChunk);
        callback();
    }
}

const unzipStream = (zipPath, targetFile) => {
    const normalizedZipPath = path.normalize(zipPath);

    if (!fs.existsSync(normalizedZipPath)) {
        throw new Error('ZIP file does not exist.');
    }

    const zip = new AdmZip(normalizedZipPath);
    const zipEntry = zip.getEntry(targetFile);
    
    if (!zipEntry) {
        throw new Error('File not found in the ZIP archive.');
    }

     // Create a readable stream from the data using stream.Readable.from()
    const readableStream = Readable.from(async function*() {
        const chunkSize = 1024; // Adjust the chunk size as needed
        const data = zipEntry.getData();
        
        for (let i = 0; i < data.length; i += chunkSize) {
            yield data.slice(i, i + chunkSize);
        }
        
        // No need to yield null, just finish the generator.
    }());

    return readableStream;
}

const ExtractFileFromZip = async (req, res) => {
    try {
        console.log("req", req.body);

        // Get a stream for the file
        const fileStream = unzipStream(req.body.zipPath, req.body.targetFile);
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(req.body.targetFile));

        // Pipe the file stream through the mask transform and then to the response
        fileStream.pipe(new MaskTransform()).pipe(res);

    } catch (err) {
        console.error("Error::", err);
        if (!res.headersSent) {
            res.status(500).send({error: err.message});
        }
    }
}

export default ExtractFileFromZip;

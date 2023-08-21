import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

const unzip = (zipPath, targetFile) => {

    // Normalize and check the path
    const normalizedZipPath = path.normalize(zipPath);

    // Check if the file exists
    if (!fs.existsSync(normalizedZipPath)) {
        throw new Error('ZIP file does not exist.');
    }

    try {
        const zip = new AdmZip(normalizedZipPath);

        zip.getEntries().forEach(entry => {
            console.log(entry.entryName);
        });

        const zipEntry = zip.getEntry(targetFile);

        if (!zipEntry) {
            throw new Error('File not found in the ZIP archive.');
        }

        // 讀取檔案內容
        const fileData = zip.readFile(zipEntry);
        return fileData;

    } catch (err) {
        console.log("Error ::", err);
        throw err;
    }
}

const maskContent = (content) => {
    return content.replace(/[a-zA-Z0-9]/g, '*');
};

const ExtractFileFromZip = async (req, res) => {
    try {
        console.log("req", req.body);

        const fileData = unzip(req.body.zipPath, req.body.targetFile);
        const textContent = fileData.toString('utf-8');
        console.log("textContent", textContent)
        
        // Mask the textContent
         textContent = maskContent(textContent);
        // 設置正確的content-type
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(req.body.targetFile));
        res.send(textContent); // Send the modified content

    } catch (err) {
        console.error("Error::", err);

        if (!res.headersSent) {
            res.status(500).send({error: err.message});
        }
    }
}


export default ExtractFileFromZip;
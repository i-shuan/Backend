import axios from 'axios';
import AdmZip from 'adm-zip';

export async function downloadZipFromURL(url) {
    try {
        const response = await axios.post(url, {}, {
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        throw new Error('Error downloading ZIP file.');
    }
}

export function scanZipContent(zipBuffer) {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    return zipEntries.map(zipEntry => zipEntry.entryName);
}

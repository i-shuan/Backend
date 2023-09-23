import axios from 'axios';

export const DownloadFileAsStream = async (filename) => {
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

        response.data.on('error', err => {
            console.error('Stream error', err);
            response.data.destroy();  // Close and clean up the stream
        });

        return response.data;

    } catch (error) {
        throw new Error('Error fetching the file.');
    }
}

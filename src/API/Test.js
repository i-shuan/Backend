import { parentPort } from 'worker_threads';
import axios from 'axios';

parentPort.on('message', async (message) => {
  console.log('Received message:', message);

  try {
    // Convert the URL string back to a URL object
    const url = new URL(message.url);

    // Use axios to make a GET request with params
    const response = await axios.get(
        url.toString(), { 
            params: message.body 
        }
    );

    // Send the result back to the main thread
    parentPort.postMessage(response.data);
  } catch (error) {
    console.error('Error:', error);

    // Send an error message back to the main thread
    parentPort.postMessage({ error: error.message });
  }
});

import { parentPort } from 'worker_threads';

parentPort.on('message', async (message) => {
  console.log('Received message:', message);

  try {
    // 在这里执行您的逻辑，根据需要进行计算或其他操作

    // 假设逻辑完成后，将结果作为消息发送回主线程
    const result = 'Hello from the worker thread!';
    parentPort.postMessage(result);
  } catch (error) {
    console.error('Error:', error);

    // 发送错误消息回主线程
    parentPort.postMessage({ error: error.message });
  }
});

// 主文件
import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import createApp from './Settings.js';
import api from './MainAPISpec.js';

dotenv.config({ path: '../.env.local' });

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    const app = createApp();
    /*其實在告訴你的Express應用所有以/api開始的請求都應該由你的api路由處理, 即在你的MainAPISpec.js中定義的路由 */
    app.use('/api', api);

    app.listen(5000, () => {  // 所有工作进程都监听同一个端口
        console.log(`Worker ${cluster.worker.id} is running on port 5000`);
    });
}

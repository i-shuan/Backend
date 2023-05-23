import express from 'express';
import cors from 'cors';
import config from 'config';

const createApp = () => {
    const app = express();
    
    // 讀取設定檔案的值
    const allowedOrigins = config.get('allowedOrigins');

    // 設定 CORS
    app.use(cors({ origin: allowedOrigins }));
    app.use(express.json());

    return app;
};

export default createApp;

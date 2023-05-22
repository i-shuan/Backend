// Settings.js
import express from 'express';
import cors from 'cors';

const createApp = () => {
    const app = express();
    app.use(cors({ origin: 'http://localhost:3000' }));
    app.use(express.json());
    return app;
};

export default createApp;

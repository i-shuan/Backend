import app from './Settings.js';
import api from './MainAPI.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

app.use('/api', api);

app.listen(5000, () => {
  console.log('Server is running on port 5000.');
});

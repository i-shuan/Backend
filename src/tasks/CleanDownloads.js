import schedule from 'node-schedule';
import fs from 'fs-extra';
import path from 'path';

// 指定要清空的文件夹
const directoryPath = path.join(__dirname, '../DownloadedFiles');

// 每天凌晨 1 点执行任务
let job = schedule.scheduleJob('0 1 * * *', async function() {
    try {
        // 读取文件夹内容
        let files = await fs.readdir(directoryPath);
        
        // 遍历文件列表并删除
        for(const file of files) {
            await fs.remove(path.join(directoryPath, file));
        }
        
        console.log(`All files in ${directoryPath} have been deleted.`);
    } catch (err) {
        console.error(`Error while deleting files: ${err}`);
    }
});

import axios from 'axios';
import Config from '../../Config.js';


const MutiAPIFlow = async() => {

    const dbconfig = Config.dbConfig;
    try{
        // 使用 process.env 來訪問環境變量，並使用 JSON.parse 解析 JSON 字符串
        // const dbConfig = JSON.parse(process.env.DB_CONFIG);
        console.log(process.cwd());
        console.log('DB Host:', dbconfig.host);
        console.log('DB User:', dbconfig.user);
        console.log('DB Pass:', dbconfig.password);

        return dbconfig.host
    }
    catch(error){
        throw new Error(`[MutiAPIFlow] An error occurred: ${error.message}`);
    }   

}

export default MutiAPIFlow;
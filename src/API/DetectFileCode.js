import jschardet from 'jschardet';
import getStream from 'get-stream';
import iconv from 'iconv-lite';
import { PassThrough } from 'stream';

const DetectFileCode = async (dataStream) => {

    // 先把流数据转换成 Buffer
    const buffer = await getStream.buffer(dataStream);

    // 使用 jschardet 检测 Buffer 的编码
    const detected = jschardet.detect(buffer);
    console.log(`Detected encoding: ${detected.encoding}`);

    // 根据检测到的编码创建解码流
    const decodeStream = iconv.decodeStream(detected.encoding);

    // 把 Buffer 转换回 Stream
    const bufferStream = new PassThrough();
    bufferStream.end(buffer);

    // 使用正确的解码流处理数据
    const decodedStream = bufferStream.pipe(decodeStream);

    // 返回解码后的流
    return decodedStream;
};

export default DetectFileCode;

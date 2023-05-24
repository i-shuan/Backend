// DetectFileCode.js
import jschardet from 'jschardet';

const DetectFileCode = async (buffer) => {
    const result = jschardet.detect(buffer);
    return result.encoding;
};

export default DetectFileCode;

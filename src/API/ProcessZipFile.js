import unzipper from 'unzipper';
import fs from 'fs';

fs.createReadStream('path_to_your_zip_file.zip')
  .pipe(unzipper.Extract({ path: 'output_path' }))
  .on('finish', () => {
    console.log('Unzip Completed');
  })
  .on('error', (err) => {
    console.error("Something went wrong: ", err);
  });

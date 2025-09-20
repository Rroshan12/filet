import Busboy from 'busboy';
import fs from 'fs';
import path from 'path';

export default function filet(uploadDir = './uploads') {
  return (req, res, next) => {
    if (
      req.method === 'POST' &&
      req.headers['content-type']?.includes('multipart/form-data')
    ) {
      const busboy = Busboy({ headers: req.headers });
      req.files = {};
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      busboy.on('file', (fieldname, file, fileInfo) => {
        const saveTo = path.join(uploadDir, fileInfo.filename);
        const writeStream = fs.createWriteStream(saveTo);
        file.pipe(writeStream);
        file.on('end', () => {
          if (!req.files[fieldname]) req.files[fieldname] = [];
          req.files[fieldname].push({ filename: fileInfo.filename, path: saveTo });
        });
      });

      busboy.on('finish', () => {
        next();
      });

      req.pipe(busboy);
    } else {
      next();
    }
  };
}


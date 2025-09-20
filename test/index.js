import express from 'express';
import filet from '../lib/filetMiddleWare.js';

const app = express();

app.post('/upload', filet('test/file'), (req, res) => {
  res.json({ uploadedFiles: req.files });
});

export default app;

import assert from 'assert';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from './index.js';

const uploadDir = './test/file';

function cleanUploads() {
  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir).forEach((file) =>
      fs.unlinkSync(path.join(uploadDir, file))
    );
  } else {
    fs.mkdirSync(uploadDir);
  }
}


async function runTests() {
  cleanUploads();

  const res1 = await request(app)
    .post('/upload')
    .attach('file1', Buffer.from('Hello World'), 'hello.txt');

  assert.strictEqual(res1.statusCode, 200);
  assert(res1.body.uploadedFiles.file1, 'file1 field should exist');
  assert.strictEqual(res1.body.uploadedFiles.file1[0].filename, 'hello.txt');
  assert(fs.existsSync(path.join(uploadDir, 'hello.txt')), 'hello.txt should exist');

  console.log('✅ Single file upload passed');


  const res2 = await request(app)
    .post('/upload')
    .attach('photos', Buffer.from('File 1'), 'file1.jpg')
    .attach('photos', Buffer.from('File 2'), 'file2.jpg');

  assert.strictEqual(res2.statusCode, 200);
  assert(Array.isArray(res2.body.uploadedFiles.photos), 'photos field should be array');
  assert.strictEqual(res2.body.uploadedFiles.photos.length, 2);
  assert(fs.existsSync(path.join(uploadDir, 'file1.jpg')), 'file1.jpg should exist');
  assert(fs.existsSync(path.join(uploadDir, 'file2.jpg')), 'file2.jpg should exist');

  console.log('✅ Multiple files under same field passed');


  const res3 = await request(app)
    .post('/upload')
    .attach('photos', Buffer.from('Photo'), 'photo.jpg')
    .attach('documents', Buffer.from('Doc'), 'doc.pdf');

  assert.strictEqual(res3.body.uploadedFiles.photos[0].filename, 'photo.jpg');
  assert.strictEqual(res3.body.uploadedFiles.documents[0].filename, 'doc.pdf');
  assert(fs.existsSync(path.join(uploadDir, 'photo.jpg')), 'photo.jpg should exist');
  assert(fs.existsSync(path.join(uploadDir, 'doc.pdf')), 'doc.pdf should exist');

  console.log('✅ Multiple fields upload passed');

  console.log('All tests passed ✅');
}

// Run
runTests().catch((err) => {
  console.error('Test failed:', err);
});

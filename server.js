const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { randomFillSync } = require('crypto');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const busboy = require('busboy');
const morgan = require("morgan");
const bodyParser = require("body-parser");
const multer = require("multer")


const random = (() => {
  const buf = Buffer.alloc(16);
  return () => randomFillSync(buf).toString('hex');
})();

const succes_response = {
  code: 200,
  status: true,
  message: "Berhasil Simpan Video"
}

const error_response = {
  code: 500,
  status: false,
  message: "Gagal Simpan Video"
}

app.use(express.static("static"));
app.use(express.static(process.env.FILE));
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res) => {
  if (req.method === 'POST') {
    const bb = busboy({ headers: req.headers, highWaterMark: 100 * 1024 * 1024 });
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      const saveTo = path.join(process.env.FILE, filename);
      file.pipe(fs.createWriteStream(saveTo));
    });
    bb.on('close', () => {
      res.writeHead(200, { 'Connection': 'close' });
      res.end(JSON.stringify(succes_response));
    });
    req.pipe(bb);
    return;
  }
  res.writeHead(404);
  res.end(JSON.stringify(error_response));
}).listen(process.env.PORT, () => {
  console.log('Listening for requests:' + process.env.PORT);
});


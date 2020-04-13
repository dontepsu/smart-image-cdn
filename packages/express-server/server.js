const express = require('express')
const {
  ImageProcessor,
  FileSystemImageResource,
} = require('@image-cdn/image-processor');
const path = require('path');
const qs = require('qs');
const imageBaseDir = path.join(__dirname, '../../data');
const processedImageBaseDir = path.join(__dirname, '../../data_processed');

const imageProcessor = new ImageProcessor(
  new FileSystemImageResource(imageBaseDir),
  new FileSystemImageResource(processedImageBaseDir),
);

const app = express();
const port = 3042;

app.get('*', async (req, res) => {
  if (req.path === '/favicon.ico') {
    res.sendStatus(404);
  }
  try {
    // express does not provide raw querystring...
    const queryString = qs.stringify(req.query);
    const response = await imageProcessor.getImageOrProcess(
      req.path,
      queryString,
      req.accepts('image/webp'), 
    );

      res
        .set({
          'Content-Type': response.contentType,
          'Content-Length': response.size,
        })
        .send(response.image);
  } catch (e) {
    res.sendStatus(404);
  }
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
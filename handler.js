'use strict'

const formParser = require('./form-parser')
const pixelmatch = require('pixelmatch')
const PNG = require('pngjs').PNG
const Jimp = require('jimp').default

// eslint-disable-next-line import/prefer-default-export
export const diff = (event, context, callback) => {
  formParser.parse(event).then(async (data) => {
    console.log(data['file1'])
    const img1a = await Jimp.read(data['file1'])
    const {width, height} = img1a.bitmap
    const buf1 = await img1a.getBufferAsync(Jimp.MIME_PNG)
    const img1 = PNG.sync.read(buf1)
    
    const img2a = await Jimp.read(data['file2'])
    img2a.cover( width, height )
    const buf2 = await img2a.getBufferAsync(Jimp.MIME_PNG)
    const img2 = PNG.sync.read(buf2)
    
    const diff = new PNG({width, height})
    pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1})
    // fs.writeFileSync('diff.png', PNG.sync.write(diff))

    const response = {
        statusCode: 200,
        body: PNG.sync.write(diff).toString('base64'),
        isBase64Encoded: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          "Content-Type": "image/png",
        },
    }
    callback(null, response)
  }).catch((err) => {
    callback(err)
  })
}

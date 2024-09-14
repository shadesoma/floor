import {createSocket} from 'dgram';
import {Jimp} from "jimp";

const jimp = require('jimp');

const redBit = 0xff0000ff;
const greenBit = 0x00ff00ff;
const blueBit = 0x0000ffff;

const panelWidthX = 19;
const panelHeightY = 13;

const UDP_IP = "192.168.0.7";
const pannelsX = [6, 4, 4, 5];
const ports = [24, 23, 22, 21];
const pannelsY = panelHeightY;

const prefix = Buffer.from([0xd4, 0xad, 0x20, 0x42, 0xbc, 0x4f, 0x74, 0x56, 0x3c, 0x12, 0x78, 0xf9, 0x08, 0x00, 0x45]);
const wtf = Buffer.from([0x00, 0x00, 0xe1, 0x90, 0x21, 0x00, 0x00, 0x80, 0x11, 0x00, 0x00, 0xc0, 0xa8, 0x00, 0xc9, 0xc0, 0xa8, 0x00, 0x07, 0x09, 0x0d, 0x00, 0x15, 0x00, 0xcd, 0x82, 0xff, 0xff, 0xff]);

const img = new Jimp({width: panelWidthX, height: panelHeightY});

type JimpImage = typeof img;

export const drawLineX = (img: JimpImage, color: number, lineNumber: number, panelWidthX: number) => {
  for (let i = 0; i < panelWidthX; i++) {
    img.setPixelColor(color, i, lineNumber)
  }
}

async function getImagePixels(floorWidth: number, floorHeight: number): Promise<Buffer> {

  // У
  img.setPixelColor(redBit, 0, 1)
  img.setPixelColor(redBit, 1, 2);
  img.setPixelColor(redBit, 2, 3);
  img.setPixelColor(redBit, 3, 4);
  img.setPixelColor(redBit, 4, 3);
  img.setPixelColor(redBit, 5, 2);
  img.setPixelColor(redBit, 6, 1);
  img.setPixelColor(redBit, 2, 5);
  img.setPixelColor(redBit, 1, 6);
  img.setPixelColor(redBit, 0, 7);

  // Р
  img.setPixelColor(redBit, 8, 1)
  img.setPixelColor(redBit, 8, 2)
  img.setPixelColor(redBit, 8, 3)
  img.setPixelColor(redBit, 8, 4)
  img.setPixelColor(redBit, 8, 5)
  img.setPixelColor(redBit, 8, 6)
  img.setPixelColor(redBit, 8, 7)
  img.setPixelColor(redBit, 9, 1)
  img.setPixelColor(redBit, 10, 1)
  img.setPixelColor(redBit, 11, 1)
  img.setPixelColor(redBit, 11, 2)
  img.setPixelColor(redBit, 11, 3)
  img.setPixelColor(redBit, 11, 4)
  img.setPixelColor(redBit, 10, 4)
  img.setPixelColor(redBit, 9, 4)

  // А
  img.setPixelColor(redBit, 13, 1)
  img.setPixelColor(redBit, 14, 1)
  img.setPixelColor(redBit, 15, 1)
  img.setPixelColor(redBit, 16, 1)
  img.setPixelColor(redBit, 13, 1)
  img.setPixelColor(redBit, 13, 2)
  img.setPixelColor(redBit, 13, 3)
  img.setPixelColor(redBit, 13, 4)
  img.setPixelColor(redBit, 13, 5)
  img.setPixelColor(redBit, 13, 6)
  img.setPixelColor(redBit, 13, 7)
  img.setPixelColor(redBit, 16, 2)
  img.setPixelColor(redBit, 16, 3)
  img.setPixelColor(redBit, 16, 4)
  img.setPixelColor(redBit, 16, 5)
  img.setPixelColor(redBit, 16, 6)
  img.setPixelColor(redBit, 16, 7)
  img.setPixelColor(redBit, 14, 4)
  img.setPixelColor(redBit, 15, 4)

  drawLineX(img, greenBit, 9, panelWidthX)
  drawLineX(img, blueBit, 10, panelWidthX)
  drawLineX(img, greenBit, 11, panelWidthX)
  drawLineX(img, blueBit, 12, panelWidthX)

  const pixels: Buffer[] = [];

  for (let y = 0; y < floorHeight; y++) {
    const line: number[] = []
    for (let x = 0; x < floorWidth; x++) {
      // const color = img.getPixelColor(x, y);
      // // записываем цвет в байтах
      // line.push(color)

      const {r, g, b} = jimp.intToRGBA(img.getPixelColor(x, y));
      // записать цвет в масив нужно в этом порядке G B R
      line.push(Number(`${g}${b}${r}`))
    }
    pixels.push(Buffer.from(line))
  }

  console.log(pixels)

  // await img.write(`/home/soma/Загрузки/test.png`)

  return Buffer.concat(pixels);
}

const floorMiddleware = () => {
  (async () => {
    const bPixels = await getImagePixels(panelWidthX, panelHeightY);

    const client = createSocket('udp4');
    client.bind(2317, '192.168.0.201');

    let slice = 0;

    for (let port = 0; port < 4; port++) {
      const sliceNow = pannelsX[port] * pannelsY * 3;
      const buff = Buffer.concat([prefix, wtf, bPixels.slice(slice, slice + sliceNow)]);
      console.log(bPixels.slice(slice, slice + sliceNow));
      client.send(buff, ports[port], UDP_IP, (err) => {
        if (err) console.error(err);
      });
      slice += sliceNow;
    }
  })();
}

export default floorMiddleware;

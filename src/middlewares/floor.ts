import dgram from 'dgram';
import {Jimp} from "jimp";
import {Buffer} from 'node:buffer';

const socket = dgram.createSocket('udp4');

const jimp = require('jimp');

const redBit = 0xff0000ff;
const greenBit = 0x00ff00ff;
const blueBit = 0x0000ffff;

const panelWidthX = 19;
const panelHeightY = 13;

const socketIp = '192.168.0.201';
// const socketIp = '127.0.0.1';
const socketPort = 2317;
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

function getImagePixelsToBytes(floorWidth: number, floorHeight: number): Buffer[] {

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

  // const pixels: Buffer[] = [];

  // for (let y = 0; y < floorHeight; y++) {
  //   const line: number[] = []
  //   for (let x = 0; x < floorWidth; x++) {
  //     // const color = img.getPixelColor(x, y);
  //     // // записываем цвет в байтах
  //     // line.push(color)
  //
  //     const {r, g, b} = jimp.intToRGBA(img.getPixelColor(x, y));
  //     //записать цвет в масив нужно в этом порядке G B R
  //     line.push(Number(`${g}${b}${r}`))
  //   }
  //   pixels.push(Buffer.from(line))
  // }

  const bufferLines: Buffer[] = []

  let currentX = 0

  for (let segment = 0; segment < pannelsX.length; segment++) {
    const segments: Buffer[] = []
    let currentY = 0;
    for (let x = currentX; x < pannelsX[segment] + currentX; x++) {
      const line: number[] = []
      for (let y = 0; y < floorHeight; y++) {
        if (currentY < floorHeight) {
          const {r, g, b} = jimp.intToRGBA(img.getPixelColor(currentX, currentY));
          //записать цвет в масив нужно в этом порядке G B R
          line.push(Number(`${g}${b}${r}`))

          if (currentY !== floorHeight - 1) {
            currentY++
          } else {
            currentY = (floorHeight - 1) * 2
          }
        } else {
          const {r, g, b} = jimp.intToRGBA(img.getPixelColor(x, currentY - floorHeight));
          //записать цвет в масив нужно в этом порядке G B R
          line.push(Number(`${g}${b}${r}`))
          if (currentY > floorHeight) {
            currentY--
          } else {
            currentY = 0
          }
        }
      }
      segments.push(Buffer.from(line))
    }
    currentX += pannelsX[segment]

    bufferLines.push(Buffer.concat(segments))
  }

  // await img.write(`/home/soma/Загрузки/test.png`)

  // console.log(bufferLines)

  return bufferLines;
}

function sendBytes() {
  const bufLinesForPorts = getImagePixelsToBytes(panelWidthX, panelHeightY);

  let slice = 0;

  // console.log(bufLinesForPorts)

  for (let port = 0; port < 4; port++) {
    const sliceNow = pannelsX[port] * pannelsY;
    const portBufData = bufLinesForPorts[port];
    const buff = Buffer.concat([prefix, wtf, portBufData]);
    console.log(portBufData);
    socket.send(buff, ports[port], UDP_IP, (err) => {
      if (err) console.error(err);
    });
    slice += sliceNow;
  }

  // Добавить потом
  //socket.close()
}

const floorMiddleware = () => {
  socket.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    socket.close();
  });


  socket.bind({address: socketIp, port: socketPort}, () => {
    console.log(`Сокет открыт по адресу:${socketIp} на порту:${socketPort}\n`)
    sendBytes()
  });
}

export default floorMiddleware;

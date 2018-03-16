import { makeLogger } from "./logging/Logger";

const log = makeLogger("Pixelator");

export default class Pixelator {
  static _extractImageData(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);

    return context.getImageData(0, 0, img.width, img.height);
  }
  static _getImg(src) {
    const img = document.createElement("img");
    img.src = src;

    return img;
  }
  init(img) {
    return new Promise((resolve, reject) => {
      this.img = Pixelator._getImg(img);
      this.img.addEventListener("load", () => {
        this.imagedata = Pixelator._extractImageData(this.img);
        resolve(this);
      });
      this.img.addEventListener("error", () => {
        reject("error loading image");
      });
    });
  }
  getPixel(x, y) {
    const position = (x + this.imagedata.width * y) * 4;
    const data = this.imagedata.data;
    return {
      r: data[position + 0],
      g: data[position + 1],
      b: data[position + 2],
      a: data[position + 3]
    };
  }
  getImageData() {
    return this.imagedata;
  }
}

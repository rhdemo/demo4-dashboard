import { makeLogger } from "../logging/Logger";

const log = makeLogger("ImageSource");

export default class ImageSource {
  constructor() {
    this.handlers = [];
  }
  onImage(fn) {
    log("registering onImage handler");
    this.handlers.push(fn);
  }
  _handleImage(image) {
    log("handling image");
    this.handlers.forEach(fn => fn(image));
  }
}

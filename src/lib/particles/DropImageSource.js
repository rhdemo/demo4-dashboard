import ImageSource from "./ImageSource.js";
import Pixelator from "./Pixelator.js";
import Drop from "./Drop.js";
import { makeLogger } from "../logging/Logger";

const log = makeLogger("DropImageSource");

export default class DropImageSource extends ImageSource {
  constructor() {
    super();
    log("created");

    this._initDrop();
  }
  _initDrop() {
    this.drop = new Drop({
      node: "body",
      dropEffect: "copy"
    });
    this.drop.ondrop = dropData => {
      dropData.files.forEach(f => {
        var reader = new FileReader();
        reader.addEventListener("load", () => {
          const pixelator = new Pixelator();
          pixelator.init(reader.result).then(p => {
            this._processDroppedImage(p.getImageData());
          });
        });
        reader.readAsDataURL(f.file);
      });
    };
    document.ondrop = document.ondragover = e => e.preventDefault();
  }
  _processDroppedImage(image) {
    log("processing dropped image");
    this._handleImage(image);
  }
}

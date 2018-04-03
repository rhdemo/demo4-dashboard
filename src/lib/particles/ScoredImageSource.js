import ImageSource from "./ImageSource.js";
import Pixelator from "./Pixelator.js";
import { makeLogger } from "../logging/Logger";
import ScoreStream from "../server/ScoreStream.js";

const log = makeLogger("ScoredImageSource");

export default class ScoredImageSource extends ImageSource {
  constructor() {
    super();
    log("created");

    this._initScoreStream();
  }
  _initScoreStream() {
    const serviceUrl = `ws://${location.hostname}:1234/images`;
    this.scoreStream = new ScoreStream(serviceUrl);
    this.scoreStream.addEventListener("open", () =>
      console.log("[ScoredImageSource] stream open")
    );
    this.scoreStream.addEventListener("message", msg => {
      if (!msg.data) {
        return;
      }

      let data;

      try {
        data = JSON.parse(msg.data);
      } catch (e) {
        console.error(`couldn't decode JSON:`);
        console.error(msg.data);
        return;
      }

      log(`received image: ${data.imageURL.slice(data.imageURL.length - 25)}`);
      const pixelator = new Pixelator();
      pixelator.init(data.image).then(p => {
        log(`pixels retrieved for image: ${data.imageURL}`);
        data.pixels = p.getImageData();
        this._handleImage(data);
      });
    });
  }
}

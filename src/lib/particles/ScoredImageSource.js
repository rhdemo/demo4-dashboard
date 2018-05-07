import ImageSource from "./ImageSource.js";
import Pixelator from "./Pixelator.js";
import { makeLogger } from "../logging/Logger";
import ScoreStream from "../server/ScoreStream.js";

const log = makeLogger("ScoredImageSource");

export default class ScoredImageSource extends ImageSource {
  constructor({ stormCallback } = {}) {
    super();
    log("created");

    this._initScoreStream({ stormCallback });
  }
  _initScoreStream({ stormCallback } = {}) {
    let serviceUrl;
    if (location.hostname.includes(".com")) {
      serviceUrl =
        "ws://demo4-dashboard-service-demo4-dashboard.apps.summit-aws.sysdeseng.com/images/approved";
    } else if (location.hostname.includes("localhost")) {
      serviceUrl = "ws://localhost:1234/images/approved";
    } else {
      serviceUrl = `ws://${location.hostname}:1234/images/approved`;
    }
    this.scoreStream = new ScoreStream({ url: serviceUrl });
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

      if (data.hasOwnProperty("storm")) {
        stormCallback(data);
      } else {
        log(
          `received image: ${data.imageURL.slice(data.imageURL.length - 25)}`
        );
        const pixelator = new Pixelator();
        pixelator.init(data.image).then(p => {
          if (window.leaderboard) {
            leaderboard.pictureCount = data.totalPictureCount;
            leaderboard.totalPoints = data.totalPoints;
          }
          log(`pixels retrieved for image: ${data.imageURL}`);
          data.pixels = p.getImageData();
          this._handleImage(data, p.img);
        });
      }
    });
  }
}

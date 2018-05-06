import Vue from "../../node_modules/vue/dist/vue.esm.js";
import { take, findIndex } from "lodash";
import { makeLogger } from "../lib/logging/Logger.js";
import ScoreStream from "../lib/server/ScoreStream.js";

const log = makeLogger("Approve");

// infer the correct host to connect to based on current hostname
let serverHost;
if (location.hostname.includes(".com")) {
  serverHost =
    "demo4-dashboard-service-demo4-dashboard.apps.summit-aws.sysdeseng.com";
} else if (location.hostname.includes("localhost")) {
  serverHost = "localhost:1234";
} else {
  serverHost = `${location.hostname}:1234`;
}

const app = new Vue({
  el: "#approve-app",
  data: {
    scoredImages: []
  },
  methods: {
    approve: function(event) {
      const i = event.target.dataset.index;
      const id = this.scoredImages[i].id;
      log(`approve ${i}`);
      fetch(`http://${serverHost}/images/approve/${id}`);
      this.removeImage(i);
    },
    reject: function(event) {
      const i = event.target.dataset.index;
      const id = this.scoredImages[i].id;
      log(`reject ${i}`);
      fetch(`http://${serverHost}/images/reject/${id}`);
      this.removeImage(i);
    },
    removeImage: function(i) {
      this.scoredImages.splice(i, 1);
    }
  }
});

// it's hacky time
window.app = app;

const scoreStream = new ScoreStream({ url: `ws://${serverHost}/images/all` });

scoreStream.addEventListener("open", () => log("stream open"));
scoreStream.addEventListener("message", msg => {
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

  // if there are empty spaces in the pending image array, inject there, otherwise push onto the end
  app.scoredImages.push(data);

  // const pixelator = new Pixelator();
  // pixelator.init(data.image).then(p => {
  //   if (window.leaderboard) {
  //     leaderboard.pictureCount = data.totalPictureCount;
  //     leaderboard.totalPoints = data.totalPoints;
  //   }
  //   log(`pixels retrieved for image: ${data.imageURL}`);
  //   data.pixels = p.getImageData();
  //   this._handleImage(data, p.img);
  // });
});

// this.scoreStream = new ScoreStream({ url: serviceUrl });
// this.scoreStream.addEventListener("open", () =>
//   console.log("[ScoredImageSource] stream open")
// );
// this.scoreStream.addEventListener("message", msg => {
//   if (!msg.data) {
//     return;
//   }

//   let data;

//   try {
//     data = JSON.parse(msg.data);
//   } catch (e) {
//     console.error(`couldn't decode JSON:`);
//     console.error(msg.data);
//     return;
//   }

//   log(`received image: ${data.imageURL.slice(data.imageURL.length - 25)}`);
//   const pixelator = new Pixelator();
//   pixelator.init(data.image).then(p => {
//     if (window.leaderboard) {
//       leaderboard.pictureCount = data.totalPictureCount;
//       leaderboard.totalPoints = data.totalPoints;
//     }
//     log(`pixels retrieved for image: ${data.imageURL}`);
//     data.pixels = p.getImageData();
//     this._handleImage(data, p.img);
//   });
// });

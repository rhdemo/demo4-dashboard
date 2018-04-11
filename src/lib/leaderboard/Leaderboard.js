import Vue from "../../../node_modules/vue/dist/vue.esm.js";
import { take } from "lodash";
import { makeLogger } from "../logging/Logger.js";

const log = makeLogger("Leaderboard");

log("leaderboard initializing");

const app = new Vue({
  el: "#dashboard",
  data: {
    pictureCount: 0,
    totalPoints: 0,
    currentPlayers: 0,
    top10: [],
    ord: ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th"]
  }
});

// it's hacky time
window.leaderboard = app;

function update() {
  let serviceUrl;
  if (location.hostname.includes(".com")) {
    serviceUrl =
      "http://demo4-dashboard-service-demo4-dashboard.apps.summit-aws.sysdeseng.com/leaders";
  } else if (location.hostname.includes("localhost")) {
    serviceUrl = "http://localhost:1234/leaders";
  } else {
    serviceUrl = `http://${location.hostname}:1234/leaders`;
  }
  fetch(serviceUrl)
    .then(rsp => rsp.json())
    .then(leaders => {
      app.top10 = take(leaders.top10, 10);
      app.currentPlayers = leaders.currentPlayers;
    });
}

setInterval(update, 1000);

import Vue from "../../../node_modules/vue/dist/vue.esm.js";
import { take } from "lodash";
import { makeLogger } from "../logging/Logger.js";

const log = makeLogger("Leaderboard");

log("leaderboard initializing");

const app = new Vue({
  el: "#dashboard",
  data: {
    // default starting data so the leaderboard isn't blank if there's no
    // connection to the service, it' just a snapshot of random data from
    // microservice B
    currentPlayers: 0,
    top10: [],
    ord: ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th"]
  }
});

function update() {
  let serviceUrl;
  if (location.hostname === "localhost") {
    serviceUrl = "http://localhost:1234/leaders";
  } else {
    serviceUrl =
      "http://demo4-dashboard-service-demo4-dashboard.apps.summit-aws.sysdeseng.com/leaders";
  }
  fetch(serviceUrl)
    .then(rsp => rsp.json())
    .then(leaders => {
      app.top10 = take(leaders.top10, 10);
      app.currentPlayers = leaders.currentPlayers;
    });
}

setInterval(update, 1000);

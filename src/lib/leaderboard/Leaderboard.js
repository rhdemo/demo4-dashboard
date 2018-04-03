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
    top10: [
      {
        name: "692fa26d-57b4-44c9-a4cd-7ca2d4a67663",
        score: 884,
        achievements: {}
      },
      {
        name: "fd841a2e-4880-4f6d-91ed-a35dfb580ac0",
        score: 812,
        achievements: {}
      },
      {
        name: "eb09c9c7-9322-4b7f-a75e-04273de2ae96",
        score: 743,
        achievements: {}
      },
      {
        name: "af2c7b99-4fb2-4f6e-8cd2-ad4c553b4926",
        score: 652,
        achievements: {}
      },
      {
        name: "bed0902d-c3b3-4728-9e26-301857abe53b",
        score: 636,
        achievements: {}
      },
      {
        name: "5e0d2007-4832-462c-a316-42f4c8e2e803",
        score: 584,
        achievements: {}
      },
      {
        name: "afef4186-7669-4237-8bca-1c2350c94962",
        score: 571,
        achievements: {}
      },
      {
        name: "d6188f36-e966-452a-8bf7-36981537300b",
        score: 400,
        achievements: {}
      },
      {
        name: "a6c2c57a-8c35-4613-9719-90dc28c84ff5",
        score: 294,
        achievements: {}
      },
      {
        name: "6227a04c-afb8-4f22-8b31-b9e19f543239",
        score: 92,
        achievements: {}
      }
    ],
    ord: ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th"]
  }
});

function update() {
  const serviceUrl = `${location.protocol}//${location.hostname}:1234/leaders`;
  fetch(serviceUrl)
    .then(rsp => rsp.json())
    .then(leaders => {
      app.top10 = take(leaders.top10, 10);
      app.currentPlayers = leaders.currentPlayers;
    });
}

setInterval(update, 1000);

const fetch = require("node-fetch");
const http = require("http");
const _ = require("lodash");

let leaders = [];

function update() {
  http
    .get(
      "http://score-gateway-scavenger-hunt-microservice.apps.summit-aws.sysdeseng.com/leaderboard",
      res => {
        const { statusCode } = res;
        const contentType = res.headers["content-type"];

        let error;
        if (statusCode !== 200) {
          error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
        } else if (error) {
          console.error(error.message);
          // consume response data to free up memory
          res.resume();
          return;
        }

        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", chunk => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            const parsedData = JSON.parse(rawData);
            parsedData.top10 = _.uniqBy(parsedData.top10, "playerId"); // remove any duplicate playerIds
            leaders = parsedData;
          } catch (e) {
            console.error(e.message);
          }
        });
      }
    )
    .on("error", e => {
      console.error(`Got error: ${e.message}`);
    });

  // fetch(
  //   "http://vertx-player-microservice-b.apps.summit-aws.sysdeseng.com/leaderboard"
  // )
  //   .then(rsp => rsp.json())
  //   .then(json => {
  //     leaders = json;
  //   });
}

function get() {
  return leaders;
}

setInterval(update, 1000);

module.exports = { get };

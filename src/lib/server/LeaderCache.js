const fetch = require("node-fetch");

let leaders = [];

function update() {
  fetch(
    "http://vertx-player-microservice-b.apps.summit-aws.sysdeseng.com/leaderboard"
  )
    .then(rsp => rsp.json())
    .then(json => {
      leaders = json.top10;
    });
}

function get() {
  return leaders;
}

setInterval(update, 800);

module.exports = { get };

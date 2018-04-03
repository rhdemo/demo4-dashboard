const Html5Websocket = require("html5-websocket");
const ReconnectingWebSocket = require("reconnecting-websocket");

const KEEPALIVE_INTERVAL = 5 * 1000;

class ScoreStream extends ReconnectingWebSocket {
  constructor(url, keepalive = false) {
    super(url, undefined, { constructor: Html5Websocket });

    this.addEventListener("open", () => {
      console.log("[ScoreStream] connected");

      if (keepalive) {
        this.keepalive();
      }
    });

    this.addEventListener("error", err => {
      console.log(`[ScoreStream] error: ${err}`);
    });

    this.addEventListener("close", () => {
      console.log("[ScoreStream] closed");
    });
  }
  keepalive() {
    this.send(JSON.stringify({ ping: true }));
    setTimeout(() => this.keepalive(), KEEPALIVE_INTERVAL);
  }
}

module.exports = ScoreStream;

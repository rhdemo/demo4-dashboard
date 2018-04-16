const Html5Websocket = require("html5-websocket");
const ReconnectingWebSocket = require("reconnecting-websocket");

const KEEPALIVE_INTERVAL = 5 * 1000;

class ScoreStream extends ReconnectingWebSocket {
  constructor(url, keepalive = false) {
    super(url, undefined, {
      constructor: Html5Websocket,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1500,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 60 * 60 * 1000,
      maxRetries: Infinity,
      debug: false
    });

    this.onerror = err =>
      console.log(`[ScoreStream] Error: ${err.code}, ${err}`);

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

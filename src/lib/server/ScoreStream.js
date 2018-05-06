const Html5Websocket = require("html5-websocket");
const ReconnectingWebSocket = require("reconnecting-websocket");
const nanoid = require("nanoid");

const KEEPALIVE_INTERVAL = 5 * 1000;

class ScoreStream extends ReconnectingWebSocket {
  constructor({ url, keepalive = false } = {}) {
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
      console.log(`[ScoreStream] connected to ${url}`);

      if (keepalive) {
        this.keepalive();
      }
    });

    // add an id to the message
    this.addEventListener("message", msg => {
      if (msg.data) {
        let data;
        try {
          data = JSON.parse(msg.data);
        } catch (e) {
          console.error(
            `[Server] error occurred while JSON decoding: ${msg.data}`
          );
          return;
        }
        data.id = nanoid();
        msg.data = JSON.stringify(data);
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

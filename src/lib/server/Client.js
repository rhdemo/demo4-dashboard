const nanoid = require("nanoid");

class Client {
  constructor(ws) {
    this.id = nanoid();
    this.ws = ws;
  }
}

module.exports = Client;

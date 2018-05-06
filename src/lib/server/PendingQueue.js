const _ = require("lodash");

class PendingQueue {
  constructor() {
    this.pending = [];
    this.approved = [];
    this.rejected = [];
  }
  push(image) {
    this.pending.push(image);
  }
  approve(id) {
    console.log(`[PendingQueue] approving ${id}`);
    return this._moveTo(id, this.approved);
  }
  reject(id) {
    console.log(`[PendingQueue] reject ${id}`);
    return this._moveTo(id, this.rejected);
  }
  _moveTo(id, array) {
    const image = _.find(this.pending, { id });
    if (image) {
      array.push(image);
      _.remove(this.pending, image);
    } else {
      console.warn(`[PendingQueue] couldn't find ${id} in pending queue`);
    }
    return image;
  }
}

module.exports = PendingQueue;

class LogWriter {
  constructor(name = "Unnamed") {
    this.name = name;
  }
  log(...msg) {
    console.log(`[${this.name}] ${msg.join(" ")}`);
  }
}

export default LogWriter;

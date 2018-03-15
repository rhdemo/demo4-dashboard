import LogWriter from "./LogWriter.js";

// make a custom log writer, return only the bound log function
function makeLogger(name) {
  const logWriter = new LogWriter(name);
  return logWriter.log.bind(logWriter);
}

export { makeLogger };

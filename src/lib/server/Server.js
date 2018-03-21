const Hapi = require("hapi");
const LeaderCache = require("./LeaderCache");

const server = Hapi.server({
  port: 1234,
  host: "localhost",
  routes: {
    cors: true
  }
});

server.route({
  method: "GET",
  path: "/leaders",
  handler: (request, h) => {
    return LeaderCache.get();
  }
});

const init = async () => {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

init();

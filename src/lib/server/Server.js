const Hapi = require("hapi");
const _ = require("lodash");
const hapiWebSocket = require("hapi-plugin-websocket");
const Client = require("./Client");
const LeaderCache = require("./LeaderCache");
const PendingQueue = require("./PendingQueue");
const ScoreStream = require("./ScoreStream");
const WebSocket = require("ws");
const fetch64 = require("fetch-base64");
const nanoid = require("nanoid");

const model = {
  totalPoints: 0,
  totalPictureCount: 0
};

const scores = new ScoreStream({
  url:
    process.env.NODE_ENV === "test"
      ? "ws://localhost:1235/dashboard"
      : "ws://score-gateway-scavenger-hunt-microservice.apps.summit-aws.sysdeseng.com/dashboard",
  keepalive: true
});

const server = Hapi.server({
  port: 1234,
  routes: {
    cors: true
  }
});

///////////////////
//  Leaderboard  //
///////////////////

server.route({
  method: "GET",
  path: "/leaders",
  handler: (request, h) => {
    return LeaderCache.get();
  }
});

////////////////////
//  Image scores  //
////////////////////

const approvalClients = [];
const dashboardClients = [];
const queue = new PendingQueue();

server.route({
  method: "GET",
  path: "/images/approve/{id}",
  handler: (request, h) => {
    console.log(`[Server] received approval of ${request.params.id}`);
    const image = queue.approve(request.params.id);
    dashboardClients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(image));
      }
    });
    return "approved";
  }
});

server.route({
  method: "GET",
  path: "/images/reject/{id}",
  handler: (request, h) => {
    console.log(`[Server] received rejection of ${request.params.id}`);
    queue.reject(request.params.id);
    return "rejected";
  }
});

server.route({
  method: "POST",
  path: "/images/all",
  config: {
    plugins: {
      websocket: {
        only: true,
        autoping: 30 * 1000,
        connect: ({ ctx, wss, ws, req, peers }) => {
          approvalClients.push(new Client(ws));
          console.log(
            `[Server] approval client connected.  all clients: `,
            _.map(approvalClients, "id")
          );
        },
        disconnect: ({ ctx, ws }) => {
          // approvalClients.splice(_.findIndex(approvalClients, { ws }), 1);
          _.remove(approvalClients, { ws });
          console.log(
            `[Server] approval client disconnected.  all clients: `,
            _.map(approvalClients, "id")
          );
        }
      }
    }
  },
  handler: (request, h) => {
    return "";
  }
});

server.route({
  method: "POST",
  path: "/images/approved",
  config: {
    plugins: {
      websocket: {
        only: true,
        autoping: 30 * 1000,
        connect: ({ ctx, wss, ws, req, peers }) => {
          dashboardClients.push(new Client(ws));
          console.log(`[Server] dashboard client connected`);
        },
        disconnect: ({ ctx, ws }) => {
          _.remove(dashboardClients, { ws });
          console.log(`[Server] dashboard client disconnected`);
        }
      }
    }
  },
  handler: (request, h) => {
    return "";
  }
});

// send scores
scores.addEventListener("message", msg => {
  if (msg.data) {
    // console.log(
    //   `[Server] forwarding image score to client:\n${msg.data}`
    // );
    let data;
    try {
      data = JSON.parse(msg.data);
    } catch (e) {
      console.error(`[Server] error occurred while JSON decoding: ${msg.data}`);
      return;
    }
    if (!data.imageURL) {
      return;
    }

    console.log(`[Server] received image ${data.id}`);

    // update running totals
    model.totalPoints += data.score;
    model.totalPictureCount += 1;

    data.totalPoints = model.totalPoints;
    data.totalPictureCount = model.totalPictureCount;
    // data.id = nanoid(); // add an id to track during round trip to approval client and back

    fetch64
      .remote(data.imageURL)
      .then(result => {
        const encodedImage = result[1];
        console.log(
          `[Server] image retrieved and encoded: ... ${data.imageURL.slice(
            data.imageURL.length - 25
          )}`
        );
        data.image = encodedImage;

        queue.push(data);

        approvalClients.forEach(client => {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
          }
        });
      })
      .catch(err => {
        queue.push(data);
        approvalClients.forEach(client => {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
          }
        });
      });
  }
});

const init = async () => {
  await server.register(hapiWebSocket);
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on("unhandledRejection", err => {
  console.error(err);
  // process.exit(1);
});

init();

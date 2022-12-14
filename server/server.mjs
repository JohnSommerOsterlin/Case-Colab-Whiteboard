import express from "express";
import { WebSocketServer } from "ws";

// creating websocket server
const wss = new WebSocketServer({ noServer: true });
const app = express();
app.use(express.static("../client/whiteboard/build"));
const port = 8080;
const expressServer = app.listen(port, () =>
  console.log(`Running on port ${port}`)
);

// Handeling upgrade
expressServer.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (websocket) => {
    wss.emit("connection", websocket, request);
  });
});

// Displaying the number of clients
wss.on("connection", (ws, request, client) => {
  console.log("Number of connected clients: ", wss.clients.size);

  // Handeling the data from the client
  ws.on("message", function message(data) {
    const obj = JSON.parse(data);
    console.log("recieved: %s", obj.type);
    switch (obj.type) {
      case "paint":
        {
          console.log("Broadcasting:", obj);
          wss.clients.forEach((client) => client.send(JSON.stringify(obj)));
        }
        break;
      default:
        console.log("Default");
    }
  });

  // close event
  ws.on("close", () => {
    console.log("Client disconnected");
    console.log("Number of remaining connected clients: ", wss.clients.size);
  });
});

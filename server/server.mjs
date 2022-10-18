import express from "express";
import { WebSocketServer } from "ws";
// import http from "http";


// creating websocket server
const wss = new WebSocketServer({noServer: true});
const app = express();
app.use(express.static("../client/whiteboard/build"));
const port = 8080;
const expressServer = app.listen(port, () => console.log(`Listening on port ${port}`));

expressServer.on("upgrade", (request, socket, head) => {
    console.log("Upgrading...");
    wss.handleUpgrade(request, socket, head, (websocket) => {
        console.log("handeling upgrade");
        wss.emit("connection", websocket, request)
    });
});


wss.on("connection", (ws, request, client) => {
    // console.log("New client connection from IP: %s", ws._socket.remoteAdress);
    console.log("Number of connected clients: ", wss.clients.size);

    
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
                    console.log("Default")
        }
        // ws.send("Thank you for your message!")
    });

    // close event
    ws.on("close", () => {
        console.log("Client disconnected");
        console.log(
            "Number of remaining connected clients: ",
            wss.clients.size
            );
    });
});

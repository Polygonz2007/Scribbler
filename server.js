
// Configurqation of the app
const config = {
    http_port: 80,
    https_port: 443
}

// Get secrets
import dotenv from "dotenv";
dotenv.config();

// Imports
import Board from "./src/board.js";

// Path
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.public_path = path.join(__dirname, "public");

// Express
import express from "express";
import session from "express-session"
const app = express();

const session_parser = session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // If using HTTPS, set to true
});

app.use(session_parser);
app.use(express.json());

// HTTP
import http, { Server } from "http";
const http_server = http.createServer(app);

// WebSockets
import WebSocket, { WebSocketServer } from 'ws';
import { readFileSync } from "fs";
global.wss = new WebSocketServer({ noServer: true });

http_server.on('upgrade', upgrade_websocket);
//https_server.on('upgrade', upgrade_websocket);

function upgrade_websocket(request, socket, head) {
    socket.on('error', console.error);

    session_parser(request, {}, () => {
        if (false) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
    
        socket.removeListener('error', console.error);
    
        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });
    });
}

let clients = {};
let client_id = 0;

wss.on('connection', (ws, req) => {

    client_id++;
    const id = client_id;
    clients[id] = ws;

    req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    ws.on('message', async (data, isBinary) => {
        const start_time = performance.now();

        // Translate
        data = isBinary ? data : data.toString();
        data = JSON.parse(data);

        // Get important stuff
        const client = req.session;
        const type = data.type;

        // Switch case
        let result;
        switch (type) {
            case 0: result = await wsi.next_buffer(client, data); break;

            case 1: result = await wsi.set_track(client, data); break;
            case 2: result = await wsi.set_format(client, data); break;

            case 4: result = await wsi.seek_to(client, data); break;
            case 8: result = await wsi.log_played(client, data); break;
        }

        const end_time = performance.now();
        //console.log(`${(end_time - start_time).toFixed(2)}ms => Req #${req_id} from ${req.session.ip} of type ${type}`);

        Stats.log("ws_req");
        ws.send(result);
    });

    ws.on('close', () => {
        // Handle connection close
        delete clients[id];
    });
});

function broadcast(data) {
    data = {
        type: 0,
        sx: Math.floor(Math.abs(Math.sin(performance.now() / 1000)) * 1280),
        sy: Math.floor(Math.random() * 720),
        ex: Math.floor(Math.abs(Math.sin(performance.now() / 1000)) * 1280),
        ey: Math.floor(Math.random() * 720),
        size: Math.floor(2 + Math.random() * 18),
        color: "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16)
    };
    data = JSON.stringify(data);
    for (let id in clients) {
        clients[id].send(data);
    }
    console.log("sent stuff to " + Object.keys(clients).length + " peoples")
}

setInterval(broadcast, 1);


// Allow clients to get Board class, so that what happens on server and on client is perfectly synced.
app.get("/board.js", (req, res) => {
    const file = readFileSync("./src/board.js");
    res.type("text/javascript");
    res.send(file);
});

// Start server
app.use(express.static(global.public_path));
http_server.listen(config.http_port, () => {
    console.log(`HTTP server running on ${config.http_port}.`);
});

// Close server
process.on('SIGTERM', shut_down);
process.on('SIGINT', shut_down);

function shut_down() {
    console.log("\nSaving and stopping server.");
    process.exit(0);
}
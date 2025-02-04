const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

let UsersSocketId = {};  // Store usernames and socket IDs

const authenthication_route = require("./routs/authentication.js");
const chat_message = require("./routs/app1.js");
const config = require("./config.js");

const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
    path: "/app1", 
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"] 
    }
});

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Register user and store their socket ID
    socket.on("register", (username) => {
        UsersSocketId[username] = socket.id;
        localStorage.setItem("username", username);
        console.log(`User ${username} registered with socket ID: ${socket.id}`);
    });

    // Handle public messages
    socket.on("message", (data) => {
        console.log("Received:", data);
        socket.broadcast.emit("message", `${data}`); // Send to all users except sender
    });

    // Handle private messages
    socket.on("private message", ({ sender,recipientUsername, message }) => {
        console.log(recipientUsername,message)
        const recipientId = UsersSocketId[recipientUsername];
        if (recipientId) {
            io.to(recipientId).emit("private message", {
                sender: sender,
                message,
            });
            console.log(`Private message sent to ${recipientUsername}: ${message}`);
        } else {
            io.to(UsersSocketId[sender]).emit("user offline", recipientUsername);
        }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        const username = localStorage.getItem("username");
        if (username) {
            delete UsersSocketId[username];
            console.log(`User ${username} disconnected.`);
        }
    });
});

// Set up Express
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use("/", authenthication_route);
app.use("/app1", chat_message);

// Render Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// Start the Server
server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
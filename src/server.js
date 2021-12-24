import express from "express";
import SocketIo from "socket.io";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"))
app.get("/woom", (_, res) => res.render("woom"))
app.get("/play", (_, res) => res.render("play"))
app.get("/tictactoe", (_, res) => res.render("tictactoe"))
app.get("/*", (_, res) => res.redirect("/"))

const handleListen = () => { console.log("Listening on http://localhost:3000")};

const httpServer = http.createServer(app);
const socketServer = SocketIo(httpServer);

socketServer.on("connection", (socket) => {
    socket.on("woom", (data, done) => {
        switch (data["eventName"]) {
            case "enter_room":
                if (socketServer.sockets.adapter.rooms.get(data["data"]["roomName"])?.size === 2) {
                    done();
                } else {
                    socket.join(data["data"]["roomName"]);
                    socket.to(data["data"]["roomName"]).emit("welcome");
                }
                break;
            case "offer":
                socket.to(data["data"]["roomName"]).emit("offer", data["data"]["offer"]);
                break;
            case "answer":
                socket.to(data["data"]["roomName"]).emit("answer", data["data"]["answer"]);
                break;
            case "ice":
                socket.to(data["data"]["roomName"]).emit("ice", data["data"]["ice"]);
                break;
            default:
                break;
        }
    });
    socket.on("tictactoe", (data, done) => {
        switch (data["eventName"]) {
            case "enter_room":
                if (socketServer.sockets.adapter.rooms.get(data["data"]["roomName"])?.size === 2) {
                    done();
                } else {
                    socket.join(data["data"]["roomName"]);
                    if (socketServer.sockets.adapter.rooms.get(data["data"]["roomName"])?.size === 2) {
                        socketServer.in(data["data"]["roomName"]).emit("start");
                        setTimeout(() => {
                            let team;
                            let otherTeam;
                            if (Math.floor( Math.random() * 2 ) === 0) {
                                team = "X";
                                otherTeam = "O";
                            } else {
                                team = "O";
                                otherTeam = "X";
                            }
                            socket.emit("team", team);
                            socket.to(data["data"]["roomName"]).emit("team", otherTeam);
                            setTimeout(() => {
                                if (Math.floor( Math.random() * 2 ) === 0) {
                                    socketServer.in(data["data"]["roomName"]).emit("turn", team);
                                } else {
                                    socketServer.in(data["data"]["roomName"]).emit("turn", otherTeam);
                                }
                            }, 3000);
                        }, 5000);
                    }
                }
                break;
            case "move":
                socket.to(data["data"]["roomName"]).emit("move", {
                    position: data["data"]["position"],
                    team: data["data"]["team"]
                });
                if (data["data"]["evaluate"] !== undefined) {
                    socket.to(data["data"]["roomName"]).emit("evaluate", data["data"]["evaluate"]);
                    setTimeout(() => {
                        if (data["data"]["team"] === "X") {
                            socketServer.in(data["data"]["roomName"]).emit("turn", "O");
                        } else {
                            socketServer.in(data["data"]["roomName"]).emit("turn", "X");
                        }
                    }, 3000);
                } else {
                    if (data["data"]["team"] === "X") {
                        socketServer.in(data["data"]["roomName"]).emit("turn", "O");
                    } else {
                        socketServer.in(data["data"]["roomName"]).emit("turn", "X");
                    }
                }
                break;
            default:
                break;
        }
    });
    // socket.on("gameStart", (roomName) => {
    //     setTimeout(() => {
    //         socketServer.sockets.to(roomName).emit("count");
    //         setTimeout(() => {
    //             socketServer.sockets.to(roomName).emit("count");
    //             setTimeout(() => {
    //                 socketServer.sockets.to(roomName).emit("count");
    //                 setTimeout(() => {
    //                     socketServer.sockets.to(roomName).emit("start");
    //                     socket.emit("setTeam", "O");
    //                     socket.to(roomName).emit("setTeam", "X");
    //                     socket.emit("O");
    //                 }, 1000);
    //             }, 1000);
    //         }, 1000);
    //     }, 1000);
    // });
    // socket.on("move", (roomName, team, move) => {
    //     socket.to(roomName).emit("move", move);
    //     if (team === "O") {
    //         socket.to(roomName).emit("X");
    //     } else {
    //         socket.to(roomName).emit("O");
    //     }
    // });
});

httpServer.listen(3000, handleListen);

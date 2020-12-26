"use strict";

//Declaration Statements
const PORT = (process.env.PORT || 4000);
const codeLength = 6;
const clockDeltaTime = 1000;
let rooms = new Map();
let clock = 0;
let gameState = "question";

//Initialize Event Emitter
const { EventEmitter } = require("events");
const eventEmitter = new EventEmitter();

//Initialize File Reader
const { readFile, readFileSync, writeFile, read } = require("fs");

//Initialize Express
const express = require("express");
const { response } = require("express");
const app = express();

app.use(express.static(__dirname + "/docs"));

//Create HTTP Server
const http = require("http");
const httpServer = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(httpServer);



//Functions

//List of Clients in a Room
const clientsInRoom = (code) => {
    /*NOTE: io.sockets.adapter.rooms is in the form of:
    Map {
        "roomId1" => Set {...clients}
        "roomId2" => Set {...clients}
    }
    */
    //Tests to see if a certain room is valid or not
    if (io.sockets.adapter.rooms.has(code)) {
        //If valid
        return [...io.sockets.adapter.rooms.get(code)];
    } else {
        //If invalid
        return [];
    }
};

//Get random question
const getRandomQuestion = () => questionsJson.questions[Math.floor(Math.random() * questionsJson.questions.length)];
const questionsJson = JSON.parse(readFileSync("data/questions.json", { encoding: "utf-8" }));

//Get random tracks
const getRandomIntermissionTrack = () => musicIntermissionJson.tracks[Math.floor(Math.random() * musicIntermissionJson.tracks.length)];
const musicIntermissionJson = JSON.parse(readFileSync("data/musicIntermission.json", { encoding: "utf-8" }));

const getRandomGameTrack = () => musicGameJson.tracks[Math.floor(Math.random() * musicGameJson.tracks.length)];
const musicGameJson = JSON.parse(readFileSync("data/musicGame.json", { encoding: "utf-8" }));

//Handle Clients
//Connect
io.on("connection", (socket) => {
    //Socket local variables
    let socketRoomCode = null;

    socket.username = `Player`;

    socket.emit("log", "Hello Mortals.");
    socket.broadcast.emit("log", `client ${socket.id} joined`);

    //Set Initial Username
    socket.on("setInitialUsername", (username) => {
        socket.username = username;
    });

    //Change Username
    socket.on("changeUsername", (newUsername) => {
        socket.emit("message", `You changed your username from ${socket.username} to ${newUsername}`);
        if (socketRoomCode) {
            socket.to(socketRoomCode).emit("message", `${socket.username} changed their username to ${newUsername}`);
        }
        socket.username = newUsername;
    });

    //Join Room
    socket.on("roomJoin", (roomCode) => {
        //If client hasn't already joined the room AND the room is not empty
        if ([...socket.rooms].length == 1 && clientsInRoom(roomCode).length > 0) {
            socket.join(roomCode);
            socketRoomCode = roomCode;
            console.log(`client ${socket.id} joined room ${roomCode} with ${clientsInRoom(roomCode).length} total players in that room.`);
            socket.emit("roomJoinSuccess", roomCode, rooms.get(roomCode));

            //Message client about the room join
            socket.emit("message", `You joined room ${roomCode} "${rooms.get(roomCode).name}"`);

            //Broadcast to the clients in the room that the client has joined
            socket.to(roomCode).emit("message", `${socket.username} has joined`);
        } else {
            socket.emit("error", "Invalid Room!");
        }
    });

    //Create Room
    socket.on("roomCreate", (roomName, roomIntermissionTime, roomQuestionTime) => {
        //Create a random id
        let newRoomId = "";
        do {
            newRoomId = [...new Array(codeLength)].map((item) => "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".charAt(Math.floor(Math.random() * 64))).reduce((acc, cur) => acc + cur);
        } while (clientsInRoom(newRoomId).length > 0)

        //Set initial room settings
        rooms.set(newRoomId, {
            name: roomName,
            music: getRandomIntermissionTrack(),
            currentQuestion: null,
            results: new Map(),
            clock: -1,
            timeLength: {
                intermission: roomIntermissionTime,
                question: roomQuestionTime,
                results: 5
            },
            gameState: "intermission"
        });

        console.log(`client ${socket.id} created new room: ${newRoomId} - ${rooms.get(newRoomId)}`);
        socket.join(newRoomId);
        socketRoomCode = newRoomId;
        socket.emit("roomJoinSuccess", newRoomId, rooms.get(newRoomId));

        //Message client about the room join
        socket.emit("message", `You joined room ${newRoomId} "${rooms.get(newRoomId).name}"`);
    });

    //Vote
    socket.on("vote", (choice) => {
        //Check if choice is in results
        if (rooms.get(socketRoomCode).results.has(choice)) {
            //Increment count
            rooms.get(socketRoomCode).results.set(choice, rooms.get(socketRoomCode).results.get(choice) + 1);
        } else {
            //Set count
            rooms.get(socketRoomCode).results.set(choice, 1);
        }
    });

    //Disconnect
    socket.on("disconnect", (reason) => {
        console.log("client disconnected");

        //Remove a room if there are no clients in it
        if (socketRoomCode) {
            if (clientsInRoom(socketRoomCode).length == 0) {
                //No clients left. Delete room
                rooms.delete(socketRoomCode);
                console.log(`Deleted room ${socketRoomCode}. !rooms.has(roomCode) - ${!rooms.has(socketRoomCode)}`);
            } else {
                //There are other clients left. Inform other clients about disconnection
                socket.to(socketRoomCode).emit("message", `${socket.username} has left`);
            }
        }
    });
});



//Listen to a certain port
httpServer.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})

/*===========
Main Game Loop
============*/

/*
GAME STATES: (clock)
0-120 => question
120-140 => results
140-160 => intermission
*/
setInterval(() => {
    rooms.forEach((roomInfo, roomCode) => {
        //Initialize
        roomInfo.clock++;
        //Update Status
        io.sockets.emit("updateTimer", roomInfo.timeLength[roomInfo.gameState] - roomInfo.clock);
        //console.log(roomInfo);
        switch (roomInfo.gameState) {
            case "intermission":
                {

                    //If intermission time is over
                    if (roomInfo.clock >= roomInfo.timeLength[roomInfo.gameState]) {
                        roomInfo.clock = -1;
                        roomInfo.gameState = "question";

                        //If question time has started
                        let musicInfo = getRandomGameTrack();
                        roomInfo.currentQuestion = getRandomQuestion();
                        roomInfo.music = musicInfo;
                        io.sockets.to(roomCode).emit("updateRoom", roomInfo);

                        //Change Music
                        io.sockets.to(roomCode).emit("changeMusic", musicInfo);
                    }
                }
                break;
            case "results":
                {

                    //If results time is over
                    if (roomInfo.clock >= roomInfo.timeLength[roomInfo.gameState]) {
                        roomInfo.clock = -1;
                        roomInfo.gameState = "intermission";

                        //Update text state
                        io.sockets.to(roomCode).emit("updateTextStatus", "Intermission");
                    }
                }
                break;
            case "question":
                {
                    //If everyone has voted
                    if(clientsInRoom(roomCode).length <= [...roomInfo.results.values()].reduce((acc, cur) => acc + cur, 0)){
                        roomInfo.clock = roomInfo.timeLength[roomInfo.gameState];
                    }
                    //If question time is over
                    if (roomInfo.clock >= roomInfo.timeLength[roomInfo.gameState]) {
                        roomInfo.clock = -1;
                        roomInfo.gameState = "results";

                        //Update text state
                        io.sockets.to(roomCode).emit("updateTextStatus", "Results on the Right");
                        //If results time has started
                        let musicInfo = getRandomIntermissionTrack();
                        roomInfo.currentQuestion = null;
                        roomInfo.music = musicInfo;
                        io.sockets.to(roomCode).emit("updateRoom", roomInfo);
                        //io.sockets.to(roomCode).emit("updateTextStatus", "Results on the Right");
                        io.sockets.to(roomCode).emit("results", Object.fromEntries(rooms.get(roomCode).results.entries()));
                        rooms.get(roomCode).results.clear();

                        //Change Music
                        io.sockets.to(roomCode).emit("changeMusic", musicInfo);
                    }
                }
                break;
        }

        
    });
}, clockDeltaTime);
/*setInterval(() => {
    switch (clock) {
        case 0:
            gameState = "question";
            rooms.forEach((roomInfo, roomCode) => {
                let musicInfo = getRandomGameTrack();
                roomInfo.currentQuestion = getRandomQuestion();
                roomInfo.music = musicInfo;
                io.sockets.to(roomCode).emit("updateRoom", roomInfo);

                //Change Music
                io.sockets.to(roomCode).emit("changeMusic", musicInfo);
            })
            break;
        case 60:
            gameState = "results";
            rooms.forEach((roomInfo, roomCode) => {
                let musicInfo = getRandomIntermissionTrack();
                roomInfo.currentQuestion = null;
                roomInfo.music = musicInfo;
                io.sockets.to(roomCode).emit("updateRoom", roomInfo);
                io.sockets.to(roomCode).emit("updateTextStatus", "Results on the Right");
                io.sockets.to(roomCode).emit("results", Object.fromEntries(rooms.get(roomCode).results.entries()));
                rooms.get(roomCode).results.clear();

                //Change Music
                io.sockets.to(roomCode).emit("changeMusic", musicInfo);
            })
            break;
        case 70:
            gameState = "intermission";
            rooms.forEach((roomInfo, roomCode) => {
                //roomInfo.currentQuestion = null;
                //io.sockets.to(roomCode).emit("updateRoom", roomInfo);
                io.sockets.to(roomCode).emit("updateTextStatus", "Intermission");
            })
            break;
    }

    io.sockets.emit("updateTimer", clock, gameState);
    //Increment Clock Time
    clock++;

    //Reset to Zero if clock exceeds time
    if (clock >= 100) {
        clock = 0;
    }
}, clockDeltaTime);*/

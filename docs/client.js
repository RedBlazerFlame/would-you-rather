//Client Initialization
const socket = io("/");

/*===============
Program Functions
===============*/

const id = (elementId) => { return document.getElementById(elementId) };
const cls = (elementClass, elementIndex = false) => { if (!elementIndex) { return document.getElementsByClassName(elementClass)[elementIndex] } else { return document.getElementsByClassName(elementClass) } };

/*====================
Declaration Statements
====================*/

const root = document.documentElement;
const mainWindow = document.getElementsByTagName("main")[0];
const [question, choices, mainHome, main] = [id("question"), id("choices"), id("mainHome"), id("main")];
const [roomCode, roomJoinButton, roomFormInfo, mainHomeTitle] = [id("roomCode"), id("roomCodeSubmit"), id("roomCodeFormInfo"), id("mainHomeTitle")];
const [roomInfoCode, roomInfoName] = [id("roomInfoCode"), id("roomInfoName")];
const usernameInput = id("usernameInput");
const leftSidebar = id("lsidebar");
const resultsElement = id("results");
const themeSelector = id("theme");
const [music, musicName, musicAuthor] = [id("music"), id("musicName"), id("musicAuthor")];
const roomId = null;
let baseQuestionText = "";

/*===============
Program Functions
===============*/

//Play Music
const play = (src) => {
    music.src = `music/${src}`;
    music.play();
}

//setTimeout(()=>{},1000);

/*==============
Other Statements
==============*/

//If not connected to a room
if (typeof roomId !== "string") {
    console.log("Not connected to room");
    main.classList.add("hidden");
    mainHome.classList.remove("hidden");
}

/*===========
Client Events
===========*/

//Log Message (for debugging)
socket.on("log", (message) => {
    console.log(message);
})

//Visible Message
socket.on("message", (message) => {
    //Create element
    let pText = document.createTextNode(message);
    let pElement = document.createElement("p");
    pElement.appendChild(pText);

    //Prepend Element
    if (leftSidebar.hasChildNodes) {
        leftSidebar.insertBefore(pElement, leftSidebar.firstChild);
    } else {
        leftSidebar.appendChild(pElement);
    }
})

//Error Message
socket.on("error", (reason) => {
    //Raise error in console
    console.error(reason);

    //Create element
    let pText = document.createTextNode(reason);
    let pElement = document.createElement("p");
    pElement.appendChild(pText);
    pElement.classList.add("secondaryColor");
    leftSidebar.appendChild(pElement);

    //Prepend Element
    if (leftSidebar.hasChildNodes) {
        leftSidebar.insertBefore(pElement, leftSidebar.firstChild);
    } else {
        leftSidebar.appendChild(pElement);
    }
})

//Client Change Theme
themeSelector.addEventListener("change", (ev) => {
    //Gets the values of the properties
    let themeValues = themes[themeSelector.value];
    Object.keys(themeValues).forEach((property) => {
        root.style.setProperty(`--${property}`, themeValues[property]);
    });
});

//Client Username Input Change
usernameInput.addEventListener("change", (ev) => {
    socket.emit("changeUsername", usernameInput.value);
})

//Client Room Form Change Input
roomCode.addEventListener("input", (ev) => {
    if (roomCode.value === "") {
        if (roomCode.placeholder == "Room Code") {
            roomJoinButton.innerText = "Create Room Instead";
        } else {
            roomJoinButton.innerText = "Join Room Instead";
        }
        roomJoinButton.style.backgroundColor = "var(--mainHome-join-background-color)";
        roomJoinButton.style.textColor = "var(--mainHome-join-text-color)";
    } else {
        if (roomCode.placeholder == "Room Code") {
            roomJoinButton.innerText = "Join Room";
        } else {
            roomJoinButton.innerText = "Create Room";
        }
        roomJoinButton.style.backgroundColor = "var(--mainHome-join-background-color2)";
        roomJoinButton.style.textColor = "var(--mainHome-join-text-color2)";
    }
})

//Client Join Room
roomJoinButton.addEventListener("click", (ev) => {

    /*TO-DO: Remove "showgamescreen". Emit an event
    to connect to a random room
    and once that request is accepted
    showGameScreen*/
    if (roomCode.placeholder == "Room Code") {
        if (roomCode.value === "") {
            /*The user intends to make a new room.
            Change the roomCode input to be a room name input*/
            mainHomeTitle.innerText = "Create Room";
            roomCode.placeholder = "Room Name";
            roomJoinButton.innerText = "Join Room Instead";
            roomFormInfo.innerHTML = "Enter the <span class='primaryColor'>Room</span> <span class='secondaryColor'>Name</span> of the room you are creating. Leave it blank if you want to join an existing room instead.";
        } else {
            // The user intends to join an existing room
            socket.emit("roomJoin", roomCode.value);
        }
    } else {
        if (roomCode.value === "") {
            /*The user intends to join an existing room.
            Change the roomName input to be a room code input*/
            mainHomeTitle.innerText = "Join Room";
            roomCode.placeholder = "Room Code";
            roomJoinButton.innerText = "Create Room Instead";
            roomFormInfo.innerHTML = "Leave the &OpenCurlyDoubleQuote;<span class='primaryColor'>Room Code</span>&CloseCurlyDoubleQuote; field <span class='secondaryColor'>blank</span> to create a random room and then invite people to that room using the 6-digit alphanumeric code.";
        } else {
            // The user intends to create a new room
            socket.emit("roomCreate", roomCode.value);
        }
    }
})

//Client Join Room Success
socket.on("roomJoinSuccess", (resRoomCode, resRoomInfo) => {
    //Change room code and room name information
    roomInfoCode.innerText = resRoomCode;
    roomInfoName.innerText = resRoomInfo.name;

    //Play Music
    play(resRoomInfo.music.fileName);
    musicName.innerText = resRoomInfo.music.name;
    musicAuthor.innerText = resRoomInfo.music.author;

    //Change question and choices content
    if (!resRoomInfo.currentQuestion) {
        //If there is no question yet (i.e. currentQuestion is null)
        baseQuestionText = "Intermission"
        question.innerText = baseQuestionText;
        choices.innerHTML = "";
    } else {
        //If there is a question
        baseQuestionText = (resRoomInfo.currentQuestion.question ? resRoomInfo.currentQuestion.question : "Would you Rather?");
        question.innerText = baseQuestionText;
        choices.innerHTML = "";

        //Keep track of the choice number
        let index = 0;
        resRoomInfo.currentQuestion.choices.sort((a, b) => Math.random() - 0.5).forEach((choice) => {
            //Create a div element containing the choice
            let divText = document.createTextNode(choice);
            let divElement = document.createElement("div");
            divElement.appendChild(divText);
            divElement.dataset.index = index;

            //Append div element
            choices.appendChild(divElement);

            index++;
        })
    }

    //Show the screen
    showGameScreen();
})

const showGameScreen = () => {
    //Hide the Main Home Screen
    roomCode.blur();
    roomJoinButton.blur();
    main.classList.remove("hidden");
    mainHome.classList.add("hidden");

    //Room Update
    socket.on("updateRoom", (roomInfo) => {
        console.log(roomInfo);
        //Change room code and room name information
        roomInfoName.innerText = roomInfo.name;

        //Change question and choices content
        if (!roomInfo.currentQuestion) {
            //If there is no question yet (i.e. currentQuestion is null)
            choices.innerHTML = "";
        } else {
            //If there is a question
            baseQuestionText = (roomInfo.currentQuestion.question ? roomInfo.currentQuestion.question : "Would you Rather?");
            question.innerText = baseQuestionText;
            choices.innerHTML = "";

            //Keep track of the choice number
            let index = 0;
            roomInfo.currentQuestion.choices.sort((a, b) => Math.random() - 0.5).forEach((choice) => {
                //Create a div element containing the choice
                let divText = document.createTextNode(choice);
                let divElement = document.createElement("div");
                divElement.appendChild(divText);
                divElement.dataset.index = index;

                //Append div element
                choices.appendChild(divElement);

                index++;
            })
        }
    })

    //Update Clock
    socket.on("updateTimer", (clockTime, gameState) => {
        switch (gameState) {
            case "question":
                question.innerText = `${baseQuestionText} (${60 - clockTime})`;
                break;
            case "results":
                question.innerText = `${baseQuestionText} (${70 - clockTime})`;
                break;
            case "intermission":
                question.innerText = `${baseQuestionText} (${100 - clockTime})`;
                break;
        }
    })

    //Update Text Status (Top Text)
    socket.on("updateTextStatus", (newText) => {
        baseQuestionText = newText;
    })

    //Client Vote
    choices.addEventListener("click", (ev) => {
        if (ev.target.tagName === "DIV") {
            choices.innerHTML = "";
            socket.emit("vote", ev.target.innerHTML);
            baseQuestionText = "Wow, you are fast! Please wait until the round finishes.";
        }
    });

    //Receive Vote
    socket.on("results", (results) => {
        //Clear previous results
        resultsElement.innerHTML = "";
        //Set choiceIndex to 0
        let choiceIndex = 0;
        //Sort Keys by Votes
        let choiceKeys = Object.keys(results).sort((a, b) => results[b] - results[a]);
        //For each choice
        choiceKeys.forEach((choice) => {
            //Increment choiceIndex
            choiceIndex++;
            //Create Paragraph Element
            let pText = document.createTextNode(`${choiceIndex}. ${choice} (${results[choice]} vote${(results[choice] == 1 ? "" : "s")})`);
            let pElement = document.createElement("p");
            pElement.appendChild(pText);
            resultsElement.appendChild(pElement);
        })
    })

    //Change Music
    socket.on("changeMusic", ({ name, author, fileName }) => {
        //console.log(`Playing ${name} by ${author}`);
        musicName.innerText = name;
        musicAuthor.innerText = author;
        play(fileName);
    })
};
const socket = io();

const welcome = document.getElementById("welcome");
const tictactoe3 = document.getElementById("tictactoe-3");
const tictactoe5 = document.getElementById("tictactoe-5");
const rulesSelect = document.getElementById("rules");
const message = document.getElementById("message");
const buttons3 = [document.getElementById("3-1"),
                 document.getElementById("3-2"),
                 document.getElementById("3-3"),
                 document.getElementById("3-4"),
                 document.getElementById("3-5"),
                 document.getElementById("3-6"),
                 document.getElementById("3-7"),
                 document.getElementById("3-8"),
                 document.getElementById("3-9")];
const buttons5 = [document.getElementById("5-1"),
                  document.getElementById("5-2"),
                  document.getElementById("5-3"),
                  document.getElementById("5-4"),
                  document.getElementById("5-5"),
                  document.getElementById("5-6"),
                  document.getElementById("5-7"),
                  document.getElementById("5-8"),
                  document.getElementById("5-9"),
                  document.getElementById("5-10"),
                  document.getElementById("5-11"),
                  document.getElementById("5-12"),
                  document.getElementById("5-13"),
                  document.getElementById("5-14"),
                  document.getElementById("5-15"),
                  document.getElementById("5-16"),
                  document.getElementById("5-17"),
                  document.getElementById("5-18"),
                  document.getElementById("5-19"),
                  document.getElementById("5-20"),
                  document.getElementById("5-21"),
                  document.getElementById("5-22"),
                  document.getElementById("5-23"),
                  document.getElementById("5-24"),
                  document.getElementById("5-25")];

const welcomeForm = welcome.querySelector("form");

let roomName;
let myTurn = false;
let myTeam;

tictactoe3.hidden = true;
tictactoe5.hidden = true;

function tttEmit(event, data, done) {
    socket.emit("tictactoe", {
        eventName: event,
        data: data
    }, done);
}

function setMsg(msg) {
    message.innerText = msg;
}

function startGame() {
    const rule = rulesSelect.value;
    if (rule === "3") {
        tictactoe3.hidden = false;
        tictactoe5.hidden = true;
    } else if (rule === "5") {
        tictactoe3.hidden = true;
        tictactoe5.hidden = false;
    }
    welcome.hidden = true;
    setMsg("Entered room.. Waiting for other player.");
}

function reset(evaluate, flip) {
    if (evaluate) {
        if (flip) {
            setMsg("You lose!");
        } else {
            setMsg("You win!");
        }
    } else if (evaluate === false) {
        if (!flip) {
            setMsg("You lose!");
        } else {
            setMsg("You win!");
        }
    } else {
        setMsg("Draw!");
    }
    setTimeout(() => {
        const rule = rulesSelect.value;
        if (rule === '3') {
            buttons3.forEach((button) => {
                button.innerText = 'ㅤ';
                button.disabled = false;
            });
        } else {
            buttons5.forEach((button) => {
                button.innerText = 'ㅤ';
                button.disabled = false;
            });
        }
    }, 2500);
}

// won => true
// lose => false
// progress => undefined
// draw = > null
function evaluateBoard() {
    const rule = rulesSelect.value;
    if (rule === "3") {
        const board = [buttons3[0].innerText,
                       buttons3[1].innerText,
                       buttons3[2].innerText,
                       buttons3[3].innerText,
                       buttons3[4].innerText,
                       buttons3[5].innerText,
                       buttons3[6].innerText,
                       buttons3[7].innerText,
                       buttons3[8].innerText];
        if (board[0] === board[1] && board[1] === board[2] && board[0] !== 'ㅤ') {
            return board[0] === myTeam;
        } else if (board[3] === board[4] && board[4] === board[5] && board[3] !== 'ㅤ') {
            return board[3] === myTeam;
        } else if (board[6] === board[7] && board[7] === board[8] && board[6] !== 'ㅤ') {
            return board[6] === myTeam;
        } else if (board[0] === board[3] && board[3] === board[6] && board[0] !== 'ㅤ') {
            return board[0] === myTeam;
        } else if (board[1] === board[4] && board[4] === board[7] && board[1] !== 'ㅤ') {
            return board[1] === myTeam;
        } else if (board[2] === board[5] && board[5] === board[8] && board[2] !== 'ㅤ') {
            return board[2] === myTeam;
        } else if (board[0] === board[4] && board[4] === board[8] && board[0] !== 'ㅤ') {
            return board[0] === myTeam;
        } else if (board[2] === board[4] && board[4] === board[6] && board[2] !== 'ㅤ') {
            return board[2] === myTeam;
        } else if (board.includes('ㅤ')) {
            return undefined;
        } else {
            return null;
        }
    } else if (rule === "5") {
        const board = [buttons5[0].innerText,
                       buttons5[1].innerText,
                       buttons5[2].innerText,
                       buttons5[3].innerText,
                       buttons5[4].innerText,
                       buttons5[5].innerText,
                       buttons5[6].innerText,
                       buttons5[7].innerText,
                       buttons5[8].innerText,
                       buttons5[9].innerText,
                       buttons5[10].innerText,
                       buttons5[11].innerText,
                       buttons5[12].innerText,
                       buttons5[13].innerText,
                       buttons5[14].innerText,
                       buttons5[15].innerText,
                       buttons5[16].innerText,
                       buttons5[17].innerText,
                       buttons5[18].innerText,
                       buttons5[19].innerText,
                       buttons5[20].innerText,
                       buttons5[21].innerText,
                       buttons5[22].innerText,
                       buttons5[23].innerText,
                       buttons5[24].innerText,];
        if (board[0] === board[1] && board[1] === board[2] && board[2] === board[3] && board[3] === board[4] && board[0] !== 'ㅤ') {
            return board[0] === myTeam;
        } else if (board[5] === board[6] && board[6] === board[7] && board[7] === board[8] && board[8] === board[9] && board[5] !== 'ㅤ') {
            return board[5] === myTeam;
        } else if (board[10] === board[11] && board[11] === board[12] && board[12] === board[13] && board[13] === board[14] && board[10] !== 'ㅤ') {
            return board[10] === myTeam;
        } else if (board[15] === board[16] && board[16] === board[17] && board[17] === board[18] && board[18] === board[19] && board[15] !== 'ㅤ') {
            return board[15] === myTeam;
        } else if (board[20] === board[21] && board[21] === board[22] && board[22] === board[23] && board[23] === board[24] && board[20] !== 'ㅤ') {
            return board[20] === myTeam;
        } else if (board[0] === board[5] && board[5] === board[10] && board[10] === board[15] && board[15] === board[20] && board[0] !== 'ㅤ') {
            return board[0] === myTeam;
        } else if (board[1] === board[6] && board[6] === board[11] && board[11] === board[16] && board[16] === board[21] && board[1] !== 'ㅤ') {
            return board[1] === myTeam;
        } else if (board[2] === board[7] && board[7] === board[12] && board[12] === board[17] && board[17] === board[22] && board[2] !== 'ㅤ') {
            return board[2] === myTeam;
        } else if (board[3] === board[8] && board[8] === board[13] && board[13] === board[18] && board[18] === board[23] && board[3] !== 'ㅤ') {
            return board[3] === myTeam;
        } else if (board[4] === board[9] && board[9] === board[14] && board[14] === board[19] && board[19] === board[24] && board[4] !== 'ㅤ') {
            return board[4] === myTeam;
        } else if (board[0] === board[6] && board[6] === board[12] && board[12] === board[18] && board[18] === board[24] && board[0] !== 'ㅤ') {
            return board[0] === myTeam;
        } else if (board[4] === board[8] && board[8] === board[12] && board[12] === board[16] && board[16] === board[20] && board[4] !== 'ㅤ') {
            return board[4] === myTeam;
        } else if (board.includes('ㅤ')) {
            return undefined;
        } else {
            return null;
        }
    }
}

function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    startGame();
    tttEmit("enter_room", {
        roomName: input.value + "#tictactoe"
    }, () => {
        roomName = undefined;
        welcome.hidden = false;
        tictactoe3.hidden = true;
        tictactoe5.hidden = true;
        alert("Sorry, The room is full.");
        setMsg("");
        location.reload();
    });
    roomName = input.value + "#tictactoe";
    input.value = "";
}

function handleButtonClick(event) {
    if (myTurn) {
        event.target.disabled = true;
        event.target.innerText = myTeam;
        myTurn = !myTurn;
        const evaluate = evaluateBoard();
        tttEmit("move", {
            roomName: roomName,
            team: myTeam,
            position: event.target.id,
            evaluate: evaluate,
        });
        if (evaluate !== undefined) {
            reset(evaluate);
        }
    }
}

welcome.addEventListener("submit", handleWelcomeSubmit);
buttons3.forEach((button) => {
    button.addEventListener("click", handleButtonClick);
});
buttons5.forEach((button) => {
    button.addEventListener("click", handleButtonClick);
});

socket.on("start", () => {
    setMsg("Start!");
    setTimeout(() => {
        setMsg("Start! 3");
        setTimeout(() => {
            setMsg("Start! 2");
            setTimeout(() => {
                setMsg("Start! 1");
                setTimeout(() => {
                    setMsg("Go!");
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
});

socket.on("team", (team) => {
    myTeam = team;
    setMsg(`Your team is ${myTeam}!`);
});

socket.on("turn", (turn) => {
    setMsg(`${turn}'s Turn,`);
    myTurn = turn === myTeam;
    if (myTurn) {
        setMsg(message.innerText + " Your Turn.");
    } else {
        setMsg(message.innerText + " Opponent's Turn.");
    }
});

socket.on("move", (data) => {
    const target = document.getElementById(data["position"]);
    target.innerText = data["team"];
    target.disabled = true;
});

socket.on("evaluate", (evaluate) => {
    reset(evaluate, true);
});

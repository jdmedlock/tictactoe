//
// File Name: tictactoe.js
// Date: 11/29/2016
// Programmer: Jim Medlock
//
// Attributions:
// - Game engine based on information found at https://goo.gl/hTVMyG
/* @flow */

"use strict";
// -------------------------------------------------------------
// Global variables & constants
// -------------------------------------------------------------

const computerColor = "#FF00FF";
const playerColor = "#E4FF00";

const gameInprogress = null;
const gameTied = -1;
const gameWonComputer = 1;
const gameWonPlayer = 0;

const cellMap = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2]
];

let animationRequests = [];
let computerGamePiece = "";
let numNodes = 0;
let playerGamePiece = "";

// Game engine game board
let geBoard = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
];

// Cells that have been occupied
let occupiedCells = [];

// Game history is an array of history elements depicting the
// ending result of every game. This is displayed in the modal
// game results dialog when requested by the user.
let gameHistory = [];
let historyElement = {
    winner: null, // Winner of the game - gameTied|gameWonPlayer|gameWonComputer
    board: [] // Ending game engine board
};

// -------------------------------------------------------------
// Initialization function(s)
// -------------------------------------------------------------

// Initialization Logic invoked when the DOM is ready for execution
//
// Returns: N/a
$(document).ready(function() {
    console.clear();

    // Create a button handler for the help dialog
    $(".t3-btn-help").click(function(event) {
        $("#t3-help-dialog").css("display", "block");
    });

    // Create a button handler to close the help dialog
    $(".t3-dialog-close").click(function(event) {
        $("#t3-help-dialog").css("display", "none");
    });

    // Create a button handler for the game results dialog
    // TODO: use JQuery off and on to disable/reenable handler
    $(".t3-btn-results").click(function(event) {
        displayScores();
    });

    // Create a button handler for the new game request
    $(".t3-btn-newgame").click(function(event) {
        if (getWinner(geBoard) !== gameInprogress) {
            clearGameBoard();
        }
    });

    // Create a button handler to close the game results dialog
    $(".t3-dialog-close").click(function(event) {
        $(".t3-game-detail tr").empty();
        $("#t3-results-dialog").css("display", "none");
    });

    // Create a click handler for the cells of the game board
    $(".t3-board-cell").click(function(event) {
        makePlayerMove(this).then();
    });

    // Create a change handler for the game piece radio button
    $('#t3-gamepiece-form input').on('change', function() {
        playerGamePiece = $(
            'input[name="t3-radio-gamepiece"]:checked',
            '#t3-gamepiece-form').val();
        computerGamePiece = (playerGamePiece === "X") ? "O" : "X";
        $("#t3-greeting-dialog").css("display", "none");
    });

    // Prompt the user to choose a game piece
    $("#t3-greeting-dialog").css("display", "block");
});

// -------------------------------------------------------------
// User Interface functions
// -------------------------------------------------------------

// Clear all game pieces from both the internal game board as
// well as the UI game board
//
// Returns: N/a
function clearGameBoard() {
    animationRequests.forEach((currentValue, index, array) => cancelAnimationFrame(currentValue));
    for (let i = 0; i < 9; i++) {
        let ctx = document.querySelector("#t3-canvas-" + i).getContext("2d");
        ctx.clearRect(0, 0, 88, 88);
    };
    geBoard = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    occupiedCells = [];
    updateMove();
}

// Clear all game pieces from both the internal game board as
// well as the UI game board
//
// Returns: N/a
function displayScores() {
    $("#t3-results-dialog").css("display", "block");
    $(".t3-game-detail tr").empty();
    for (let rowNo = 0; rowNo < gameHistory.length; ++rowNo) {
        let newRow = "<tr>";
        newRow += "<td>" + (rowNo + 1) + "</td>";
        historyElement = gameHistory[rowNo];
        let outcomeForComputer = (historyElement.winner ===
            gameWonComputer) ? "W" : "-";
        newRow += "<td>" + outcomeForComputer + "</td>";
        let outcomeForPlayer = (historyElement.winner ===
            gameWonPlayer) ? "W" : "-";
        newRow += "<td>" + outcomeForPlayer + "</td>";
        var endingBoard = "<td>";
        endingBoard = historyElement.board.reduce(function(endingBoard, currentValue) {
            return endingBoard + currentValue + "<br/>";
        }, endingBoard);
        newRow += endingBoard + "</td>";
        newRow += "</tr>";
        $(".t3-game-detail").append(newRow);
    }
}

// Evaluate and respond to a player move
//
// Returns: N/a
function makePlayerMove(buttonThis) {
  return new Promise(function(resolve, reject) {
    $("#t3-status-msg").text("");
    let winner = getWinner(geBoard);
    if (winner === gameInprogress) {
        let cellId = $(buttonThis).attr("id");
        let cellNo = (cellId.startsWith("t3-cell-")) ? cellId.slice(-
            1) : 0;
        let rowNo = cellToRowCol(cellNo)[0];
        let colNo = cellToRowCol(cellNo)[1];
        if (occupiedCells.includes(cellNo) === false) {
            geBoard[rowNo][colNo] = false;
            updateMove();
            pause(.5).then(() => makeComputerMove());
        } else {
            $("#t3-status-msg").text("That position is occupied. Choose another");
        }
    }

    winner = (winner === gameInprogress) ? getWinner(geBoard) : winner;
    switch (winner) {
        case gameInprogress:
            break;
        default:
            $("#t3-status-msg").text(winner === gameWonComputer ? "Computer Won!" :
                winner == gameWonPlayer ? "Player Won!" :
                winner == gameTied ? "Tie Game!" : "");
            updateGameHistory(winner);
    }
  });
}

// Pause execution for n seconds
//
// Returns: Promise when the timeout has expired
function pause(waitSeconds) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            resolve("Pause of " + waitSeconds + " completed.");
        }, waitSeconds * 1000);
    });
}

// Place a players piece on the UI game board
// From a blog post at https://goo.gl/jD367a
//
// Returns: An animation request ID
function placeGamePiece(gamePiece, gamePieceColor, canvasName) {
    var ctx = document.querySelector(canvasName).getContext("2d");

    //var dashLen = 220;
    let dashLen = 10;
    let dashOffset = dashLen;
    let speed = 1;
    let txt = gamePiece;
    let x = 5;
    let i = 0;
    let animationRequestID = 0;

    //ctx.font = "50px Comic Sans MS, cursive, TSCu_Comic, sans-serif";
    ctx.font = "84px arial, sans-serif";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.globalAlpha = 2 / 3;
    ctx.strokeStyle = ctx.fillStyle = gamePieceColor;

    (function loop() {
        ctx.clearRect(x, 0, 0, 150);
        ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]); // create a long dash mask
        dashOffset -= speed; // reduce dash length
        ctx.strokeText(txt[i], x, 84); // stroke letter

        if (dashOffset > 0) {
            animationRequestID = requestAnimationFrame(loop); // animate
        } else {
            ctx.fillText(txt[i], x, 84); // fill final letter
            dashOffset = dashLen; // prep next char
            x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();
            ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random()); // random y-delta
            ctx.rotate(Math.random() * 0.005); // random rotation
            if (i < txt.length) {
                animationRequestID = requestAnimationFrame(loop);
            }
        }
    })();
    return animationRequestID;
}

// Given a cell number from the game board in the UI, return the
// equivalent row and column number in the internal game board
// manipulated by the game engine.
//
// Returns: An array of two cells
//    - cellToRowCol(cellNo)[0] = row number
//    - cellToRowCol(cellNo)[1] = cell number
function cellToRowCol(cellNo) {
    return cellMap[cellNo];
}

// Given a row and column number in the internal game board, return
// the equivalent cell number in the UI game board.
//
// Returns: A cell number in the UI game board
function rowColToCell(rowNo, colNo) {
    const notFound = -1;
    return cellMap.reduce((matchingIndex, currentValue, currentIndex, array) => {
        if (matchingIndex === notFound) {
            return (currentValue[0] == rowNo && currentValue[1] == colNo) ?
                currentIndex : notFound;
        } else {
            return matchingIndex;
        }
    }, notFound);
}

// Check the internal game board for a winner
//
// Returns: N/a
function updateMove() {
    updateButtons();
}

// Update the positions on the UI game board from the internal game board
//
// Returns: N/a
function updateButtons() {
    for (let rowNo = 0; rowNo < 3; rowNo++) {
        for (let colNo = 0; colNo < 3; colNo++) {
            if (geBoard[rowNo][colNo] !== null) {
                let gamePiece = (geBoard[rowNo][colNo] === false) ?
                    playerGamePiece : (geBoard[rowNo][colNo] ===
                        true) ? computerGamePiece : "";
                let gamePieceColor = (geBoard[rowNo][colNo] === false) ?
                    playerColor : (geBoard[rowNo][colNo] ===
                        true) ? computerColor : "#000";
                let cellNo = rowColToCell(rowNo, colNo);
                occupiedCells.push(cellNo.toString());
                animationRequests[cellNo] = placeGamePiece(gamePiece, gamePieceColor,
                    "#t3-canvas-" + cellNo);
            }
        }
    }
}

// Update the Game History array with the results of this game
//
// Returns: N/a
function updateGameHistory(winner) {
    if (winner === gameInprogress) {
        throw new Error("Error: updateGameHistory called while gameInprogress");
    }
    let endingBoard = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    for (let rowNo = 0; rowNo < 3; rowNo++) {
        for (let colNo = 0; colNo < 3; colNo++) {
            endingBoard[rowNo][colNo] = (geBoard[rowNo][colNo] === false) ?
                playerGamePiece : (geBoard[rowNo][colNo] ===
                    true) ? computerGamePiece : " ";
        }
    }

    gameHistory.push({
        winner: winner,
        board: endingBoard
    });
}

// -------------------------------------------------------------
// Game Logic functions
// -------------------------------------------------------------

// Check the internal game board for a winner
//
// Returns:
//    gameInprogress (null):  Game still in progress
//    gameTied (-1):          Game was a draw
//    gameWonPlayer (0):      Game won by player
//    gameWonComputer (1):    Game won by computer
function getWinner(board) {

    // Check if someone won
    const vals = [true, false];
    let allNotNull = true;
    for (let k = 0; k < vals.length; k++) {
        let value = vals[k];

        // Check rows, columns, and diagonals
        let diagonalComplete1 = true;
        let diagonalComplete2 = true;
        for (let i = 0; i < 3; i++) {
            if (board[i][i] != value) {
                diagonalComplete1 = false;
            }
            if (board[2 - i][i] != value) {
                diagonalComplete2 = false;
            }
            let rowComplete = true;
            let colComplete = true;
            for (var j = 0; j < 3; j++) {
                if (board[i][j] != value) {
                    rowComplete = false;
                }
                if (board[j][i] != value) {
                    colComplete = false;
                }
                if (board[i][j] == null) {
                    allNotNull = false;
                }
            }
            if (rowComplete || colComplete) {
                return value ? gameWonComputer : gameWonPlayer;
            }
        }
        if (diagonalComplete1 || diagonalComplete2) {
            return value ? gameWonComputer : gameWonPlayer;
        }
    }
    if (allNotNull) {
        return gameTied;
    }
    return gameInprogress;
}

// Make a computer move
//
// Returns: N/a
function makeComputerMove() {
    geBoard = minmaxMove(geBoard);
    console.log(numNodes);
    updateMove();
}

// Invoke the minmax algorithm to determine the next best move
// based on the current state of the game board and the players
// last move.
//
// Returns:
//   board for the outcome indicated by result
function minmaxMove(board) {
    numNodes = 0;
    return recurseMinmax(board, true)[1];
}

// Minmax algorithm
//
// Returns:
//   Resulting benefit of this iteration
//        0: Game was a draw
//       -1: Game won by player
//       +1: Game won by computer
//   board for the outcome indicated by result
function recurseMinmax(board, player) {
    numNodes++;
    let winner = getWinner(board);
    if (winner != null) {
        switch (winner) {
            case 1:
                return [1, board]; // Winner is the computer
            case 0:
                return [-1, board]; // Winner is the player
            case -1:
                return [0, board]; // Game was a tie
        }
    } else {
        // Next states
        let nextVal = null;
        let nextBoard = null;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] == null) {
                    board[i][j] = player;
                    let value = recurseMinmax(board, !player)[0];
                    if ((player && (nextVal == null || value > nextVal)) || (!player &&
                            (nextVal == null || value < nextVal))) {
                        nextBoard = board.map(function(arr) {
                            return arr.slice();
                        });
                        nextVal = value;
                    }
                    board[i][j] = null;
                }
            }
        }
        return [nextVal, nextBoard];
    }
}

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
let myMove = false;
let numNodes = 0;
let playerGamePiece = "";

// Game engine game board
let geBoard = [
   [null, null, null],
   [null, null, null],
   [null, null, null]
];

// Game history is an array of history elements depicting the
// ending result of every game. This is displayed in the modal
// game results dialog when requested by the user.
let gameHistory = [{}];
let historyElement = {
   gameNo: 0, // Ascending game number in the current session
   winner: null, // Winner of the game - "Computer", "Player", or "Tie"
   endingBoard: [
         []
      ] // Ending game engine board
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
   $(".t3-btn-results").click(function(event) {
      $("#t3-results-dialog").css("display", "block");
   });

   // Create a button handler for the new game request
   $(".t3-btn-newgame").click(function(event) {
      clearGameBoard();
   });

   // Create a button handler to close the game results dialog
   $(".t3-dialog-close").click(function(event) {
      $("#t3-results-dialog").css("display", "none");
   });

   // Create a click handler for the cells of the game board
   $(".t3-board-cell").click(function(event) {
      let cellId = $(this).attr("id");
      let cellNo = (cellId.startsWith("t3-cell-")) ? cellId.slice(-
         1) : 0;

      if (!myMove) {
         geBoard[cellToRowCol(cellNo)[0]][cellToRowCol(cellNo)[1]] =
            false;
         myMove = true;
         updateMove();
         pause(1).then(() => makeMove());
      }
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
   for (let i = 0; i < 9; i++) {
      geBoard[i] = [null, null, null];
      //cancelAnimationFrame(currentValue)
      let ctx = document.querySelector("#t3-canvas-" + i).getContext("2d");
      ctx.clearRect(0, 0, 88, 88);
   };

   myMove = false;
   updateMove();
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
   let winner = getWinner(geBoard);
   switch (winner) {
      case gameInprogress:
         $("#t3-status-msg").text(myMove ? "Computer's Move" : "Your move");
         break;
      default:
         $("#t3-status-msg").text(winner == gameWonComputer ? "Computer Won!" :
            winner == gameWonPlayer ? "Player Won!" :
            winner == gameTied ? "Tie Game!" : "");
   }
}

// Update the positions on the UI game board from the internal game board
//
// Returns: N/a
function updateButtons() {
   for (let rowNo = 0; rowNo < 3; rowNo++) {
      for (let colNo = 0; colNo < 3; colNo++) {
         if (geBoard[rowNo][colNo] !== null) {
            let gamePiece = (geBoard[rowNo][colNo] == false) ?
               playerGamePiece : (geBoard[rowNo][colNo] ==
                  true) ? computerGamePiece : "";
            let cellNo = rowColToCell(rowNo, colNo);
            animationRequests[0] = placeGamePiece(gamePiece, computerColor,
               "#t3-canvas-" + cellNo);
         }
      }
   }
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

// Make a move
//
// Returns:
//   -1: Game was a draw
//    0: Game won by player
//   +1: Game won by computer
function makeMove() {
   geBoard = minmaxMove(geBoard);
   console.log(numNodes);
   myMove = false;
   updateMove();
}

// Invoke the minmax algorithm to determine the next best move
// based on the current state of the game board and the players
// last move.
//
// Returns:
//   result of this iteration
//      -1: Game was a draw
//       0: Game won by player
//      +1: Game won by computer
//   board for the outcome indicated by result
function minmaxMove(board) {
   numNodes = 0;
   return recurseMinmax(board, true)[1];
}

// Minmax algorithm
//
// Returns:
//   result of this iteration
//      -1: Game was a draw
//       0: Game won by player
//      +1: Game won by computer
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

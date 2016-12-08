//
// File Name: tictactoe.js
// Date: 11/29/2016
// Programmer: Jim Medlock
// @flow

// Tic-Tac-Toe Strategy from https://en.wikipedia.org/wiki/Tic-tac-toe#Strategy
// --------------------
// 1. Turns: Players alternate going first from game-to-game.
// 2. Win: If the player has two in a row, they can place a third to get three in a row.
// 3. Block: If the opponent has two in a row, the player must play the third
//    themselves to block the opponent.
// 4. Fork: Create an opportunity where the player has two threats to win (two
//    non-blocked lines of 2).
// 5. Blocking an opponent's fork:
//      - Option 1: The player should create two in a row to force the opponent
//        into defending, as long as it doesn't result in them creating a fork.
//        For example, if "X" has a corner, "O" has the center, and "X" has the
//        opposite corner as well, "O" must not play a corner in order to win.
//        (Playing a corner in this scenario creates a fork for "X" to win.)
//      - Option 2: If there is a configuration where the opponent can fork,
//        the player should block that fork.
// 6. Center: A player marks the center. (If it is the first move of the game,
//    playing on a corner gives "O" more opportunities to make a mistake and
//    may therefore be the better choice; however, it makes no difference
//    between perfect players.)
// 7. Opposite corner: If the opponent is in the corner, the player plays the
//    opposite corner.
// 8. Empty corner: The player plays in a corner square.
// 9. Empty side: The player plays in a middle square on any of the 4 sides.
//

use 'strict';
// -------------------------------------------------------------
// Global variables & constants
// -------------------------------------------------------------

const computerColor = "#FF00FF";
const playerColor = "#E4FF00";

let animationRequests = [];
let playerGamePiece = "";
let computerGamePiece = "";

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

   // Create a button handler to close the game results dialog
   $(".t3-dialog-close").click(function(event) {
      $("#t3-results-dialog").css("display", "none");
   });

   // Create a click handler for the cells of the game board
   $(".t3-board-cell").click(function(event) {
     let cellId = $(this).attr("id");
     let cellNo = (cellId.startsWith("t3-cell-")) ? cellId.slice(-1) : 0;
     animationRequests[0] = placeGamePiece(computerGamePiece, computerColor,
         "#t3-canvas-"+cellNo);
   });

   // Create a change handler for the game piece radio button
   $('#t3-gamepiece-form input').on('change', function() {
      playerGamePiece = $('input[name="t3-radio-gamepiece"]:checked', '#t3-gamepiece-form').val();
      computerGamePiece = (playerGamePiece === "X") ? "O" : "X";
      $("#t3-greeting-dialog").css("display", "none");
   });

   // Prompt the user to choose a game piece
   $("#t3-greeting-dialog").css("display", "block");

});

// -------------------------------------------------------------
// User Interface functions
// -------------------------------------------------------------

// Clear all game pieces from the game board
//
// Returns: N/a
function clearGameBoard() {
   cancelAnimationFrame(animationRequests[8]);
   let ctx = document.querySelector("#t3-canvas-9").getContext("2d");
   ctx.clearRect(0, 0, 88, 88);
}

// Place a players piece on the game board
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

// -------------------------------------------------------------
// Game Logic functions
// -------------------------------------------------------------

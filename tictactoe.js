//
// File Name: tictactoe.js
// Date: 11/29/2016
// Programmer: Jim Medlock
// @flow

// -------------------------------------------------------------
// Global variables & constants
// -------------------------------------------------------------

var computerColor = "#FF00FF";
var playerColor = "#E4FF00";

var animationRequests = [];
var playerGamePiece = "X";
var computerGamePiece = "O";

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

   // Create click handlers for each cell in the game board

   $("#t3-canvas-1").click(function(event) {
      animationRequests[0] = placeGamePiece("O", computerColor,
         "#t3-canvas-1");
   });

   $("#t3-canvas-2").click(function(event) {
      animationRequests[1] = placeGamePiece("X", playerColor,
         "#t3-canvas-2");
   });

   $("#t3-canvas-3").click(function(event) {
      animationRequests[2] = placeGamePiece("O", computerColor,
         "#t3-canvas-3");
   });

   $("#t3-canvas-4").click(function(event) {
      animationRequests[3] = placeGamePiece("X", playerColor,
         "#t3-canvas-4");
   });

   $("#t3-canvas-5").click(function(event) {
      animationRequests[4] = placeGamePiece("O", computerColor,
         "#t3-canvas-5");
   });

   $("#t3-canvas-6").click(function(event) {
      animationRequests[5] = placeGamePiece("X", playerColor,
         "#t3-canvas-6");
   });

   $("#t3-canvas-7").click(function(event) {
      animationRequests[6] = placeGamePiece("O", computerColor,
         "#t3-canvas-7");
   });

   $("#t3-canvas-8").click(function(event) {
      animationRequests[7] = placeGamePiece("X", playerColor,
         "#t3-canvas-8");
   });

   $("#t3-canvas-9").click(function(event) {
      animationRequests[8] = placeGamePiece("O", computerColor,
         "#t3-canvas-9");
   });

   // Create a change handler for the game piece radio button
   $('#gamepieceForm input').on('change', function() {
      playerGamePiece = $('input[name="gamepiece"]:checked', '#gamepieceForm').val());
      computerGamePiece = (playerGamePiece === "X") ? "O" : "X";
      $("#t3-greeting-dialog-dialog").css("display", "none");
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
   var ctx = document.querySelector("#t3-canvas-9").getContext("2d");
   ctx.clearRect(0, 0, 88, 88);
}

// Place a players piece on the game board
// From a blog post at https://goo.gl/jD367a
//
// Returns: An animation request ID
function placeGamePiece(gamePiece, gamePieceColor, canvasName) {
   var ctx = document.querySelector(canvasName).getContext("2d");

   //var dashLen = 220;
   var dashLen = 10;
   var dashOffset = dashLen;
   var speed = 1;
   var txt = gamePiece;
   var x = 5;
   var i = 0;
   var animationRequestID = 0;

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

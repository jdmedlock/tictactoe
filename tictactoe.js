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
var playerGamePiece = "";
var computerGamePiece = "";

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
     var cellId = $(this).attr("id");
     var cellNo = (cellId.startsWith("t3-cell-")) ? cellId.slice(-1) : 0;
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

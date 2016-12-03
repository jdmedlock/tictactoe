//
// File Name: tictactoe.js
// Date: 11/29/2016
// Programmer: Jim Medlock
// @flow

// -------------------------------------------------------------
// Initialization function(s)
// -------------------------------------------------------------

// Initialization Logic invoked when the DOM is ready for execution
//
// Returns: N/a
$(document).ready(function() {
   console.clear();

   // Create a button handler to decrement the break interval length
   $(".pt-btn-break-minus").click(function(event) {});

   claimCell("X", "#t3-canvas-1");
});

// -------------------------------------------------------------
// User Interface functions
// -------------------------------------------------------------


// -------------------------------------------------------------
// Game Logic functions
// -------------------------------------------------------------

// Initialization Logic invoked when the DOM is ready for execution
// From a blog post at https://goo.gl/jD367a
//
// Returns: N/a
function claimCell(charToPlace, canvasName) {
   console.log("Entered claimCell");
   var ctx = document.querySelector(canvasName).getContext("2d");

   //var dashLen = 220;
   var dashLen = 60
   var dashOffset = dashLen;
   var speed = 5;
   var txt = charToPlace;
   //   var x = 30;
   var x = 10;
   var i = 0;

   //ctx.font = "50px Comic Sans MS, cursive, TSCu_Comic, sans-serif";
   ctx.font = "16px arial, sans-serif";
   ctx.lineWidth = 5;
   ctx.lineJoin = "round";
   ctx.globalAlpha = 2 / 3;
   ctx.strokeStyle = ctx.fillStyle = "#FFFFFF";
   //ctx.fillText(charToPlace, 10, 20); // fill final letter

   (function loop() {
      ctx.clearRect(x, 0, 60, 150);
      ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]); // create a long dash mask
      dashOffset -= speed; // reduce dash length
      ctx.strokeText(txt[i], x, 20); // stroke letter

      if (dashOffset > 0) requestAnimationFrame(loop); // animate
      else {
         ctx.fillText(txt[i], x, 20); // fill final letter
         dashOffset = dashLen; // prep next char
         x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();
         ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random()); // random y-delta
         ctx.rotate(Math.random() * 0.005); // random rotation
         if (i < txt.length) requestAnimationFrame(loop);
      }
   })(); * /
}

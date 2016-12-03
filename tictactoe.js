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
//
// Returns: N/a
function claimCell(charToPlace, canvasName) {
   console.log("Entered claimCell");
   var ctx = $(canvasName).get(0).getContext("2d"),
      dashLen = 220,
      dashOffset = dashLen,
      speed = 5,
      txt = charToPlace,
      x = 30,
      i = 0;

   //ctx.font = "50px Comic Sans MS, cursive, TSCu_Comic, sans-serif";
   ctx.font = "50px Comic Sans MS, cursive, TSCu_Comic, sans-serif";
   ctx.lineWidth = 5;
   ctx.lineJoin = "round";
   ctx.globalAlpha = 2 / 3;
   //ctx.strokeStyle = ctx.fillStyle = "#1f2f90";
   ctx.strokeStyle = ctx.fillStyle = "white";

   (function loop() {
      ctx.clearRect(x, 0, 60, 150);
      ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]); // create a long dash mask
      dashOffset -= speed; // reduce dash length
      ctx.strokeText(txt[i], x, 90); // stroke letter

      if (dashOffset > 0) requestAnimationFrame(loop); // animate
      else {
         ctx.fillText(txt[i], x, 90); // fill final letter
         dashOffset = dashLen; // prep next char
         x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();
         ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random()); // random y-delta
         ctx.rotate(Math.random() * 0.005); // random rotation
         if (i < txt.length) requestAnimationFrame(loop);
      }
   })();
}

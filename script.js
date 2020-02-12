"use strict";

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

let width;
let height;
let boardSize;
let board;
let moving;

class Block {
  constructor(number) {
    this.number = number;
  }

  //Variables used to draw the blocks
  drawVariables(x, y , w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  draw() {
    if (this.number) {
      //Styling the blocks
      let padding = 10;
      ctx.strokeStyle = "#fff";
      ctx.font = (this.w / 5).toString() + "px Comic Sans MS";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#009999";
      ctx.fillRect(this.x + padding, this.y + padding, this.w - padding, this.h - padding);
      ctx.strokeRect(this.x + padding, this.y + padding, this.w - padding, this.h - padding);
      ctx.fillStyle = "#fff";
      ctx.fillText(this.number.toString(), this.x + this.w / 2, this.y + this.h / 2, width * 0.75);
    }
  }
    
  //Checking if two blocks are not colliding with each other
  connectionPoint(x, y) {
    return (
      x > this.x &&
      x < this.x + this.w &&
      y > this.y &&
      y < this.y + this.h
    );
  }
  
  //Implementing the movement of the blocks and the speed when you make them move
  moveTo(pos) {
    moving++;
    let actual_pos = {
      x: pos.x,
      y: pos.y,
    }
    let speed = {
      x: (this.x - actual_pos.x) / 12,
      y: (this.y - actual_pos.y) / 12,
    }

    let self = this;
    let c = 0;

    let operation = () => {
      drawSquares();
      self.x -= speed.x;
      self.y -= speed.y;
      if (c >= 12) {
        self.x = actual_pos.x;
        self.y = actual_pos.y;
        moving--;
      }
      else {
          
        setTimeout(operation, 15);
        c++;
      }
        
    
  
};
    setTimeout(operation, 15);
  }
}

//Function to shuffle the block's numbers everytime the user starts a new game
function randomArrange(array) {
  for (let i = 0; i < array.length; ++i) {
    let newIndex = Math.floor(Math.random() * (i + 1));
    let temporary = array[i];
    array[i] = array[newIndex];
    array[newIndex] = temporary;
  }
}

//Checking if the blocks are in the right positions
function isAdjacentValid(index_1, index_2) {
  let pos_1 = toEncapsulated(index_1);
  let pos_2 = toEncapsulated(index_2);
  let dist_1 = Math.abs(pos_1[0] - pos_2[0]);
  let dist_2 = Math.abs(pos_1[1] - pos_2[1]);

  if((!dist_1 || !dist_2) && (dist_1 === 1 || dist_2 === 1)) {

      return dist_1 !== dist_2;

    }
  return false;
}

function toEncapsulated(position) {
  return [ position % boardSize, Math.floor(position / boardSize) ];
}

function zeroValue() {

  for (let i = 0; i < board.length; ++i) {
    if (board[i].number === 0) {
      return i;
    }
  }
}

//Setting up the message for when you win the game and for how long it stays
function youWon() {
  if (!moving) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "50px Aerial"
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText('YOU WON!!', width/3, height/3);

    setTimeout(() => {
      location.reload();
    }, 1500);
  }

  else {
    setTimeout(youWon, 150);
  }
}

//Function to draw the blocks on the scenario
function drawSquares() {
  ctx.clearRect(0, 0, width, height);
  board.forEach(block => {
    block.draw();
  });
}

//Function to restart the game with a different block's position
function refresh() {
  drawSquares();
  if (checkYouWon()) {
    setTimeout(() => {
      canvas.removeEventListener("click", handleClick);
      setTimeout(youWon, 1000);
    }, 300);
  }
}

function checkYouWon() {
  let s_board = board.slice(0);
  s_board.splice(zeroValue(), 1);
  for (let i = 1; i < s_board.length; ++i) {
    if (s_board[i].number < s_board[i - 1].number) {
      return false;
    }
  }
  return true;
}



//new
function canvasDimension() {
  canvas.width = Math.min(window.innerWidth - 20, 700);
  canvas.height = Math.min(window.innerHeight - 40, 500);
  width = canvas.width;
  height = canvas.height;
}

canvasDimension();

window.addEventListener("resize", function () {
  canvasDimension();
  let wid = width / boardSize,
      he = height / boardSize;
  buildBoard(board);
  refresh();
});

function buildBoard(board) {
  for (let i = 0; i < board.length; ++i) {
    let actual_pos = toEncapsulated(i),
        wid = width / boardSize,
        he = height / boardSize;

    board[i].drawVariables(actual_pos[0] * wid, actual_pos[1] * he, wid, he);
  }
}

function init() {
  moving = 0;
  boardSize = 4;

  board = Array.from(Array(boardSize ** 2).keys());

  randomArrange(board);
  for (let i = 0; i < board.length; i++) {
    board[i] = new Block(board[i]);
  }
  buildBoard(board);
  refresh();
}

function handleClick(e) {
  if (!moving) {
    let rect = canvas.getBoundingClientRect();
    for (let i = 0; i < board.length; ++i) {
      if (board[i].connectionPoint(e.clientX - rect.x, e.clientY - rect.y)) {
        let zInd = zeroValue();
        if (isAdjacentValid(i, zInd)) {

          let temp_pos = {
            x: board[i].x,
            y: board[i].y,
          };
          board[i].moveTo(board[zInd]);
          board[zInd].moveTo(temp_pos);

          let temp = board[i];
          board[i] = board[zInd];
          board[zInd] = temp;
        }
        break;
      }
    }
    refresh();
  }
}

canvas.addEventListener("click", handleClick);

document.getElementById("reset").onclick = init;
init();
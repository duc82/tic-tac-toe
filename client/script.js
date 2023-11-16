const container = document.querySelector(".container");

const socket = io("http://localhost:5000");
const roomList = document.createElement("ul");
let roomName = "";
let turn;
let username = window.prompt("Enter your username: ");
while (!username) {
  username = window.prompt("Enter your username: ");
}

socket.on("rooms", (rooms) => {
  rooms.forEach((room) => {
    roomList.innerHTML += `
  <li class="room" id="${room.name}">
    <div class="room-details">
      <span class="room-name">${room.name}</span>
      <span class="player-count">
        <san class="current-player">${room.currentPlayer}</span>/<span class="max-player">${room.maxPlayer}</span>
      </span>
    </div>
    <button type="button" class="join-button" onclick="joinRoom('${room.name}')">Join</button>
    </li>`;
  });

  container.append(roomList);
});

function joinRoom(roomName) {
  roomName = roomName;
  socket.emit("joinRoom", roomName, username);
  container.removeChild(roomList);
}

socket.on("updateRoom", (room) => {
  const roomEl = document.getElementById(room.name);
  if (roomEl) {
    roomEl.innerHTML = `   
  <li class="room" id="${room.name}">
    <div class="room-details">
      <span class="room-name">${room.name}</span>
      <span class="player-count">
        <span class="current-player">${
          room.currentPlayer
        }</span>/<span class="max-player">${room.maxPlayer}</span>
      </span>
    </div>
    ${
      room.currentPlayer < room.maxPlayer
        ? `<button
          type="button"
          class="join-button"
          onclick="joinRoom('${room.name}')"
        >
          Join
        </button>`
        : '<span class="join-button">Full</span>'
    }
    </li>`;
  }
});

function countDown(el, time) {
  let n = time / 1000;
  el.textContent = n;
  const intervalId = setInterval(() => {
    if (n <= 0) {
      clearInterval(intervalId);
      socket.emit("turn", roomName, turn);
      return;
    }
    n--;
    el.textContent = n;
  }, 1000);
}

socket.on("startGame", (cells, turn, time) => {
  container.innerHTML = "";
  turn = turn;
  const game = document.createElement("div");
  game.className = "game";
  const turnEl = document.createElement("span");
  turnEl.textContent =
    socket.id === turn.player.socketId
      ? "Your turn"
      : `${turn.player.username} turn`;
  const timeEl = document.createElement("div");
  countDown(timeEl, time);
  const board = document.createElement("div");
  board.id = "board";
  cells.forEach(() => {
    board.innerHTML += "<div class='cell'></div>";
  });
  game.append(timeEl, turnEl, board);
  container.append(game);
});

const container = document.querySelector(".container");

const socket = io("http://localhost:5000");
const cells = Array.from({ length: 9 }, (_, i) => i);
const rooms = Array.from({ length: 5 }, (_, i) => `Room ${i + 1}`);

const roomList = document.createElement("ul");

rooms.forEach((room) => {
  roomList.innerHTML += `
  <li class="room" id="${room}">
    <div class="room-details">
      <span class="room-name">${room}</span>
      <span class="player-count">
        <san class="current">0</span>/2
      </span>
    </div>
    <button type="button" class="join-button" onclick="joinRoom('${room}')">Join</button>
    </li>`;
});

container.append(roomList);

function joinRoom(room) {
  const board = document.createElement("div");
  board.id = "board";
  cells.forEach((cell) => {
    board.innerHTML += "<div class='cell'></div>";
  });
  container.removeChild(roomList);
  container.append(board);

  socket.emit("joinRoom", room);
}

socket.on("joinRoom", (room) => {
  const rootElement = document.getElementById(room);
  if (rootElement) {
    const currentCount = rootElement.querySelector(".player-count .current");
    console.log(currentCount);
    currentCount.textContent = +currentCount.textContent + 1;
  }
});

import { Server } from "socket.io";
import http from "http";
import type { Room, Turn } from "./types";
import { addPlayer, deletePlayer, getPlayers } from "./player";

interface ServerToClientEvents {
  rooms: (rooms: Room[]) => void;
  updateRoom: (room: Room) => void;
  startGame: (squares: number | null[], turn: Turn, time: number) => void;
  turn: (turn: Turn) => void;
}

interface ClientToServerEvents {
  joinRoom: (roomName: string, username: string) => void;
  turn: (roomName: string, turn: Turn) => void;
}

interface InterServerEvents {
  ping: () => void;
}

const server = http.createServer();

const rooms: Room[] = Array.from({ length: 5 }, (_, i) => {
  return { name: `Room ${i + 1}`, currentPlayer: 0, maxPlayer: 2 };
});

let time = 30000;

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("A socket connected: " + socket.id);

  socket.emit("rooms", rooms);

  socket.on("joinRoom", (roomName, username) => {
    const roomIndex = rooms.findIndex((room) => room.name === roomName);
    if (roomIndex !== -1) {
      if (rooms[roomIndex].currentPlayer >= rooms[roomIndex].maxPlayer) return;

      socket.join(roomName);

      rooms[roomIndex].currentPlayer++;
      addPlayer({ socketId: socket.id, room: rooms[roomIndex], username });

      io.emit("updateRoom", rooms[roomIndex]);

      const players = getPlayers(roomName);

      if (players.length === 2) {
        const cells = Array.from({ length: 9 }, () => null);
        const turn: Turn = {
          player: players[0],
          value: "X",
        };

        io.to(roomName).emit("startGame", cells, turn, time);
      }
    }
  });

  socket.on("turn", (roomName, turn) => {
    const players = getPlayers(roomName);

    if (players[0].socketId === turn.player.socketId) {
      turn.player = players[1];
      turn.value = "O";
    } else {
      turn.player = players[0];
      turn.value = "X";
    }

    io.to(roomName).emit("turn", turn);
  });

  socket.on("disconnecting", () => {
    const disconnectRoom = Array.from(socket.rooms)[1];
    const roomIndex = rooms.findIndex((room) => room.name === disconnectRoom);
    if (roomIndex !== -1) {
      rooms[roomIndex].currentPlayer--;
      deletePlayer(socket.id);
      io.emit("updateRoom", rooms[roomIndex]);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

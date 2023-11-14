import { Server } from "socket.io";
import http from "http";

interface Room {
  name: string;
  currentPlayer: number;
  maxPlayer: number;
}

interface ServerToClientEvents {
  rooms: (rooms: Room[]) => void;
  updateRoom: (room: Room) => void;
  startGame: (cells: number[], turn: string, time: number) => void;
}

interface ClientToServerEvents {
  joinRoom: (roomName: string, username: string) => void;
  turn: (roomName: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

const server = http.createServer();

const rooms: Room[] = Array.from({ length: 5 }, (_, i) => {
  return { name: `Room ${i + 1}`, currentPlayer: 0, maxPlayer: 2 };
});

const cells = Array.from({ length: 9 }, (_, i) => i);
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

  socket.on("joinRoom", async (roomName, username) => {
    const roomIndex = rooms.findIndex((room) => room.name === roomName);
    if (roomIndex !== -1) {
      if (rooms[roomIndex].currentPlayer >= rooms[roomIndex].maxPlayer) return;

      socket.join(roomName);
      rooms[roomIndex].currentPlayer++;
      io.emit("updateRoom", rooms[roomIndex]);
      const sockets = await io.in(roomName).fetchSockets();
      if (sockets.length === 2) {
        const turn = sockets[0].id;

        io.to(roomName).emit("startGame", cells, turn, time);
      }
    }
  });

  socket.on("disconnecting", () => {
    const disconnectRoom = Array.from(socket.rooms)[1];
    const roomIndex = rooms.findIndex((room) => room.name === disconnectRoom);
    if (roomIndex !== -1) {
      rooms[roomIndex].currentPlayer--;
      io.emit("updateRoom", rooms[roomIndex]);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

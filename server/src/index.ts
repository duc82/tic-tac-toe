import { Server } from "socket.io";
import http from "http";

interface ServerToClientEvents {
  joinRoom: (room: string) => void;
}

interface ClientToServerEvents {
  joinRoom: (room: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

const server = http.createServer();

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

  const rooms = Array.from(socket.rooms);

  console.log(socket.rooms);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    io.emit("joinRoom", room);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

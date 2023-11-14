export interface Room {
  name: string;
  currentPlayer: number;
  maxPlayer: number;
}

export interface Player {
  socketId: string;
  username: string;
  room: Room;
}

export interface Turn {
  player: Player;
  value: "X" | "O";
}

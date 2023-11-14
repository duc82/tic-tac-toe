import type { Player } from "./types";

const players: Player[] = [];

const addPlayer = (player: Player) => {
  const playerIndex = players.findIndex((p) => p.socketId === player.socketId);
  if (playerIndex === -1) {
    players.push(player);
  }
};

const getPlayers = (roomName: string) => {
  const datas = players.filter((player) => player.room.name === roomName);
  return datas;
};

const updatePlayer = (player: Player) => {
  const playerIndex = players.findIndex((p) => p.socketId === player.socketId);
  if (playerIndex !== -1) {
    players[playerIndex] = player;
  }
};

const deletePlayer = (socketId: string) => {
  const playerIndex = players.findIndex((p) => p.socketId === socketId);
  if (playerIndex !== -1) {
    players.splice(playerIndex, 1);
  }
};

export { addPlayer, getPlayers, updatePlayer, deletePlayer };

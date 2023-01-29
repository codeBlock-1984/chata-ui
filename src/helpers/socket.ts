import { io } from 'socket.io-client';

const url: string = 'http://localhost:3007';
const users = [];

export const socket = io(url, {
  autoConnect: false
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on("connect_error", (err) => {
  console.log(err);
  if (err.message === "invalid username") {
    //this.usernameAlreadySelected = false;
  }
});

socket.on("users", (users) => {
  users.forEach((user: any) => {
    user.self = user.userID === socket.id;
    console.log(user);
  });
  // put the current user first, and then sort by username
  users = users.sort((a: any, b: any) => {
    if (a.self) return -1;
    if (b.self) return 1;
    if (a.username < b.username) return -1;
    return a.username > b.username ? 1 : 0;
  });
});

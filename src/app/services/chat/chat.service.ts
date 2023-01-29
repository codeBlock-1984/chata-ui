import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  socket: any;
  url: string = 'http://localhost:3007';
  users: any[] = [];
  selectedUser: any = null;
  isLoggedIn: boolean = false;

  constructor() {
    this.socket = io(this.url, {
      autoConnect: false
    });

    this.init();

    this.socket.on("session", ({ sessionID, userID }: any) => {
      // attach the session ID to the next reconnection attempts
      this.socket.auth = { sessionID };
      // store it in the localStorage
      localStorage.setItem("sessionID", sessionID);
      // save the ID of the user
      this.socket.userID = userID;
    });
    this.socket.on("connect_error", (err: Error) => {
      if (err.message === "invalid username") {
        // this.usernameAlreadySelected = false;
      }
    });

    this.socket.onAny((event: any, ...args: any[]) => {
      console.log(event, args);
    });

    this.socket.on("connect_error", (err: Error) => {
      console.log(err);
      if (err.message === "invalid username") {
      }
    });

    this.socket.on("users", (users: any[]) => { this.updateUsers(users) });
    this.socket.on("user connected", (user: any) => {
      this.users.push(user);
    });

    this.socket.on("private message", ({ content, from, timestamp }: any) => {
      console.log('her>>>>>>>>')
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.userID === from) {
          console.log(user, 'us')
          if (!user.messages) {
            user.messages = [];
          }
          user.messages.push({
            content,
            fromSelf: false,
            timestamp
          });
          if (user !== this.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
    });

    this.socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });
    
    this.socket.on("disconnect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });
  }

  init(): void {
    const sessionID = localStorage.getItem("sessionID");
    console.log(sessionID, 'init');
    if (sessionID) {
      // this.usernameAlreadySelected = true;
      this.socket.sessionID = sessionID;
      this.socket.connect();
      this.isLoggedIn = true;
    }
  }

  login(auth: any): void {
    this.socket.auth = { username: auth.username };
    this.socket.connect();
    this.isLoggedIn = true;
  }

  updateUsers(users: any[]): void {
    console.log('users', users)
    users.forEach((user: any) => {
      user.self = user.userID === this.socket.id;
      console.log(user);
    });
    // put the current user first, and then sort by username
    this.users = users.sort((a: any, b: any) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
  }

  getUsers(): any[] {
    return this.users;
  }

  setUser(user: any) {
    this.selectedUser = user;
    this.selectedUser.hasNewMessages = false;
  }

  sendMessage(id: number, content: string, timestamp: any): void {
    this.socket.emit("private message", {
      content,
      to: id,
      timestamp
    });

    if (!this.selectedUser.messages) {
      this.selectedUser.messages = [];
    }

    this.selectedUser.messages.push({
      content,
      fromSelf: true,
      timestamp
    });
  }
  
}

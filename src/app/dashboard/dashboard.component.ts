import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatService } from '../services/chat/chat.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  username: string = '';
  selectedUser: any = {
    userID: null,
    messages: []
  };
  message: string  = '';

  users: any[] = [];

  @ViewChild('textBox', {static: false}) textBox!: ElementRef;

  constructor(public chat: ChatService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log(this.textBox);
    if (this.textBox) {
      this.resetChat();
    }
  }

  login(): void {
    if (this.username) {
      this.chat.login({ username: this.username });
      this.users = this.chat.getUsers();
      console.log(this.users, 'dhash')
    }
  }

  initChat(e: any, user: any): void {
    e.preventDefault();
    if (this.selectedUser !== user) {
      this.selectedUser = user;
      this.chat.setUser(user);
      setTimeout(() => {
        this.resetChat();
      }, 100);
    }
  }

  handleContentChange($event: any): void {
    this.message = $event.target.innerText;
  }

  submit($event: any): void {
    $event.preventDefault();
    console.log($event);
    this.sendMessage();
  }

  sendMessage(): void {
    console.log(this.message, 'mesage');
    if (this.selectedUser) {
      const timestamp = new Date();
      this.chat.sendMessage(this.selectedUser.userID, this.message, timestamp);
      this.resetChat();
    }
  }

  resetChat() {
    console.log(this.textBox)
    this.message = '';
    this.textBox.nativeElement.innerText = '';
  }

}

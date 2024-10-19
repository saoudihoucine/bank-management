import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'app/services/chat.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss']
})
export class ChatBotComponent {
  chatHistory: { text: string, sender: string }[] = [];
  userInput: string = '';
  chatOpen: boolean = false;

  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);


  @ViewChild('chatBody') private chatBody!: ElementRef;

  constructor(private chatService: ChatService) { }


  toggleChat() {
    this.chatOpen = !this.chatOpen;
  }


  sendMessage() {
    if (this.userInput.trim()) {


      const message = { userMessage: this.userInput, id:this.decodedToken.id}


      this.chatHistory.push({ text: this.userInput, sender: 'user' });


      this.chatService.sendMessage(message).subscribe((data) => {
        setTimeout(() => {
          this.chatHistory.push({ text: data.response, sender: 'response' });

          this.scrollToBottom();
        }, 1000);


        this.userInput = '';
      });



    }


    setTimeout(() => this.scrollToBottom(), 100);
  }


  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }, 0);
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
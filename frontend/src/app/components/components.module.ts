import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatBotComponent } from 'app/chat-bot/chat-bot.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule  
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ChatBotComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ChatBotComponent
  ]
})
export class ComponentsModule { }

import { Component, OnInit } from '@angular/core';
import { Client } from 'app/models/client';
import { User } from 'app/models/user';
import { ClientService } from 'app/services/client.service';
import { LoginService } from 'app/services/login.service';
import { NotificationService } from 'app/services/notification.service';
import { UserService } from 'app/services/user.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  token = localStorage.getItem('token');
  profile: any

  decodedToken: any = jwtDecode(this.token);

  constructor(private userService: UserService, private clientService: ClientService, private notificationService: NotificationService, private loginService: LoginService) { }

  ngOnInit() {
    console.log(this.decodedToken)
    this.loginService.profile(this.decodedToken.id).subscribe((data) => {
      this.profile = data
      console.log(data)
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });

  }


  editProfile(profile) {


    if (profile.role === "client") {
      this.clientService.updateClient(this.decodedToken.id, profile.client).subscribe((data: Client) => {
        this.notificationService.showNotification("success", "Operation effectué avec succés")
        console.log(data)
        this.loginService.profile(this.decodedToken.id).subscribe((data) => {
          this.profile = data
          
        },
          error => {
            console.error('Error :', error);
            this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
          });
      },
        error => {
          console.error('Error :', error);
          this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
        });
    } else {
      this.userService.updateUser(this.decodedToken.id, profile.user).subscribe((data: User) => {
        this.notificationService.showNotification("success", "Operation effectué avec succés .")
      },
        error => {
          console.error('Error :', error);
          this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
        });
    }


  }

}

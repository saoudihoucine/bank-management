import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Agence } from 'app/models/agence';
import { User } from 'app/models/user';
import { AgenceService } from 'app/services/agence.service';
import { NotificationService } from 'app/services/notification.service';
import { UserService } from 'app/services/user.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;  // For editing or creating a new user
  isEditing = false;
  closeResult = '';
  isAddUser = false
  isEditUser = false
  userRole: string = "DirecteurFinancement";

  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);
  agences: Agence[];

  constructor(private notificationService: NotificationService, private userService: UserService, private router: Router, private agenceService: AgenceService) { }

  ngOnInit(): void {
    this.getUsers(this.userRole);
    this.loadAgences()
  }

  loadAgences() {
    this.agenceService.getAgences().subscribe((data: Agence[]) => {
      this.agences = data;
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  getEditedUser(user: User) {
    this.selectedUser = user;
    this.isEditUser = true;
  }

  getUsers(role: string): void {
    this.userService.getUsers(role).subscribe((data: User[]) => {
      this.users = data;
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  addUser(userForm): void {
    const user: User = userForm.value
    user.agenceId = this.decodedToken.agenceId
    this.userService.createUser(user).subscribe((data: any) => {
      alert(data.response)
      this.getUsers(user.role)
      this.notificationService.showNotification("success", "Client ajouté avec succès .")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
    this.isAddUser = false;
  }


  changeStatus(user: User) {
    user.active = !user.active;
    this.editUser(user);
  }

  editUser(user: User): void {
    this.userService.updateUser(user.id, user).subscribe((data: User) => {
      this.isEditUser = false;
      console.log(data)
      this.getUsers(data.role);
      this.notificationService.showNotification("success", "Operation effectué avec succés .")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  saveUser(): void {
    if (this.isEditing && this.selectedUser) {
      this.userService.updateUser(this.selectedUser.id!, this.selectedUser).subscribe((data: User) => {
        this.getUsers(data.role);
        this.selectedUser = null;
      });
    } else if (this.selectedUser) {
      this.userService.createUser(this.selectedUser).subscribe((data: User) => {
        this.getUsers(data.role);
        this.selectedUser = null;
      });
    }
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe(() => {
      this.users = this.users.filter(user => user.id !== id);
    });
  }

  getComptesByUser(userId: string): void {
    this.router.navigateByUrl("comptes/list/" + userId)

  }

  cancel(): void {
    this.selectedUser = null;
  }
}
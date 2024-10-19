import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'app/services/login.service';
import { NotificationService } from 'app/services/notification.service';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  token: string;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private notificationService: NotificationService, private route: ActivatedRoute, private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  reset(resetForm) {
    const newPassword = resetForm.value.newPassword;
    this.loginService.resetPassword(this.token, newPassword).subscribe(response => {
      this.notificationService.showNotification("success", "Mot de passe modifié avec succées !")
      this.router.navigateByUrl("login")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      }

    );
  }

}

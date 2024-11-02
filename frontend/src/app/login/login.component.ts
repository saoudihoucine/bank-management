import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'app/services/login.service';
import { NotificationService } from 'app/services/notification.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = ""
  password = ""
  isForgetPassword = false;
  isResetPassword = false;
  constructor(private notificationService: NotificationService, private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
  }

  onForget(forgetForm): void {

    const email = forgetForm.value.email;
    this.loginService.recoverPassword(email).subscribe(response => {
      console.log(response)
      alert(response.message)
      this.notificationService.showNotification("success", "Email envoyée avec succées !")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      }

    );
  }


  onLogin(form) {
    this.loginService.login(form.value.email, form.value.password).subscribe(
      response => {
        // Store the token and user role
        const token = response.token;
        const decodedToken: any = jwtDecode(token);
        localStorage.setItem('token', token);
        if (decodedToken.role == "client") {
          this.router.navigate(['/welcome/' + decodedToken.id]);
        } else {
          this.router.navigate(['/gestCredit/list']);
        }


        // Handle successful login (redirect or other logic)
        //console.log('Login successful:', response);
      },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      }
    );
  }

}

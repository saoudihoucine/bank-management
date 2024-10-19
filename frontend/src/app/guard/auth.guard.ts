// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken: any = jwtDecode(token);
      const isExpired = this.isTokenExpired(decodedToken.exp);

      console.log(decodedToken)

      if (!isExpired) {
        return true; // Allow access if token is valid and not expired
      }
    }

    // Redirect to login page if token is not set or expired
    this.router.navigate(['/login']);
    return false;
  }

  private isTokenExpired(expirationTime: number): boolean {
    return Date.now() >= expirationTime * 1000; // Check if the current time is greater than the expiration time
  }
}

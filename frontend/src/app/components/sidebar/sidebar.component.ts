import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  roles: string[];
}
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'dashboard', class: '', roles: [] },
  { path: '/user-profile', title: 'User Profile', icon: 'person', class: '', roles: [] },
  { path: '/table-list', title: 'Table List', icon: 'content_paste', class: '', roles: [] },
  { path: '/typography', title: 'Typography', icon: 'library_books', class: '', roles: [] },
  { path: '/icons', title: 'Icons', icon: 'bubble_chart', class: '', roles: [] },
  { path: '/maps', title: 'Maps', icon: 'location_on', class: '', roles: [] },
  { path: '/welcome/', title: 'Dashboard', icon: 'dashboard', class: '', roles: ["client"] },
  { path: '/comptes/list/', title: 'Comptes', icon: 'account_balance_wallet', class: '', roles: ["client"] },
  { path: '/credit/simuler/', title: 'Simulation de crédit', icon: 'payments', class: '', roles: ["client"] },
  { path: '/credit/list/', title: 'Mes credits', icon: 'payments', class: '', roles: ["client"] },
  { path: '/gestCredit/list/', title: 'Gestion des credits', icon: 'payments', class: '', roles: ["ChargeClientele", "Admin", "DirecteurFinancement"] },
  { path: '/clients', title: 'Clients', icon: 'group', class: '', roles: ["ChargeClientele", "Admin"] },
  { path: '/users', title: 'Utilisateur Banque', icon: 'group', class: '', roles: ["Admin"] },
  { path: '/agences', title: 'Agences', icon: 'home', class: '', roles: ['Admin', "ChargeClientele", "client", "DirecteurFinancement"] },
  { path: '/notifications', title: 'Notifications', icon: 'notifications', class: '', roles: [] },

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);

  constructor() { }

  ngOnInit() {
    // console.log(this.decodedToken)


    this.menuItems = ROUTES.filter(route => {
      if (route.path === '/comptes/list/' || route.path === '/credit/list/' || route.path === '/credit/simuler/' || route.path === '/welcome/') {
        if (this.decodedToken.role === 'client') {
          // console.log(this.decodedToken.id.toString())      
          route.path = route.path + (this.decodedToken.id).toString();
        }

      }
      return route.roles.includes(this.decodedToken.role);
    });
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };
}

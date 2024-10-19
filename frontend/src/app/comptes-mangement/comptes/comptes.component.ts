import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from 'app/models/client';
import { Compte } from 'app/models/compte';
import { Transaction } from 'app/models/transaction';
import { ClientService } from 'app/services/client.service';
import { CompteService } from 'app/services/compte.service';
import { NotificationService } from 'app/services/notification.service';
import { TransactionService } from 'app/services/transaction.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.scss']
})
export class ComptesComponent implements OnInit {
  clientId: string;
  comptes: Compte[] = null;
  compte: Compte = null;
  client: Client = null;
  transactions: Transaction[] = null;
  isTransactions = false;
  isAddTransactions = false;
  isAddCompte = false;
  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);

  isClient = this.decodedToken.role == 'client' ? true : false;



  constructor(private notificationService: NotificationService, private compteService: CompteService, private route: ActivatedRoute, private router: Router, private clientService: ClientService) { }
  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');

    this.getClientByCin(this.clientId)


    this.getComptesByClient(this.clientId)

  }

  getComptesByClient(clientId) {
    this.compteService.getComptesByClient(clientId).subscribe((data: Compte[]) => {
      this.comptes = data
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });

  }



  addCompte(compte) {
    console.log(compte.value)
    this.compteService.createCompte(compte.value).subscribe((data: Compte) => {
      this.getComptesByClient(this.clientId)
      this.isAddCompte = false;
      this.notificationService.showNotification("success", "Compte ajouté avec succès .")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });

  }


  getTransactionByRIB(clientId: string): void {
    this.router.navigateByUrl("transaction/list/" + clientId)

  }

  getClientByCin(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe((data: Client) => {
      this.client = data
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });

  }

  backToComptesList() {
    this.isTransactions = !this.isTransactions
    this.clientId = this.route.snapshot.paramMap.get('clientId');


    this.getComptesByClient(this.clientId)
  }



}

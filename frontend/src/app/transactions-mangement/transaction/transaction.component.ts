import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RoutesRecognized, Router } from '@angular/router';
import { Transaction } from 'app/models/transaction';
import { TransactionService } from 'app/services/transaction.service';
import { Location } from '@angular/common';
import { CompteService } from 'app/services/compte.service';
import { Compte } from 'app/models/compte';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from 'app/services/notification.service';


@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  isAddTransactions = false;
  rib: string;
  transactions: Transaction[] = [];
  isTransactions = false;
  isAddCompte = false;
  isMonCompte = false;
  isAutreCompte = false;
  compte: Compte;
  comptes: Compte[];
  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);

  isClient = this.decodedToken.role == 'client' ? true : false;

  constructor(private notificationService: NotificationService, private compteService: CompteService, private location: Location, private transactionService: TransactionService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.rib = this.route.snapshot.paramMap.get('rib');
    this.getCompteByRIB(this.rib);
    this.getTransactionByRIB(this.rib);
    // this.getComptesByClient(this.compte.clientId)
  }



  backToComptesList() {
    this.location.back()
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

  getCompteByRIB(rib: string) {
    this.compteService.getCompteByRib(rib).subscribe((data: Compte) => {
      this.compte = data
      this.getComptesByClient(data.clientId)
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  getTransactionByRIB(rib: String) {
    this.isTransactions = !this.isTransactions;
    this.transactionService.getTransactions(rib).subscribe((data: Transaction[]) => {
      this.transactions = data
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  addTransaction(form) {
    let transaction = new Transaction();
    transaction.compteRib = this.rib;
    transaction.montant = form.value.montant;
    transaction.type = form.value.type;
    transaction.motif = form.value.motif;
    transaction.compteDestinataire = form.value.compteDestinataire;
    if (this.decodedToken.role == "client") {
      transaction.approuveParClientId = this.decodedToken.id;
    } else if (this.decodedToken.role == "ChargeClientele") {
      transaction.approuveParChargeId = this.decodedToken.id;
    }

    // transaction = form.value;
    this.transactionService.createTransaction(transaction).subscribe((data: Transaction) => {
      // this.transactionService.getTransactions(transaction.compteRib).subscribe((data: Transaction[]) => {
      //   this.transactions = data 
      // });
      console.log(data)
      this.getTransactionByRIB(transaction.compteRib)
      this.notificationService.showNotification("success", "Transaction effectuée avec succès")
    }, (error) => {
      console.error('Error: ', error);
      this.notificationService.showNotification("danger", "Une erreur se produite : "+error.error.message)
    }
    );
    console.log(transaction)
    this.transactions;
    form.reset()
    this.isAddTransactions = false
  }

}

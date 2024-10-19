import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from 'app/models/client';
import { Compte } from 'app/models/compte';
import { DemandeCredit } from 'app/models/demandeCredit';
import { Transaction } from 'app/models/transaction';
import { ClientService } from 'app/services/client.service';
import { CompteService } from 'app/services/compte.service';
import { DemandeCreditService } from 'app/services/demande-credit.service';
import { NotificationService } from 'app/services/notification.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss']
})
export class CreditComponent implements OnInit {
  progressValue = 40;
  clientId: string;
  credits: DemandeCredit[] = null;
  compte: Compte = null;
  client: Client = null;
  transactions: Transaction[] = null;
  isTransactions = false;
  isAddTransactions = false;
  isAddCredit = false;
  token = localStorage.getItem('token');

  demandeCredit = new DemandeCredit()

  decodedToken: any = jwtDecode(this.token);

  isClient = this.decodedToken.role == 'client' ? true : false;

  interestAmount: number = 0;
  message: string = '';

  creditType = "creditPresalaire"
  creditAmount: number = 5000;
  maximal: number = 5;
  creditDuration = 1;


  montant: number = 0;
  duree: number = 0;
  tauxTMM: number = 7.99; // TMM actuel
  salaireNet: number = 0;
  interet: number = 0;
  capaciteMensuelle: number = 0;
  simulateResponse: any = null;
  credit: DemandeCredit;

  selectedFiles: File[] = [];



  constructor(private creditRequestService: DemandeCreditService, private notificationService: NotificationService, private compteService: CompteService, private route: ActivatedRoute, private router: Router, private clientService: ClientService) { }
  ngOnInit(): void {
    if (this.decodedToken.role == "client") {
      this.clientId = this.route.snapshot.paramMap.get('clientId');
      this.getClientByCin(this.clientId)
      this.getCreditByClient(this.clientId)
    } else {
      this.getAllCredit()
    }







  }


  updateMaximal(newMaxValue: number): void {
    this.maximal = newMaxValue;
  }

  // Fonction appelée à chaque changement de valeur du slider
  onSliderInput(event: any): void {
    const newValue = event.value;
    this.creditDuration = newValue
  }

  onCreditTypeChange(): void {
    switch (this.creditType) {
      case 'creditPresalaire':
        this.creditAmount = 25000;
        this.maximal = 5;
        break;
      case 'creditAmenagements':
        this.creditAmount = 50000;
        this.maximal = 7;
        break;
      case 'créditImmobilier':
        this.creditAmount = 300000;
        this.maximal = 25;
        break;
      case 'creditAutoInvest':
        this.creditAmount = 50000;
        this.maximal = 7;
        break;
      default:
        this.creditAmount = 25000;
    }
  }


  getCreditByClient(clientId) {
    this.creditRequestService.getCreditByClient(clientId).subscribe((data: DemandeCredit[]) => {
      this.credits = data
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });

  }


  getAllCredit() {
    this.creditRequestService.getAllCredit().subscribe((data: DemandeCredit[]) => {
      this.credits = data
      console.log(data)
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });

  }
  getDemandesCreditDetails(id) {
    // this.creditRequestService.getDemandesCreditDetails(id).subscribe((data: DemandeCredit) => {
    //   this.credit = data
    // },
    //   error => {
    //     console.error('Error :', error);
    //     this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
    //   });

    this.router.navigateByUrl("credit/detail/" + id)

  }


  creditDetail(id) {

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


    this.getCreditByClient(this.clientId)
  }

  simulateCredit(simulCreditForm) {

    this.demandeCredit.typeCreditId = simulCreditForm.form.value.creditType
    this.demandeCredit.duree = simulCreditForm.form.value.creditDuration
    this.demandeCredit.montant = simulCreditForm.form.value.creditAmount
    this.demandeCredit.netSalary = simulCreditForm.form.value.netMonthly
    if (this.clientId) {
      this.demandeCredit.clientId = this.clientId.toString()
    }else{
      this.demandeCredit.clientId = simulCreditForm.form.value.netMonthly
    }


    this.creditRequestService.simulateCredit(this.demandeCredit).subscribe((data: any) => {
      this.simulateResponse = data
      console.log(data)
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }



  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }


  validatedemandeCredit() {

    if (this.demandeCredit) {

      const formData = new FormData();
     

     

      if (this.clientId) {
        formData.append('clientId', this.clientId.toString());
      }

      formData.append('creditCapacity', this.simulateResponse.creditCapacity.toString());
      formData.append('interet', this.simulateResponse.interet.toString());
      formData.append('montant', this.simulateResponse.montant.toString());
      formData.append('mensualites', this.simulateResponse.monthlyPayment.toString());
      formData.append('totalMontant', this.simulateResponse.total.toString());
      formData.append('typeCreditId', this.demandeCredit.typeCreditId.toString());
      formData.append('duree', this.demandeCredit.duree.toString());
      formData.append('netSalary', this.demandeCredit.netSalary.toString());

      this.selectedFiles.forEach(file => {
        formData.append('documents', file);
      });







      this.creditRequestService.submitCreditRequest(formData).subscribe((data: any) => {
        this.simulateResponse = data
        if (this.decodedToken.role == "client") {
          this.clientId = this.route.snapshot.paramMap.get('clientId');
          this.getClientByCin(this.clientId)
          this.getCreditByClient(this.clientId)
        } else {
          this.getAllCredit()
        }
        this.notificationService.showNotification("success", "Demande effectué avec succées :")
        this.isAddCredit = false
      },
        error => {
          console.error('Error :', error);
          this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
        });
    }


  }



  calculateInterest(simulCreditForm): void {
    const formValues = simulCreditForm.value;
    const { creditType, creditAmount, creditDuration, brutMonthly } = formValues;

    console.log(creditType + " " + creditAmount + " " + creditDuration + " " + brutMonthly)
  }



}

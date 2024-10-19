import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DemandeCredit } from 'app/models/demandeCredit';
import { DemandeCreditService } from 'app/services/demande-credit.service';
import { NotificationService } from 'app/services/notification.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'cedit-details',
  templateUrl: './cedit-details.component.html',
  styleUrls: ['./cedit-details.component.scss']
})
export class CeditDetailsComponent implements OnInit {
  id: string;
  detail: any = "";
  payments: any;
  paymentPercentage: number = 50;

  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);

  isClient = this.decodedToken.role == 'client' ? true : false;
  isDF = this.decodedToken.role == 'DirecteurFinancement' ? true : false;

  constructor(private creditRequestService: DemandeCreditService, private notificationService: NotificationService, private location: Location, private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDemandesCreditDetails(this.id)

  }



  submitDecision(id, decisionForm) {
    const credit = new DemandeCredit()
    credit.id = id;
    credit.status = decisionForm.form.value.decision
    credit.currentProfile = this.decodedToken.role
    this.creditRequestService.validateCredit(credit).subscribe((data: any) => {
      this.notificationService.showNotification("success", "Traitement effectué avec succées")
      this.getDemandesCreditDetails(this.id)
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }


  backToCreditsList() {
    this.location.back()
  }


  getDemandesCreditDetails(creditId: string): void {
    this.creditRequestService.getDemandesCreditDetails(creditId).subscribe((data: any) => {
      if (data.demande[0].documents) { 
        data.demande[0].documents = JSON.parse(data.demande[0].documents);
      }
      this.detail = data
      console.log(data)
      
      this.payments = data.history
      const totalPayments = this.payments.length;
      const paidPayments = this.payments.filter(payment => payment.statut === 'Paid').length;
      this.paymentPercentage = Math.floor((paidPayments/ totalPayments) * 100);
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });

  }

}

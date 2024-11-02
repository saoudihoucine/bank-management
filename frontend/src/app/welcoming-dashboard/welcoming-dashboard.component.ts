import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from 'app/services/client.service';

@Component({
  selector: 'welcoming-dashboard',
  templateUrl: './welcoming-dashboard.component.html',
  styleUrls: ['./welcoming-dashboard.component.scss']
})
export class WelcomingDashboardComponent implements OnInit {
  clientId: any;
  financialData: any;

  constructor(private route: ActivatedRoute, private router: Router, private clientService: ClientService) { }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    this.clientService.getDashboardClientById(this.clientId).subscribe({
      next: (data) => {
        this.financialData = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}

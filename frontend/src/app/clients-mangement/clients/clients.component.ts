import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Client } from 'app/models/client';
import { ClientService } from 'app/services/client.service';
import { NotificationService } from 'app/services/notification.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  selectedClient: Client | null = null;  // For editing or creating a new client
  isEditing = false;
  closeResult = '';
  isAddClient = false
  isEditClient = false

  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);

  constructor(private notificationService: NotificationService, private clientService: ClientService, private modalService: NgbModal, private router: Router) { }

  ngOnInit(): void {
    this.getClients();
  }

  getEditedClient(client: Client) {
    this.selectedClient = client;
    this.isEditClient = true;
  }

  searchClient(cin) {
    this.clients.filter(client => client.id == cin)
  }

  getClients(): void {
    this.clientService.getClients().subscribe((data: Client[]) => {
      if (this.decodedToken.role != 'Admin') {
        this.clients = data.filter(client => client.agenceId == this.decodedToken.agenceId)
      } else {
        this.clients = data;
      }

    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  addClient(clientForm): void {
    const client: Client = clientForm.value
    client.agenceId = this.decodedToken.agenceId
    this.clientService.createClient(client).subscribe((data: Client) => {
      this.getClients()
      this.notificationService.showNotification("success", "Client ajouté avec succès .")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
    this.isAddClient = false;
  }


  changeStatus(client: Client) {
    client.active = !client.active;
    this.editClient(client);
  }

  editClient(client: Client): void {
    this.clientService.updateClient(client.id, client).subscribe((data: Client) => {
      this.isEditClient = false;
      console.log(data)
      this.getClients();
      this.notificationService.showNotification("success", "Operation effectué avec succés")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  saveClient(): void {
    if (this.isEditing && this.selectedClient) {
      this.clientService.updateClient(this.selectedClient.id!, this.selectedClient).subscribe(() => {
        this.getClients();
        this.selectedClient = null;
      });
    } else if (this.selectedClient) {
      this.clientService.createClient(this.selectedClient).subscribe(() => {
        this.getClients();
        this.selectedClient = null;
      });
    }
  }

  deleteClient(id: string): void {
    this.clientService.deleteClient(id).subscribe(() => {
      this.clients = this.clients.filter(client => client.id !== id);
    });
  }

  getComptesByClient(clientId: string): void {
    this.router.navigateByUrl("comptes/list/" + clientId)

  }

  cancel(): void {
    this.selectedClient = null;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
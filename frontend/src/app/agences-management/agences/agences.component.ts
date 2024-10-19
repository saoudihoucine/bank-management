import { Component, OnInit } from '@angular/core';
import { Agence } from 'app/models/agence';
import { AgenceService } from 'app/services/agence.service';
import { NotificationService } from 'app/services/notification.service';
import { jwtDecode } from 'jwt-decode';

declare const google: any;

@Component({
  selector: 'agences',
  templateUrl: './agences.component.html',
  styleUrls: ['./agences.component.scss']
})
export class AgencesComponent implements OnInit {
  map: any;
  agences: Agence[] = [];
  isEditForm: boolean = false;
  selectedAgence: Agence | null = null;
  currentMarker: any;
  currentInfoWindow: any;
  markers: any[] = [];
  newAgence: Agence = { nom: '', telephone: '', adresse: '', longitude: '', latitude: '' };
  longitude: string;
  latitude: string;

  token = localStorage.getItem('token');

  decodedToken: any = jwtDecode(this.token);

  isAdmin: boolean = this.decodedToken.role === "Admin" ? true : false;

  constructor(private notificationService: NotificationService, private agenceService: AgenceService) { }

  ngOnInit(): void {
    console.log(this.isAdmin)
    this.initializeMap();
    this.loadAgences();
  }

  initializeMap() {
    const myLatlng = new google.maps.LatLng(34.381869, 9.367917);
    const mapOptions = {
      zoom: 6,
      center: myLatlng,
      scrollwheel: false,
      styles: [
        {
          featureType: 'water',
          stylers: [{ saturation: 43 }, { lightness: -11 }, { hue: '#0088ff' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [{ hue: '#ff0000' }, { saturation: -100 }, { lightness: 99 }],
        },
      ],
    };

    // Initialize the map
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    // Add a click listener to the map
    this.map.addListener('click', (event) => {
      if (this.isEditForm && this.selectedAgence) {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        this.selectedAgence.latitude = clickedLat.toString();
        this.selectedAgence.longitude = clickedLng.toString();

        // Update the input fields in the form (you might need to use Angular's ChangeDetectorRef to trigger change detection)
      }
    });


    this.map.addListener("click", (mapsMouseEvent) => {





      // Create a new InfoWindow.
      let infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });

      if (this.isEditForm && this.selectedAgence) {

        this.selectedAgence.latitude = JSON.stringify(mapsMouseEvent.latLng.toJSON().lat, null, 2);
        this.selectedAgence.longitude = JSON.stringify(mapsMouseEvent.latLng.toJSON().lng, null, 2);
      } else {
        const lat = JSON.stringify(mapsMouseEvent.latLng.toJSON().lat, null, 2)
        const lng = JSON.stringify(mapsMouseEvent.latLng.toJSON().lng, null, 2)
        this.latitude = mapsMouseEvent.latLng.toJSON().lat;
        this.longitude = mapsMouseEvent.latLng.toJSON().lng;

        if (confirm("Confimer") == true) {
          this.newAgence.longitude = JSON.stringify(mapsMouseEvent.latLng.toJSON().lng, null, 2);
          this.newAgence.latitude = JSON.stringify(mapsMouseEvent.latLng.toJSON().lat, null, 2);
          this.placeMarker(this.longitude, this.latitude);
        }
      }







    });



  }

  placeMarker(lat: string, lng: string) {
    if (this.currentMarker) {
      this.currentMarker.setMap(null); // Remove previous marker
    }
    const position = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

    console.log(parseFloat(lat) + " " + parseFloat(lng))

    this.currentMarker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: 'Selected Location',
    });

    const infoWindow = new google.maps.InfoWindow({
      content: "<h4>" + position + "</h4>",
    });

  }

  loadAgences() {
    this.agenceService.getAgences().subscribe((data: Agence[]) => {
      this.agences = data;
      this.setMarkers();
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  setMarkers() {
    this.agences.forEach((agence) => {
      const position = new google.maps.LatLng(parseFloat(agence.latitude), parseFloat(agence.longitude));

      const markerColor = agence.status ? 'green' : 'red';

      const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
      const iconUrl = `${iconBase}${markerColor}-dot.png`;

      const marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: agence.nom,
        icon: iconUrl,
      });

      this.markers.push(marker);

      const infoWindow = new google.maps.InfoWindow({
        content: this.createInfoWindowContent(agence),
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
        this.setupEditButtonListener(infoWindow, agence);
      });
    });
  }

  createInfoWindowContent(agence: Agence): string {
    const actionButtonLabel = agence.status ? 'Désactiver' : 'Activer';
    if (this.isAdmin) {
      return `
      <div>
        <h4>${agence.nom}</h4>
        <p>Adresse: ${agence.adresse}</p>
        <p>Téléphone: ${agence.telephone}</p>
        <button id="disable-button-${agence.id}" class="btn btn-success pull-right">${actionButtonLabel}</button>
        <button id="edit-button-${agence.id}" class="btn btn-success pull-right">Modifier</button>
      </div>`;
    } else {
      return `
      <div>
        <h4>${agence.nom}</h4>
        <p>Adresse: ${agence.adresse}</p>
        <p>Téléphone: ${agence.telephone}</p>
      </div>`;
    }

  }

  setupEditButtonListener(infoWindow: any, agence: Agence) {
    google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
      const editButton = document.getElementById(`edit-button-${agence.id}`);
      const disableButton = document.getElementById(`disable-button-${agence.id}`);
      if (editButton) {
        editButton.addEventListener('click', () => {
          infoWindow.close();
          this.editAgence(agence);
        });
      } if (disableButton) {
        disableButton.addEventListener('click', () => {
          infoWindow.close();
          this.disableAgence(agence);
        });
      }
    });
  }
  disableAgence(agence: Agence) {
    agence.status = !agence.status;
    this.agenceService.updateAgence(agence.id, agence).subscribe((data) => {
      this.clearMarkers()
      this.loadAgences();
      this.notificationService.showNotification("success", "Opération effectué avec succès .")
    },
      error => {
        console.error('Error :', error);
        this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
      });
  }

  editAgence(agence: Agence) {
    this.selectedAgence = agence;
    this.isEditForm = true;
  }

  onSubmitEdit() {
    if (this.selectedAgence) {
      this.agenceService.updateAgence(this.selectedAgence.id, this.selectedAgence).subscribe(() => {
        this.clearMarkers()
        this.loadAgences();
        this.notificationService.showNotification("success", "Opération effectué avec succès .")
      },
        error => {
          console.error('Error :', error);
          this.notificationService.showNotification("danger", "Une erreur se produite :<b>" + error.error.message + "</b>")
        });
      this.isEditForm = false;
    }
  }

  onSubmitAdd(newAgenceForm, agence) {


    this.agenceService.createAgence(agence).subscribe(() => {
      this.clearMarkers()
      this.loadAgences();
      newAgenceForm.reset()
    });

  }

  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }
}

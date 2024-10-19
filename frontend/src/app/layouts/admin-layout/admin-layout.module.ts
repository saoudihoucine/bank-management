import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatRippleModule} from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import { ClientsComponent } from 'app/clients-mangement/clients/clients.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComptesComponent } from 'app/comptes-mangement/comptes/comptes.component';
import { TransactionComponent } from 'app/transactions-mangement/transaction/transaction.component';
import { AgencesComponent } from 'app/agences-management/agences/agences.component';
import { UserComponent } from 'app/user-management/user/user.component';
import { CreditComponent } from 'app/credit-mangement/credit/credit.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatSliderModule} from '@angular/material/slider';
import { CeditDetailsComponent } from 'app/cedit-details/cedit-details.component';
import { ValidateCreditComponent } from 'app/validate-credit/validate-credit.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    NgbModule,
    MatProgressBarModule,
    MatSliderModule
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    ClientsComponent,
    ComptesComponent,
    UpgradeComponent,
    TransactionComponent,
    AgencesComponent,
    UserComponent,
    CreditComponent,
    CeditDetailsComponent,
    ValidateCreditComponent,

    

  ]
})

export class AdminLayoutModule {}

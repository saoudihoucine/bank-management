import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { ClientsComponent } from 'app/clients-mangement/clients/clients.component';
import { ComptesComponent } from 'app/comptes-mangement/comptes/comptes.component';
import { TransactionComponent } from 'app/transactions-mangement/transaction/transaction.component';
import { AgencesComponent } from 'app/agences-management/agences/agences.component';
import { AuthGuard } from 'app/guard/auth.guard';
import { UserComponent } from 'app/user-management/user/user.component';
import { CreditComponent } from 'app/credit-mangement/credit/credit.component';
import { CeditDetailsComponent } from 'app/cedit-details/cedit-details.component';
import { ValidateCreditComponent } from 'app/validate-credit/validate-credit.component';
import { WelcomingDashboardComponent } from 'app/welcoming-dashboard/welcoming-dashboard.component';


export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'user-profile', component: UserProfileComponent },
    { path: 'table-list', component: TableListComponent },
    { path: 'typography', component: TypographyComponent },
    { path: 'icons', component: IconsComponent },
    { path: 'maps', component: MapsComponent },
    { path: 'notifications', component: NotificationsComponent },
    { path: 'upgrade', component: UpgradeComponent },
    { path: 'clients', component: ClientsComponent  },
    { path: 'comptes/list/:clientId', component: ComptesComponent,canActivate: [AuthGuard] },
    { path: 'credit/list/:clientId', component: CreditComponent,canActivate: [AuthGuard] },
    { path: 'credit/simuler/:clientId', component: CreditComponent,canActivate: [AuthGuard] },
    { path: 'gestCredit/list', component: CreditComponent,canActivate: [AuthGuard] },
    { path: 'transaction/list/:rib', component: TransactionComponent ,canActivate: [AuthGuard] },
    { path: 'agences', component: AgencesComponent ,canActivate: [AuthGuard] },
    { path: 'users', component: UserComponent ,canActivate: [AuthGuard] },
    { path: 'credit/detail/:id', component: CeditDetailsComponent ,canActivate: [AuthGuard] },
    { path: 'credit/all/', component: ValidateCreditComponent ,canActivate: [AuthGuard] },
    { path: 'welcome/:clientId', component: WelcomingDashboardComponent ,canActivate: [AuthGuard] },
];

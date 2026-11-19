import { Routes } from '@angular/router';
import { Console } from './pages/console/console';

export const routes: Routes = [

    {path: '', redirectTo: '/console', pathMatch: 'full'},
    {
        path: 'console',
        component: Console,
    },
];

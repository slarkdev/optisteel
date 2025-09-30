import { Component } from '@angular/core';
import { ApiAuthService } from '../services/apiauth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent {
  showSidenav: boolean = false;
  selectedValue: string = '';

  proyectos: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  constructor(private apiAuthService: ApiAuthService,
    private router: Router
  ){

  }
  logout(){
    this.apiAuthService.logout();
    this.router.navigate(['login']);
  }
}

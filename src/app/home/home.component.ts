import { Component } from '@angular/core';
import { ApiAuthService } from '../services/apiauth.service';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent {
  showSidenav: boolean = false;
  selectedValue: string = '';

  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;

  constructor(
    private apiAuthService: ApiAuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.apiAuthService.initializeSession();
    this.breakpointObserver
      .observe(['(max-width: 849px)'])
      .subscribe((result) => {
        if (result.matches) {
          this.drawerMode = 'over';
          this.drawerOpened = false;
        } else {
          this.drawerMode = 'side';
          this.drawerOpened = true;
        }
      });
  }

  logout() {
    this.apiAuthService.logout();
    this.router.navigate(['login']);
  }
}

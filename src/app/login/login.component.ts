import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiAuthService } from '../services/apiauth.service';
import { Router } from '@angular/router';
import { Login } from '../models/login';
import { Error } from '../shared/error';
import { Auth } from '../models/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private form: FormBuilder,
    private apiAuthService: ApiAuthService,
    private router: Router
  ) {
    this.loginForm = this.form.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    console.log('login');
    if (this.loginForm.valid) {
      const user: Login = {
        username: this.loginForm.value.username ? this.loginForm.value.username : '',
        password: this.loginForm.value.password
          ? this.loginForm.value.password
          : '',
      };
      // llamar al servicio
      this.apiAuthService.login(user).subscribe({
        next: (response: Auth) => {      
          if (response) {
            this.router.navigate(['home']);
          } else {
            Error.showError(response);
          }
          //this.loading = false;
        },
        error: (response: any) => {
          //this.loading = false;
          Error.showError(response);
        },
      });
    }
  }
}

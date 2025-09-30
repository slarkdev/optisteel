import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiAuthService } from '../services/apiauth.service';
import { Router } from '@angular/router';
import { Login } from '../models/login';
import { Error } from '../shared/error';
import { Auth } from '../models/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false,
})
export class LoginComponent {
  enabledLogin: boolean = true;
  loginForm: FormGroup;
  hide = true;
  

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

  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
  }


  login(): void {
    if (this.loginForm.valid) {
      this.enabledLogin = false;
      const user: Login = {
        username: this.loginForm.value.username
          ? this.loginForm.value.username
          : '',
        password: this.loginForm.value.password
          ? this.loginForm.value.password
          : '',
      };
      // llamar al servicio
      this.apiAuthService.login(user).subscribe({
        next: (response: any) => {
          if (response) {            
           // this.enabledLogin = true;
            this.router.navigate(['home']);
            
          } else {
            Error.showError(response);
          }                   
          this.enabledLogin = true;
          //this.loading = false;
        },
        error: (response: any) => {
          //this.loading = false;
          Error.showError(response);
          this.enabledLogin = true;
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Complete todos los datos',
        showConfirmButton: true,
        confirmButtonColor: '#f8a166',
        timer: 3000,
      });
    }
  }
}

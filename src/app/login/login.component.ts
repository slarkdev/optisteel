import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiAuthService } from '../services/apiauth.service';
import { Router } from '@angular/router';
import { Login } from '../models/login';
import { Error } from '../shared/error';
import { Auth } from '../models/auth';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

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

  loginErrorMessage: string | null = null;

  constructor(
    private dialog: MatDialog,
    private form: FormBuilder,
    private apiAuthService: ApiAuthService,
    private router: Router
  ) {
    this.loginForm = this.form.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
  }

  login(): void {
    this.loginForm.get('username')?.markAllAsTouched();
    this.loginForm.get('password')?.markAllAsTouched();

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
          this.router.navigate(['home']);
          this.loginErrorMessage = null;
        },
        error: (response: any) => {
          const msg = Error.getMessage(response);

          // Mostrar inline si es 401 o 400
          if ([400, 401].includes(response.status)) {
            this.loginErrorMessage = msg;
          } else {
            Error.showError(response); // SweetAlert para errores graves
          }

          this.enabledLogin = true;
        },
      });
    }
  }

  forgetPassword(){
    console.log('ir a olvide mi contraseña')
    this.dialog.open(ForgetPasswordComponent, {
      width: '400px', 
      data: { email: '' }
    });
  }
}

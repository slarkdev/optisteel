import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Error {
  constructor(private sb: MatSnackBar) {}

  public static getMessage(response: any): string {
    switch (response.status) {
      case 400:
        return 'Solicitud inválida. Verifica los campos e intenta nuevamente.';
      case 401:
        return 'Usuario o contraseña incorrectos.';
      case 403:
        return 'Acceso denegado. No tienes permisos para ingresar.';
      case 404:
        return 'No se pudo conectar con el servidor. Intenta más tarde.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente más tarde.';
      default:
        return (
          response.error?.message ||
          'Ocurrió un error inesperado. Intenta nuevamente.'
        );
    }
  }

  public showErrorSnackBar(msj: any) {
    // const msj = Error.getMessage(response);

    this.sb.open(msj, 'Cerrar', { duration: 3000 });

    // Swal.fire({
    //   icon: 'error',
    //   title: 'Ups!',
    //   text: msj,
    //   confirmButtonColor: '#f8a166',
    //   timer: 3000,
    // });
  }
  public static showError(response: any) {
    const msj = this.getMessage(response);

    // sb.open(msj, 'Cerrar', { duration: 3000 });

    Swal.fire({
      icon: 'error',
      title: 'Ups!',
      text: msj,
      confirmButtonColor: '#f8a166',
      timer: 3000,
    });
  }
}

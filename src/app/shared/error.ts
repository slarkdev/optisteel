import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Error {
  constructor() {}

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

  public static showError(response: any) {
    const msj = this.getMessage(response);
    Swal.fire({
      icon: 'error',
      title: 'Ups!',
      text: msj,
      confirmButtonColor: '#f8a166',
      timer: 3000,
    });
  }
}

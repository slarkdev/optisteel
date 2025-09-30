import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Error {
  constructor() {}

  public static showError(response: any) {
    console.log(response);

    let titulo = 'Ups!';
    let msj = '';

    if (response.status !== 200) {
      titulo = response.statusText ? response.statusText : 'Ups!';
      msj = response.error.message;
    }

    Swal.fire({
      icon: 'error',
      title: titulo,
      text: msj,
      showConfirmButton: true,
      confirmButtonColor: '#f8a166',
      timer: 3000,
    });
  }
}

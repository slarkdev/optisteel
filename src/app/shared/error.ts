import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Error {
  constructor() {}

  public static showError(response: any) {
    let titulo = 'Ups!';
    let msj = '';
    
    if(response.exito === 0){
      titulo = 'Ups!';
      msj = response.mensaje; 
    } else if (response.error){
      titulo = response.error.title ? response.error.title : 'Ups!';
      msj = response.error.mensaje;
    }

    Swal.fire({
      icon: 'error',
      title: titulo ,
      text: msj,
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Form, FormBuilder, FormGroup, FormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
  standalone: false
})
export class ForgetPasswordComponent {

  form: FormGroup;
  @Inject(MAT_DIALOG_DATA) public data: any;
  constructor(
    private formBuilder: FormBuilder,    
    private dialogRef: MatDialogRef<ForgetPasswordComponent>,
  ) {

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  goToStep(id: any){
    console.log(id);
    
  }
  enviarEnlace(){
    console.log('enviar enlace');
    
  }
  closeDialog() {
    this.dialogRef.close();
  }
}

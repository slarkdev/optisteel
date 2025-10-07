import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-update-dialog',
  templateUrl: './update-dialog.component.html',
  styleUrl: './update-dialog.component.scss',
  standalone: false,
})
export class UpdateDialogComponent {
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA);

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UpdateDialogComponent>
  ) {
    this.form = this.fb.group({
      cantidad: [this.data?.cantidad || '', [Validators.min(0)]],
      longitud: [this.data?.longitud || '', [Validators.min(0)]],
    });
  }

  confirm(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}

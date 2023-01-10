import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './message-dialog.component.html'
})
export class MessageDialogComponent implements OnInit {

  type: string = 'error';
  title: string;
  message: string;
  buttonText: string;

  constructor(public dialogRef: MatDialogRef<MessageDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: MessageDialogModel) {
    if (data.type)
      this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.buttonText = data.buttonText;
  }

  ngOnInit() {
  }
}

export class MessageDialogModel {

  constructor(public type: string, public title: string, public message: string, public buttonText: string) {
  }
}

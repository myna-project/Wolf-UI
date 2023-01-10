import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToMeasures(): void {
    this.router.navigate(['measures']);
  }

  goToActivation(): void {
    this.router.navigate(['activation']);
  }

  goToConfigMenu(): void {
    this.router.navigate(['configmenu']);
  }
}

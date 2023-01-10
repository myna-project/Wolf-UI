import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './configmenu.component.html',
  styleUrls: ['./configmenu.component.scss']
})
export class ConfigMenuComponent implements OnInit {

  isLoading: boolean = true;
  hasThermostatApis: boolean = false;
  backRoute: string = 'dashboard';

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
	this.isLoading = false;
  }

  goToNetConfig(): void {
    this.router.navigate(['netconfig']);
  }

  goToWolfConfig(): void {
    this.router.navigate(['wolfconfig']);
  }

  goToCloudPlugins(): void {
    this.router.navigate(['cloud-plugin']);
  }

  goToFieldPlugins(): void {
    this.router.navigate(['field-plugin']);
  }

  goToRegisterMaps(): void {
    this.router.navigate(['regmaps-list']);
  }

  goBack(): void {
    this.location.back();
  }
}

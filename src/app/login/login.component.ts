import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isLoading: boolean = false;
  returnUrl: string;
  loginError: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthenticationService) {
    if (this.authService.getCurrentUser())
      this.router.navigate(['/dashboard']);
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'username': new FormControl('', [ Validators.required ]),
      'password': new FormControl('', [ Validators.required ])
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  login() {
    this.isLoading = true;
    this.authService.login(this.username.value, this.password.value).subscribe(
      (data: any) => {
        localStorage.setItem('currentUser', JSON.stringify({ 'username': this.username.value, 'isLogged': true, 'isAdmin': (data.headers.get('isAdmin') === 'true') ? true : false, 'authdata': btoa(this.username.value + ":" + this.password.value) }));
        this.router.navigate(['/dashboard']);
      },
      (_error: any) => {
        this.loginError = true;
        this.loginForm.reset();
        this.isLoading = false;
      }
    );
  }
}

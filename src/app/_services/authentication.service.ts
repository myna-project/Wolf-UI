import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { User } from '../_models/user';

import { HttpUtils } from '../_utils/http.utils';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient, private router: Router, private httpUtils: HttpUtils) {}

  public getCurrentUser(): User {
    let currentUser = <User>JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser === null || currentUser === undefined) {
      return null;
    } else {
      if (currentUser.isLogged)
        return currentUser;
    }
    return null;
  }

  login(username: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post(this.httpUtils.getWolfAPIUrl() + 'authenticate', null, { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(username + ":" + password) }, observe: 'response' });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}

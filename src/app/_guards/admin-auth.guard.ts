import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    let currentUser = this.authService.getCurrentUser();
    if (currentUser === null) {
      this.router.navigate(['/login']);
      return false;
    }
    if (!currentUser.isAdmin) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}

import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatSidenavContent } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { TranslateService } from '@ngx-translate/core';

import { User } from './_models/user';

import { AuthenticationService } from './_services/authentication.service';

import { HttpUtils } from './_utils/http.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('snav', { static : false }) snav: any;
  @ViewChild('content') content: MatSidenavContent;

  isReturnToTopShow: boolean;
  isLoading: boolean = false;
  topPosToStartShowing: number = 100;
  style: string = 'purple';
  mobileQuery: MediaQueryList;
  opened: boolean;
  searchOpened: boolean = false;
  langName: {[key: string]: string} = { en: 'English', it: 'Italiano' };
  selectedLang: string;
  currentUser: User = new User();
  user_avatar: any;

  @HostListener('window:scroll')
  checkScroll() {
    this.isReturnToTopShow = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) >= this.topPosToStartShowing ? true : false;
  }

  private _mobileQueryListener: () => void;

  constructor(private dateAdapter: DateAdapter<any>, private ngxMatDateAdapter: NgxMatDateAdapter<any>, private router: Router, private authService: AuthenticationService, private changeDetectorRef: ChangeDetectorRef, private media: MediaMatcher, private sanitizer: DomSanitizer, private httpUtils: HttpUtils, public translate: TranslateService) {
    this.translate.addLangs(['en', 'it']);
    const browserLang = this.translate.getBrowserLang();
    this.selectedLang = browserLang.match(/en|it/) ? browserLang : 'en';
    this.translate.use(this.selectedLang);
    this.dateAdapter.setLocale(this.selectedLang);
    this.ngxMatDateAdapter.setLocale(this.selectedLang);
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser === null) {
      this.router.navigate(['/login']);
      return;
    }

    this.changeLanguage(this.currentUser.lang ? this.currentUser.lang : (this.translate.getBrowserLang().match(/en|it/) ? this.translate.getBrowserLang() : 'en'));
  }

  ngOnDestroy() {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  closeSideNav() {
    if (this.snav._mode === 'over' || this.snav._mode === 'push')
      this.snav.close();
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.selectedLang = lang;
    this.currentUser.lang = lang;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    this.dateAdapter.setLocale(lang);
    this.ngxMatDateAdapter.setLocale(lang);
  }

  changeAvatar(avatar: string) {
    this.user_avatar = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + avatar);
    this.currentUser.avatar = avatar;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  changeStyle(newStyle: string) {
    this.style = newStyle;
    this.currentUser.style = newStyle;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  scrollToTop() {
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  logout() {
    const dialogRef = this.httpUtils.confirmDelete(this.translate.instant('LOGIN.CONFIRMLOGOUT'));
    dialogRef.afterClosed().subscribe((dialogResult: any) => {
      if (dialogResult) {
        this.snav.close();
        this.searchOpened = false;
        this.authService.logout();
        this.currentUser = this.authService.getCurrentUser();
        const browserLang = this.translate.getBrowserLang();
        this.selectedLang = browserLang.match(/en|it/) ? browserLang : 'en';
        this.translate.use(this.selectedLang);
        this.router.navigate(['/login']);
      }
    });
  }

  onActivate(_event: any) {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser === null) {
      this.router.navigate(['/login']);
      return;
    }

    this.style = this.currentUser.style;
    if (this.currentUser.lang) {
      this.selectedLang = this.currentUser.lang;
      this.translate.use(this.selectedLang);
      this.dateAdapter.setLocale(this.selectedLang);
      this.ngxMatDateAdapter.setLocale(this.selectedLang);
    }
    this.user_avatar = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + this.currentUser.avatar);
    window.scrollTo(0, 0);
  }
}

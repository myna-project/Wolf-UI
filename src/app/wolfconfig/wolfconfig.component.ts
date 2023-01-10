import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Wolf, WolfConfig } from '../_models/wolfConfig';

import { SectionsService } from '../_services/sections.service';

import { HttpUtils } from '../_utils/http.utils';

@Component({
  templateUrl: './wolfconfig.component.html',
  styleUrls: ['./wolfconfig.component.scss']
})
export class WolfConfigComponent implements OnInit {

  isLoading: boolean = true;
  isSaving: boolean = false
  wolfForm: FormGroup;
  group: any = {};
  wolf: Wolf = new Wolf();
  backRoute: string = 'configmenu';

  constructor(private sectionsService: SectionsService, private router: Router, private location: Location, private httpUtils: HttpUtils, private translate: TranslateService) {}

  ngOnInit(): void {
    this.createForm();
    this.sectionsService.getSection('wolf').subscribe(
      (wolf: any) => {
        if (wolf) {
          this.wolf = wolf;
          this.createForm();
        }
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading =  false;
        const dialogRef = this.httpUtils.errorDialog(error);
        dialogRef.afterClosed().subscribe((_value: any) => {
          this.router.navigate([this.backRoute]);
        });
      }
    );
  }

  get loglevel() { return this.wolfForm.get('loglevel'); }
  get interval() { return this.wolfForm.get('interval'); }
  get clientid() { return this.wolfForm.get('clientId'); }
  get descr() { return this.wolfForm.get('description'); }
  get webaddr() { return this.wolfForm.get('webaddress'); }
  get webport() { return this.wolfForm.get('webport'); }
  get webroot() { return this.wolfForm.get('webroot'); }

  createForm(): void {
    let patterns = this.httpUtils.getPatterns();
    this.group['loglevel'] = new FormControl(this.wolf.loglevel, [ Validators.required ]);
    this.group['interval'] = new FormControl(this.wolf.interval, [ Validators.required, Validators.pattern(patterns.positiveFloat) ]);
    this.group['clientId'] = new FormControl(this.wolf.clientid, [ Validators.pattern(patterns.positiveInteger) ]);
    this.group['description'] = new FormControl(this.wolf.description);
    this.group['webaddress'] = new FormControl({ value: this.wolf.webaddr, disabled: true });
    this.group['webport'] = new FormControl({ value: this.wolf.webport, disabled: true });
    this.group['webroot'] = new FormControl({ value: this.wolf.webroot, disabled: true });
    this.wolfForm = new FormGroup(this.group);
  }

  updateConfig(): void {
    this.isSaving = true;
    const wolf = new Wolf();
    wolf.loglevel = this.loglevel.value;
    wolf.interval = this.interval.value;
    wolf.clientid = this.clientid.value;
    wolf.description = this.descr.value;
    wolf.webaddr = this.webaddr.value;
    wolf.webport = this.webport.value;
    wolf.webroot = this.webroot.value;
    wolf.cors = this.wolf.cors;
    wolf.username = this.wolf.username;
    wolf.password = this.wolf.password;

    this.sectionsService.putSection('wolf', wolf).subscribe(
      (_response: WolfConfig) => {
        this.isSaving = false;
        this.httpUtils.successSnackbar(this.translate.instant('WOLFCONFIG.SAVED'));
      },
      (error: any) => {
        this.isSaving = false;
        this.httpUtils.errorDialog(error);
      }
    );
  }

  goBack(): void {
    this.location.back();
  }
}

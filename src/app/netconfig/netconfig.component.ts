import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { AccessPoint, Connection, Interface } from '../_models/network';

import { NetConfigService } from '../_services/netconfig.service';

import { HttpUtils } from '../_utils/http.utils';

@Component({
  templateUrl: './netconfig.component.html',
  styleUrls: ['./netconfig.component.scss']
})
export class NetConfigComponent implements OnInit {

  isSaving: boolean = false;
  isLoading: boolean = true;
  isLoadingConnection: boolean = false;
  ipVersions: number[] = [4,6];
  interfaces: Interface[];
  connection: Connection;
  accessPoints: AccessPoint[];
  iface: string;
  group: any = {};
  netForm: FormGroup;
  backRoute: string = 'configmenu';

  constructor(private netConfigService: NetConfigService, private router: Router, private location: Location, private httpUtils: HttpUtils, private translate: TranslateService) {}

  ngOnInit(): void {
    this.createForm();
    forkJoin(this.netConfigService.getInterfaces(), this.netConfigService.getAccessPoints()).subscribe(
      (results: any[]) => {
        this.interfaces = results[0];
        this.accessPoints = results[1];
        this.createForm();
        this.isLoading = false;
      },
      (error: any) => {
        const dialogRef = this.httpUtils.errorDialog(error);
        dialogRef.afterClosed().subscribe((_value: any) => {
          this.router.navigate([this.backRoute]);
        });
      }
    );
  }

  get interface() { return this.netForm.get('interface'); }
  get ssid() { return this.netForm.get('ssid'); }
  get psk() { return this.netForm.get('psk'); }

  createForm(): void {
    this.netForm = new FormGroup(this.group);
    this.group['interface'] = new FormControl(this.iface ? this.interfaces.find((i: Interface) => i.interface === this.iface) : undefined, [ Validators.required ]);
    this.group['ssid'] = new FormControl((this.connection && this.connection.connection && (this.connection.connection.type === '802-11-wireless') && this.connection['802-11-wireless']) ? this.connection['802-11-wireless']['ssid'] : undefined);
    this.group['psk'] = new FormControl((this.connection && this.connection.connection && (this.connection.connection.type === '802-11-wireless') && this.connection['802-11-wireless-security']) ? this.connection['802-11-wireless-security']['psk'] : undefined);
    if (this.connection) {
      this.ipVersions.forEach((version: number) => {
        this.createIPForm(version);
      });
    }
    this.netForm.get('interface').valueChanges.subscribe((iface: Interface) => {
      this.iface = iface.interface;
      this.loadConnection(this.iface);
    });
  }

  createIPForm(version: number): void {
    let patterns = this.httpUtils.getPatterns();
    this.group['ipv' + version + '_method'] = new FormControl((this.connection && this.connection['ipv' + version]) ? this.connection['ipv' + version]['method'] : undefined, [ Validators.required ]);
    this.group['ipv' + version + '_address'] = new FormControl((this.connection && this.connection['ipv' + version]) ? ((this.connection['ipv' + version]['address-data'] && this.connection['ipv' + version]['address-data'][0]) ? this.connection['ipv' + version]['address-data'][0]['address'] : (this.connection['ipv' + version]['addresses'][0] ? this.connection['ipv' + version]['addresses'][0][0] : undefined)) : undefined, [ Validators.pattern(patterns['ipv' + version]) ]);
    this.group['ipv' + version + '_prefix'] = new FormControl((this.connection && this.connection['ipv' + version]) ? ((this.connection['ipv' + version]['address-data'] && this.connection['ipv' + version]['address-data'][0]) ? this.connection['ipv' + version]['address-data'][0]['prefix'] : (this.connection['ipv' + version]['addresses'][0] ? this.connection['ipv' + version]['addresses'][0][1] : undefined)) : undefined, [ Validators.pattern(patterns.positiveInteger) ]);
    this.group['ipv' + version + '_gateway'] = new FormControl((this.connection && this.connection['ipv' + version]) ? (this.connection['ipv' + version]['gateway'] ? this.connection['ipv' + version]['gateway'] : (this.connection['ipv' + version]['addresses'][0] ? this.connection['ipv' + version]['addresses'][0][2] : undefined)) : undefined, [ Validators.pattern(patterns['ipv' + version]) ]);
    if (this.connection && this.connection['ipv' + version] && this.connection['ipv' + version]['dns'] && (this.connection['ipv' + version]['dns'].length > 0)) {
      let i: number = 0;
      this.connection['ipv' + version]['dns'].forEach((_dns: string) => {
        this.createDNSForm(version, i);
        i++;
      });
    } else {
      this.createDNSForm(version, 0);
      if (!this.connection['ipv' + version])
        this.connection['ipv' + version] = {};
      this.connection['ipv' + version]['dns'] = [''];
    }
    this.setValidators(version);
    this.netForm.get('ipv' + version + '_method').valueChanges.subscribe((_method: string) => {
      this.setValidators(version);
    });
  }

  createDNSForm(version: number, i: number): void {
    let patterns = this.httpUtils.getPatterns();
    this.group['ipv' + version + '_dns_' + i] = new FormControl((this.connection && this.connection['ipv' + version] && this.connection['ipv' + version]['dns'] && this.connection['ipv' + version]['dns'][i]) ? this.connection['ipv' + version]['dns'][i] : undefined, [ Validators.pattern(patterns['ipv' + version]) ]);
  }

  setValidators(version: number): void {
    if (this.netForm.get('ipv' + version + '_method').value === 'manual') {
      this.group['ipv' + version + '_address'].addValidators(Validators.required);
      this.group['ipv' + version + '_address'].updateValueAndValidity();
      this.group['ipv' + version + '_prefix'].addValidators(Validators.required);
      this.group['ipv' + version + '_prefix'].updateValueAndValidity();
      this.group['ipv' + version + '_gateway'].addValidators(Validators.required);
      this.group['ipv' + version + '_gateway'].updateValueAndValidity();
    } else {
      this.group['ipv' + version + '_address'].removeValidators(Validators.required);
      this.group['ipv' + version + '_address'].updateValueAndValidity();
      this.group['ipv' + version + '_prefix'].removeValidators(Validators.required);
      this.group['ipv' + version + '_prefix'].updateValueAndValidity();
      this.group['ipv' + version + '_gateway'].removeValidators(Validators.required);
      this.group['ipv' + version + '_gateway'].updateValueAndValidity();
    }
    if (this.connection && this.connection['ipv' + version] && this.connection['ipv' + version]['dns'] && (this.connection['ipv' + version]['dns'].length > 0)) {
      let i: number = 0;
      this.connection['ipv' + version]['dns'].forEach((_dns: string) => {
        if (this.connection && this.connection.connection && (this.connection.connection.type != 'bridge') && (this.connection.connection.type != 'tun')) {
          if (this.netForm.get('ipv' + version + '_method').value === 'manual') {
            this.group['ipv' + version + '_dns_' + i].addValidators(Validators.required);
            this.group['ipv' + version + '_dns_' + i].updateValueAndValidity();
          } else {
            this.group['ipv' + version + '_dns_' + i].removeValidators(Validators.required);
            this.group['ipv' + version + '_dns_' + i].updateValueAndValidity();
          }
        }
        i++;
      });
    }
    this.netForm.updateValueAndValidity();
  }

  compareInterfaces(i1: Interface, i2: Interface): boolean {
    return (i2 != null) && (i1.interface === i2.interface);
  }

  compareAccessPoints(a1: AccessPoint, a2: AccessPoint): boolean {
    return (a2 != null) && (a1.ssid === a2.ssid);
  }

  addDNS(version: number): void {
    this.createDNSForm(version, this.connection['ipv' + version]['dns'].length);
    this.connection['ipv' + version]['dns'].push('');
    this.netForm.updateValueAndValidity();
  }

  removeDNS(version: number): void {
    this.netForm.removeControl('ipv' + version + '_dns_' + (this.connection['ipv' + version]['dns'].length - 1).toString());
    this.connection['ipv' + version]['dns'].pop();
    this.netForm.updateValueAndValidity();
  }

  loadConnection(iface: string): void {
    this.isLoadingConnection = true;
    this.netConfigService.getConnection(iface).subscribe(
      (connection: Connection) => {
        this.connection = connection;
        this.group = {};
        this.createForm();
        if (this.connection && this.connection.connection && (this.connection.connection.type === '802-11-wireless')) {
          this.group['ssid'].addValidators(Validators.required);
          this.group['psk'].addValidators(Validators.required);
        } else {
          this.group['ssid'].removeValidators(Validators.required);
          this.group['ssid'].updateValueAndValidity();
          this.group['psk'].removeValidators(Validators.required);
          this.group['psk'].updateValueAndValidity();
        }
        this.netForm.updateValueAndValidity();
        this.isLoadingConnection = false;
      },
      (error: any) => {
        this.httpUtils.errorDialog(error);
        this.isLoadingConnection = false;
      }
    );
  }

  save(): void {
    this.isSaving = true;
    if (this.connection && this.connection.connection && (this.connection.connection.type === '802-11-wireless')) {
      this.connection['802-11-wireless']['ssid'] = this.ssid.value;
      this.connection['802-11-wireless-security']['psk'] = this.psk.value;
    }
    this.ipVersions.forEach((version: number) => {
      this.connection['ipv' + version]['method'] = this.netForm.get('ipv' + version + '_method').value;
      if (this.connection['ipv' + version]['method'] === 'manual') {
        this.connection['ipv' + version]['address-data']['address'] = this.netForm.get('ipv' + version + '_address').value;
        this.connection['ipv' + version]['address-data']['prefix'] = this.netForm.get('ipv' + version + '_prefix').value;
        this.connection['ipv' + version]['gateway'] = this.netForm.get('ipv' + version + '_gateway').value;
        this.connection['ipv' + version]['addresses'][0] = this.netForm.get('ipv' + version + '_address').value;
        this.connection['ipv' + version]['addresses'][1] = this.netForm.get('ipv' + version + '_prefix').value;
        this.connection['ipv' + version]['addresses'][2] = this.netForm.get('ipv' + version + '_gateway').value;
        for (let i = 0; i < this.connection['ipv' + version]['dns'].length; i++)
          this.connection['ipv' + version]['dns'][i] = this.netForm.get('ipv' + version + '_dns_' + i).value
      }
    });
    if (!this.connection.connection.uuid) {
      this.netConfigService.createConnection(this.iface, this.connection).subscribe(
        (_response: Connection) => {
          this.isSaving = false;
          this.httpUtils.successSnackbar(this.translate.instant('NETCONFIG.SAVED'));
        },
        (error: any) => {
          this.httpUtils.errorDialog(error);
          this.isSaving = false;
        }
      );
    } else {
      this.netConfigService.updateConnection(this.iface, this.connection.connection.uuid, this.connection).subscribe(
        (_response: Connection) => {
          this.isSaving = false;
          this.httpUtils.successSnackbar(this.translate.instant('NETCONFIG.SAVED'));
        },
        (error: any) => {
          this.httpUtils.errorDialog(error);
          this.isSaving = false;
        }
      );
    }
  }

  goBack(): void {
    this.location.back();
  }
}

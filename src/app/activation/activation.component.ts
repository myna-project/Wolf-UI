import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import * as moment from 'moment';

import { Client } from '../_models/client';
import { Device } from '../_models/device';
import { Drain } from '../_models/drain';
import { ElementDB } from '../_models/elementDB';

import { MeasuresService } from '../_services/measures.service';

import { HttpUtils } from '../_utils/http.utils';

@Component({
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss']
})
export class ActivationComponent implements OnInit {

  isLoadingDevices: boolean = false;
  isLoadingDrains: boolean = false;
  isSaving: boolean = false;
  clients: Client[];
  devices: Device[] = [];
  drains: Drain[] = [];
  elementDBS: ElementDB[] = [];
  group: any = {};
  formGroup: FormGroup;
  deviceDrains: any[] = [];

  constructor(private measureService: MeasuresService, private location: Location, private httpUtils: HttpUtils, private translate: TranslateService) {}

  ngOnInit(): void {
    this.isLoadingDevices = true;
    this.isLoadingDrains = true;
    let nameForm = [];
    this.measureService.getClients().subscribe(
      (clients: Client[]) => {
        this.clients = clients;
        if (this.clients && this.clients.length > 0) {
          this.clients.forEach(client => {
            this.measureService.getDevices(client.client_id).subscribe(
              (devices: Device[]) => {
                this.devices = devices;
                this.devices.sort((a, b) => a.device_descr < b.device_descr ? -1 : (a.device_descr > b.device_descr) ? 1 : 0);
                devices.forEach((device: Device) => {
                  this.measureService.getDrains(client.client_id, device.device_id).subscribe(
                    (drains: ElementDB[]) => {
                      this.isLoadingDrains = true;
                      drains.sort((a, b) => a.measure_descr < b.measure_descr ? -1 : (a.measure_descr > b.measure_descr) ? 1 : 0);
                      if (drains) {
                        this.measureService.getLastMeasures(client.client_id.toString(), device.device_id).subscribe(
                          (value: any) => {
                            let missings: any[] = [];
                            let measures_ids: string[] = [];
                            let i = 0;
                            drains.forEach((drain: ElementDB) => {
                              let found: boolean = false;
                              if (value.measures && value.measures.length > 0) {
                                let measure: any = value.measures.find((m: any) => m.measure_id === drain.measure_id);
                                if (measure) {
                                  if ((drain.measure_type !== "c") && (drain.read_write === false)) {
                                    drain.last_measure = { value: measure.value, time: new Date(value.ts * 1000).toLocaleString(), measure_type: undefined, read_write: false };
                                  } else {
                                    drain.last_measure = { value: measure.value, time: undefined, measure_type: "c", read_write: true };
                                    this.group[device.device_id + '_' + drain.measure_id] = new FormControl(measure.value);
                                    nameForm.push({ device_id: device.device_id, measure_id: drain.measure_id, client_id: client.client_id });
                                  }
                                  found = true;
                                }
                              }
                              if (found) {
                                i++;
                                if (i == drains.length) {
                                  this.deviceDrains.push({ device: device, drains: drains });
                                  this.isLoadingDrains = this.deviceDrains.length !== this.devices.length;
                                  if (!this.isLoadingDrains) {
                                    this.formGroup = new FormGroup(this.group);
                                    nameForm.forEach(name => {
                                      this.formGroup.get(name.device_id + '_' + name.measure_id).valueChanges.subscribe((b: boolean) => {
                                        this.onOff(name.client_id, name.device_id, name.measure_id, b);
                                      });
                                    });
                                  }
                                }
                              } else {
                                missings.push(this.measureService.getMeasures(drain.client_id, drain.device_id, this.httpUtils.getDateTimeForUrl(new Date(moment().add(-1, 'hour').toISOString())), this.httpUtils.getDateTimeForUrl(new Date(moment().toISOString())), drain.measure_id));
                                measures_ids.push(drain.measure_id);
                              }
                            });
                            if (missings.length > 0) {
                              forkJoin(missings).subscribe(
                                (results: any[]) => {
                                  let i = 0;
                                  results.forEach((result: any) => {
                                    if (result.values) {
                                      let drain = drains.find(d => ((d.measure_id === measures_ids[i]) && (d.device_id === device.device_id)));
                                      if (drain) {
                                        if ((drain.measure_type !== "c") && (drain.read_write === false)) {
                                          drain.last_measure = { value: result.values[result.values.length - 1][1], time: new Date(result.values[result.values.length - 1][0]).toLocaleString(), measure_type: undefined, read_write: false };
                                        } else {
                                          drain.last_measure = { value: (result.values[result.values.length - 1][1] === 0) ? false : true, time: undefined, measure_type: "c", read_write: true };
                                          this.group[device.device_id + '_' + drain.measure_id] = new FormControl((result.values[result.values.length - 1][1] === 0) ? false : true);
                                          nameForm.push({ device_id: device.device_id, measure_id: drain.measure_id, client_id: client.client_id });
                                        }
                                      }
                                    }
                                    i++;
                                  });
                                  this.deviceDrains.push({ device: device, drains: drains });
                                  this.isLoadingDrains = this.deviceDrains.length !== this.devices.length;
                                  if (!this.isLoadingDrains) {
                                    this.formGroup = new FormGroup(this.group);
                                    nameForm.forEach(name => {
                                      this.formGroup.get(name.device_id + '_' + name.measure_id).valueChanges.subscribe((b: boolean) => {
                                        this.onOff(name.client_id, name.device_id, name.measure_id, b);
                                      });
                                    });
                                  }
                                },
                                (error: any) => {
                                  this.isLoadingDevices = false;
                                  this.isLoadingDrains = false;
                                  this.httpUtils.errorDialog(error);
                                }
                              );
                            }
                          },
                          (error: any) => {
                            this.isLoadingDevices = false;
                            this.isLoadingDrains = false;
                            this.httpUtils.errorDialog(error);
                          }
                        );
                      }
                    },
                    (error: any) => {
                      this.isLoadingDevices = false;
                      this.isLoadingDrains = false;
                      this.httpUtils.errorDialog(error);
                    }
                  );
                });
                this.isLoadingDevices = false;
              },
              (error: any) => {
                this.isLoadingDevices = false;
                this.isLoadingDrains = false;
                this.httpUtils.errorDialog(error);
              }
            );
          });
        }
      },
      (error: any) => {
        this.isLoadingDevices = false;
        this.isLoadingDrains = false;
        this.httpUtils.errorDialog(error);
      }
    );
  }

  onOff(client_id: string, device_id: string, measure_id: string, on: boolean): void {
    this.isSaving = true;
    this.measureService.putMeasure(client_id, device_id, measure_id, { 'value': on }).subscribe(
      (_response: any) => {
        this.httpUtils.successSnackbar(this.translate.instant('ACTIVATION.SAVED'));
        this.isSaving = false;
      },
      (error: any) => {
        this.httpUtils.errorDialog(error);
        this.isSaving = false;
      }
    )
  }

  goBack(): void {
    this.location.back();
  }
}

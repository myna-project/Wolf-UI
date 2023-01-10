import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import * as moment from 'moment';

import { Client } from '../_models/client';
import { Device } from '../_models/device';
import { Drain } from '../_models/drain';
import { ElementDB } from '../_models/elementDB';
import { Measures } from '../_models/measures';
import { Measure } from '../_models/measure';

import { MeasuresService } from '../_services/measures.service';
import { SectionsService } from '../_services/sections.service';

import { TimeChart } from '../_utils/chart/time-chart';
import { DrainsTreeDialogComponent } from '../_utils/drains-tree-dialog/drains-tree-dialog.component';
import { HttpUtils } from '../_utils/http.utils';

@Component({
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit {

  isLoading: boolean = true;
  measuresLoaded: boolean = false;
  isLoadingMeasures: boolean = false;
  isLastMeasure: boolean = false;
  chartOptions: boolean = false;
  device: Device = new Device();
  drain: Drain = new Drain();
  clients: Client[];
  elementDBS: ElementDB[] = [];
  devices: Device[] = [];
  drains: Drain[] = [];
  measures: any[] = [];
  lastMeasures: any[] = [];
  sections: string[] = [];
  selectedDrains: any[] = [];
  timeAggregations: any[] = [];
  typeAggregations: any[] = [];
  measuresFilling: any[] = [];
  measuresForm: FormGroup;
  group: any = {};
  chartAggregations: any[] = [{ id: 'None', description: 'NONE' }, { id: 'average', description: 'AVG' }, { id: 'high', description: 'MAX' }, { id: 'low', description: 'MIN' }];
  splineChart: boolean = true;
  chartSeries: any[] = [];
  chartLabels: any[] = [];
  chartTypes: any[] = [];
  chart: any;
  csvData: any[] = [];
  isInfluxDB: boolean;
  deviceDrains: any[] = [];
  backRoute: string = 'dashboard';
  displayedColumns: string[] = ['device_name', 'drain_name', 'value', 'time'];

  constructor(private measureService: MeasuresService, private sectionsService: SectionsService, private dialog: MatDialog, private httpUtils: HttpUtils, private timeChart: TimeChart, private translate: TranslateService, private router: Router) {}

  ngOnInit(): void {
    this.createMeasureForm();
    this.translate.get('CHART.SPLINE').subscribe((spline: string) => {
      this.chartTypes.push({ id: 'spline', description: spline, visible: true });
      this.translate.get('CHART.HISTOGRAM').subscribe((histogram: string) => {
        this.chartTypes.push({ id: 'column', description: histogram, visible: true });
      });
    });
    this.translate.get('FILLMEASURES.NONE').subscribe((none: string) => {
      this.measuresFilling.push({ id: 'none', description: none, visible: true });
      this.translate.get('FILLMEASURES.NULL').subscribe((fillNull: string) => {
        this.measuresFilling.push({ id: 'null', description: fillNull, visible: true });
        this.translate.get('FILLMEASURES.LINEAR').subscribe((linear: string) => {
          this.measuresFilling.push({ id: 'linear', description: linear, visible: true });
          this.translate.get('FILLMEASURES.PREVIOUS').subscribe((previous: string) => {
            this.measuresFilling.push({ id: 'previous', description: previous, visible: true });
          });
        });
      });
    });
    this.translate.get('TIME.MINUTE').subscribe((minute: string) => {
      this.timeAggregations.push({ id: 'MINUTE', description: minute, order: 1 });
      this.translate.get('TIME.QHOUR').subscribe((qhour: string) => {
        this.timeAggregations.push({ id: 'QHOUR', description: qhour, order: 2 });
        this.translate.get('TIME.HOUR').subscribe((hour: string) => {
          this.timeAggregations.push({ id: 'HOUR', description: hour, order: 3 });
          this.translate.get('TIME.DAY').subscribe((day: string) => {
            this.timeAggregations.push({ id: 'DAY', description: day, order: 4 });
            this.translate.get('TIME.WEEK').subscribe((week: string) => {
              this.timeAggregations.push({ id: 'WEEK', description: week, order: 5 });
              this.translate.get('TIME.MONTH').subscribe((month: string) => {
                this.timeAggregations.push({ id: 'MONTH', description: month, order: 6 });
                this.translate.get('TIME.YEAR').subscribe((year: string) => {
                  this.timeAggregations.push({ id: 'YEAR', description: year, order: 7 });
                });
              });
            });
          });
        });
      });
    });
    forkJoin(this.measureService.getClients(), this.measureService.getAggregationTypes(), this.sectionsService.getSections()).subscribe(
      (results: any) => {
        this.clients = results[0];
        this.typeAggregations = results[1];
        this.sections = results[2];
        this.isInfluxDB = this.sections.includes('influxdb');
        if (this.clients && this.clients.length > 0) {
          let i: number = 0;
          this.clients.forEach(client => {
            i++;
            this.measureService.getDevices(client.client_id).subscribe(
              (devices: Device[]) => {
                devices.forEach((device: Device) => {
                  this.devices.push(device);
                  this.measureService.getDrains(client.client_id, device.device_id).subscribe(
                    (drains: ElementDB[]) => {
                      drains.forEach((drain: ElementDB) => {
                        const drainToAdd = new Drain();
                        this.elementDBS.push(drain);
                        drainToAdd.name = drain.measure_descr;
                        drainToAdd.measure_id = drain.measure_id;
                        drainToAdd.unit_of_measure = drain.measure_unit;
                        drainToAdd.device_id = drain.device_id;
                        drainToAdd.measure_type = drain.measure_type;
                        drainToAdd.read_write = drain.read_write;
                        this.drains.push(drainToAdd);
                      });
                      if (i === this.clients.length) {
                        this.devices.sort((a, b) => a.device_descr < b.device_descr ? -1 : (a.device_descr > b.device_descr) ? 1 : 0);
                        this.drains.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name) ? 1 : 0);
                        this.isLoading = false;
                      }
                    },
                    (error: any) => {
                      const dialogRef = this.httpUtils.errorDialog(error);
                      dialogRef.afterClosed().subscribe((_value: any) => {
                        this.router.navigate([this.backRoute]);
                      });
                    }
                  );
                });
              },
              (error: any) => {
                const dialogRef = this.httpUtils.errorDialog(error);
                dialogRef.afterClosed().subscribe((_value: any) => {
                  this.router.navigate([this.backRoute]);
                });
              }
            );
          });
        }
      },
      (error: any) => {
        const dialogRef = this.httpUtils.errorDialog(error);
        dialogRef.afterClosed().subscribe((_value: any) => {
          this.router.navigate([this.backRoute]);
        });
      }
    );
  }

  createMeasureForm() {
    this.group.startTime = new FormControl(new Date(moment().add(-1, 'hour').toISOString()), [ Validators.required ]);
    this.group.endTime = new FormControl(new Date(moment().toISOString()), [ Validators.required ]);
    this.group.timeAggregation = new FormControl('MINUTE', [ Validators.required ]);
    this.group.chartType = new FormControl('spline', [ Validators.required ]);
    this.group.showMarkers = new FormControl(false, []);
    this.group.chartAggregation = new FormControl('average', [ Validators.required ]);
    this.measuresForm = new FormGroup(this.group);
    this.measuresForm.get('chartType').valueChanges.subscribe((t: string) => {
      this.splineChart = (t === 'spline') ? true : false;
      this.drawChart();
    });
    this.measuresForm.get('showMarkers').valueChanges.subscribe((_s: boolean) => {
      this.drawChart();
    });
  }

  setLastHour(): void {
    this.measuresForm.patchValue({ startTime: new Date(moment().add(-1, 'hour').toISOString()), endTime: new Date(moment().toISOString()) });
  }

  setLastDay(): void {
    this.measuresForm.patchValue({ startTime: new Date(moment().add(-1, 'day').toISOString()), endTime: new Date(moment().toISOString()) });
  }

  setLastWeek(): void {
    this.measuresForm.patchValue({ startTime: new Date(moment().add(-7, 'day').toISOString()), endTime: new Date(moment().toISOString()) });
  }

  setLastMonth(): void {
    this.measuresForm.patchValue({ startTime: new Date(moment().add(-1, 'month').toISOString()), endTime: new Date(moment().toISOString()) });
  }

  addDrains(): void {
    const dialogRef = this.dialog.open(DrainsTreeDialogComponent, { width: '75%', data: { drains: this.drains, devices: this.devices } });
    dialogRef.afterClosed().subscribe((result: any[]) => {
      if (result) {
        this.lastMeasures = [];
        let component = this;
        result.forEach(function (selected: any) {
          let drain = component.drains.find((d: Drain) => (d.measure_id === selected.measure_id && d.device_id === selected.device_id));
          component.createDrainControls(component.selectedDrains.length, undefined, undefined);
          component.selectedDrains.push({ id: drain.measure_id, visible: true, full_name: selected.full_name, aggregations: 'AVG', fill: 'none', device_id: drain.device_id, client_id: selected.client_id, unit_of_measure: drain.unit_of_measure, measure_type: drain.measure_type, read_write: drain.read_write});
        });
      }
    });
  }

  selectClientLastMeasures(): void {
    let component = this;
    const dialogRef = this.dialog.open(DrainsTreeDialogComponent, { width: '75%', data: { devices: component.devices, lastMeasures: true } });
    dialogRef.afterClosed().subscribe((result: any[]) => {
      if (result && result.length != 0) {
        this.lastMeasures = [];
        this.deviceDrains = [];
        this.isLoadingMeasures = true;
        this.measuresLoaded = false;
        this.measureService.getLastMeasures(result[0].client_id, result[0].id).subscribe(
          (value: any) => {
            let i = 0;
            let drains: any[] = this.elementDBS.filter((d:ElementDB) => d.device_id === result[0].id);
            drains.forEach((drain: ElementDB) => {
              if (value.measures && value.measures.length > 0) {
                let measure: any = value.measures.find((m: any) => m.measure_id === drain.measure_id);
                if (measure)
                  drain.last_measure = { value: measure.value, time: new Date(value.ts * 1000).toLocaleString() };
              }
              i++;
              if (i == drains.length) {
                this.deviceDrains.push({ device: result[0], drains: drains });
                this.isLoadingMeasures = false;
              }
            });
          },
          (error: any) => {
            this.isLoadingMeasures = false;
            this.httpUtils.errorDialog(error);
          }
        );
      }
    });
  }

  createDrainControls(i: number, aggregation: string, fill: string): void {
    this.group['aggregation_' + i] = new FormControl( aggregation ? aggregation : 'AVG', [Validators.required]);
    this.measuresForm.get('aggregation_' + i).valueChanges.subscribe((a: string) => {
      this.selectedDrains[i].aggregation = a;
    });
    this.group['fill_' + i] = new FormControl(fill ? fill : 'none');
    this.measuresForm.get('fill_' + i).valueChanges.subscribe((f: string) => {
      this.selectedDrains[i].fill = f;
    });
  }

  removeDrain(i: number): void {
    this.selectedDrains[i].visible = false;
  }

  loadMeasures(): void {
    this.isLoadingMeasures = true;
    this.measuresLoaded = false;
    this.measures = [];
    const dataDrain = this.selectedDrains.filter(drain => drain.visible === true);
    const startTime = this.httpUtils.getDateTimeForUrl(new Date(moment(this.measuresForm.get('startTime').value).toISOString()));
    const endTime = this.httpUtils.getDateTimeForUrl(new Date(moment(this.measuresForm.get('endTime').value).toISOString()));
    const timeAggregation = this.measuresForm.get('timeAggregation').value;
    let i = 0;
    if (dataDrain && dataDrain.length > 0) {
      dataDrain.forEach(drain => {
        if (timeAggregation !== 'NONE') {
          this.measureService.getMeasuresGroup(drain.client_id, drain.device_id, startTime, endTime, drain.id, drain.fill, drain.aggregations, timeAggregation).subscribe(
            (measures: any[]) => {
              const measureDrain = new Measures();
              measureDrain.drain_id = drain.id;
              measureDrain.drain_name = drain.full_name;
              measureDrain.unit = drain.unit_of_measure;
              measureDrain.measure_type = drain.measure_type;
              measureDrain.read_write = drain.read_write;
              measureDrain.measures = measures;
              this.measures.push(measureDrain);
              i++;
              if (i === dataDrain.length) {
                this.isLoadingMeasures = false;
                this.measuresLoaded = true;
                this.drawChart();
              }
            },
            (error: any) => {
              this.isLoadingMeasures = false;
              this.httpUtils.errorDialog(error);
            }
          );
        } else {
          this.measureService.getMeasures(drain.client_id, drain.device_id, startTime, endTime, drain.id).subscribe(
            (measures: any[]) => {
              const measureDrain = new Measures();
              measureDrain.drain_id = drain.id;
              measureDrain.drain_name = drain.full_name;
              measureDrain.unit = drain.unit_of_measure;
              measureDrain.measure_type = drain.measure_type;
              measureDrain.read_write = drain.read_write;
              measureDrain.measures = measures;
              this.measures.push(measureDrain);
              i++;
              if (i === dataDrain.length) {
                this.isLoadingMeasures = false;
                this.measuresLoaded = true;
                this.drawChart();
              }
            },
            (error: any) => {
              this.isLoadingMeasures = false;
              this.httpUtils.errorDialog(error);
            }
          );
        }
      });
    } else {
      this.isLoadingMeasures = false;
      this.httpUtils.errorDialog({ status: 499, error: { errorCode: 405 } });
      return;
    }
  }

  drawChart(): void {
    this.chart = undefined;
    this.chartLabels = [];
    this.chartSeries = [];
    const unitArray = [];
    this.measures.forEach(m => {
      if (!m.decimals)
        m.decimals = 2;
      const drainColumnName = m.drain_name;
      const data_array = [];
      if (m.measures && m.measures.values) {
        let yAxisIndex: number;
        if ((unitArray.length > 0) && (unitArray.includes(m.unit))) {
          yAxisIndex = unitArray.indexOf(m.unit);
        } else {
          unitArray.push(m.unit);
          yAxisIndex = unitArray.length - 1;
          this.chartLabels[yAxisIndex] = this.timeChart.createYAxis(m.unit, m.measure_type, unitArray.length);
        }
        const component = this;
        m.measures.values.forEach((measure: Measure) => {
          if ((measure[0] !== null) && (measure[1] !== undefined) && !Number.isNaN(parseFloat(measure[1].toString())))
            data_array.push(component.timeChart.createData(new Date(measure[0]), measure[1].toString(), (m.measure_type === 'c') ? 0 : m.decimals));
        });
        if (data_array.length > 0)
          this.chartSeries.push(this.timeChart.createSerie(data_array, drainColumnName, yAxisIndex, m.measure_type, m.read_write, m.decimals));
      }
    });
    if (this.chartSeries.length > 0) {
      let options = {};
      options['type'] = this.measuresForm.get('chartType').value;
      options['height'] = Math.max(400, window.screen.height * 0.7);
      options['y_axis'] = this.chartLabels;
      options['legend'] = true;
      options['legend_layout'] = 'vertical';
      options['plot_options'] = { series: { marker: { enabled: this.measuresForm.get('showMarkers').value }, dataGrouping: { enabled: (this.measuresForm.get('chartAggregation').value === 'None') ? false : true, approximation: (this.measuresForm.get('chartAggregation').value === 'None') ? null : this.measuresForm.get('chartAggregation').value } } }
      options['series'] = this.chartSeries;
      this.chart = this.timeChart.createTimeChart(options);
    }
  }

  exportCsv(): void {
    let csvData = [];
    let csvHeaders = ['Time'];
    let csvValues = [];
    let j = 0;
    this.measures.forEach(m => {
      let drainColumnName = m.drain_name + (m.unit ? ' (' + m.unit + ')' : '');
      if (!m.decimals)
        m.decimals = 2;
      csvHeaders.push(drainColumnName);
      if (m.measures.values) {
        m.measures.values.forEach((measure: Measure) => {
          if ((measure[1] !== null) && (measure[1] !== undefined) && !Number.isNaN(parseFloat(measure[1].toString()))) {
            let found = false;
            csvValues.forEach(tv => {
              if (tv.time === measure[0]) {
                tv.measures.push({ key: j, value: parseFloat(parseFloat(measure[1].toString()).toFixed(m.decimals)) });
                found = true;
              }
            });
            if (!found)
              csvValues.push({ time: measure[0], measures: [{key: j, value: parseFloat(parseFloat(measure[1].toString()).toFixed(m.decimals))}] });
          }
        });
      }
      j++;
    });
    csvData[0] = csvHeaders;
    csvValues.sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    csvValues.forEach(tv => {
      let csvRow = [this.httpUtils.getLocaleDateTimeString(tv.time)];
      for (let i = 0; i < j; i++) {
        let m = tv['measures'].find((v: any) => v.key === i);
        csvRow.push(m !== undefined ? m.value : '');
      }
      csvData.push(csvRow);
    });

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvData.forEach(line => {
      csvContent += line.join(";") + "\n";
    });

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = 'drain_data.csv';
    link.click();
  }
}

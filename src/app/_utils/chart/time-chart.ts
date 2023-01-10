import { Injectable } from '@angular/core';
import { StockChart } from 'angular-highcharts';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TimeChart {

  months: string[] = [];

  constructor(private translate: TranslateService) {
    this.translate.get('MONTH.JANUARY').subscribe((january: string) => {
      this.months.push(january);
      this.translate.get('MONTH.FEBRUARY').subscribe((february: string) => {
        this.months.push(february);
        this.translate.get('MONTH.MARCH').subscribe((march: string) => {
          this.months.push(march);
          this.translate.get('MONTH.APRIL').subscribe((april: string) => {
            this.months.push(april);
            this.translate.get('MONTH.MAY').subscribe((may: string) => {
              this.months.push(may);
              this.translate.get('MONTH.JUNE').subscribe((june: string) => {
                this.months.push(june);
                this.translate.get('MONTH.JULY').subscribe((july: string) => {
                  this.months.push(july);
                  this.translate.get('MONTH.AUGUST').subscribe((august: string) => {
                    this.months.push(august);
                    this.translate.get('MONTH.SEPTEMBER').subscribe((september: string) => {
                      this.months.push(september);
                      this.translate.get('MONTH.OCTOBER').subscribe((october: string) => {
                        this.months.push(october);
                        this.translate.get('MONTH.NOVEMBER').subscribe((november: string) => {
                          this.months.push(november);
                          this.translate.get('MONTH.DECEMBER').subscribe((december: string) => {
                            this.months.push(december);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  public createTimeChart(options: any): StockChart {
    return new StockChart({
      chart: {
        panning: { enabled: false },
        type: options.type,
        height: options ? options.height : '100%',
        width: options ? options.width : '100%',
      },
      title: {
        text: options.title,
      },
      credits: {
        enabled: true
      },
      xAxis: {
        type: 'datetime',
        ordinal: false
      },
      yAxis: options.y_axis,
      colorAxis: options.color_axis,
      legend: {
        enabled: options.legend,
        layout: options.legend_layout ? options.legend_layout : 'vertical',
        align: options.legend_position ? options.legend_position.substr(options.legend_position.indexOf('-') + 1) : 'center',
        verticalAlign: options.legend_position ? options.legend_position.substr(0, options.legend_position.indexOf('-')) : 'bottom'
      },
      tooltip: {
        valueDecimals: 2
      },
      plotOptions: options.plot_options ? options.plot_options : {},
      time: {
        useUTC: false
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      },
      series: options.series
    });
  }

  public createYAxis(unit: string, measure_type: string, n: number): any {
    return {
      labels: {
        formatter: function () {
          return (measure_type === 'c') ? ((this.value == 1) ? 'ON' : ((this.value == 0) ? 'OFF' : '')) : this.value + (unit ? ' ' + unit : '');
        }
      },
      offset: (n == 1) ? 50 : undefined,
      max: (measure_type === 'c') ? 1.5 : undefined,
      min: (measure_type === 'c') ? -0.5 : undefined,
      tickPositions: (measure_type === 'c') ? [-0.5, 0, 1, 1.5] : undefined,
      startOnTick: (measure_type === 'c') ? false : true,
      endOnTick: (measure_type === 'c') ? false : true,
      opposite: n % 2
    };
  }

  public createData(date: Date, value: string, decimals: number): any {
    return [ date.getTime(), parseFloat(parseFloat(value).toFixed(decimals)) ];
  }

  public createSerie(data_array: any[], name: string, yAxisIndex: number, measure_type: string, read_write: boolean, decimals: number): any {
    return {
      data: data_array,
      name: name,
      yAxis: yAxisIndex,
      tooltip: {
        pointFormatter: function () {
          return name + ': <b>' + ((measure_type === 'c' && read_write) ? ((this.y == 1) ? 'ON' : ((this.y == 0) ? 'OFF' : '')) : this.y.toFixed(decimals)) + '</b>';
        }
      }
    }
  }
}

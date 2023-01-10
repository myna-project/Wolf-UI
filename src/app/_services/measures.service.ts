import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Client } from '../_models/client';
import { Device } from '../_models/device';
import { ElementDB } from '../_models/elementDB';

import { HttpUtils } from '../_utils/http.utils';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {

  private apiResourceClient: string = 'wolf/clients';
  private apiResourceGroup: string = 'wolf/group';

  constructor(private http: HttpClient, private httpUtils: HttpUtils) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getDevices(client_id: number): Observable<Device[]> {
    return this.http.get<Device[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getDrains(client_id: number, device_id: string): Observable<ElementDB[]> {
    return this.http.get<ElementDB[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getAggregationTimes(): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceGroup + '/times').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getAggregationTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceGroup + '/types').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getLastMeasure(client_id: string, device_id: string, measure_id: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains/' + measure_id + '/last').pipe(
      catchError((err) => { return throwError(err); })
    );
  }

  getLastMeasures(client_id: string, device_id: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains/last').pipe(
      catchError((err) => { return throwError(err); })
    );
  }

  getMeasures(client_id: string, device_id: string, start_time: string, end_time: string, measure_id: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains/' + measure_id + '/measures?end=' + end_time + '&start=' + start_time).pipe(
      catchError((err) => { return throwError(err); })
    );
  }

  getMeasuresCsv(client_id: string, device_id: string, start_time: string, end_time: string, measure_id: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains/' + measure_id + '/measures/csv?end=' + end_time + '&start=' + start_time).pipe(
      catchError((err) => { return throwError(err); })
    );
  }

  getMeasuresGroup(client_id: string, device_id: string, start_time: string, end_time: string, measure_id: string, fill: string, aggregation: string, timeAggregation: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains/' + measure_id + '/measures/group?end=' + end_time + '&fill=' + fill + '&measureaggregation=' + aggregation + '&start=' + start_time + '&timeaggregation=' + timeAggregation).pipe(
      catchError((err) => { return throwError(err); })
    );
  }

  getMeasuresGroupCsv(client_id: string, device_id: string, start_time: string, end_time: string, measure_id: string, fill: string, aggregation: string, timeAggregation: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains/' + measure_id + '/measures/group/csv?end=' + end_time + '&fill=' + fill + '&measureaggregation=' + aggregation + '&start=' + start_time + '&timeaggregation=' + timeAggregation).pipe(
      catchError((err) => { return throwError(err); })
    );
  }

  putMeasure(client_id: string, device_id: string, measure_id: string, measure: any): Observable<any> {
    return this.http.put<any>(this.httpUtils.getWolfAPIUrl() + this.apiResourceClient + '/' + client_id + '/devices/' + device_id + '/drains/' + measure_id + '/measures', measure).pipe(
      catchError((err) => { return throwError(err); })
    );
  }
}

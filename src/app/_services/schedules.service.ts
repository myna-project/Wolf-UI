import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Schedule } from '../_models/schedule';

import { HttpUtils } from '../_utils/http.utils';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {

  apiResource = 'config/plugins/nrg/thermostat/';

  constructor(private http: HttpClient, private httpUtils: HttpUtils) {}

  getSchedules(thermostat_id: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.httpUtils.getWolfAPIUrl() + this.apiResource + '/' + thermostat_id + '/schedules').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getSchedule(thermostat_id: string, id: string): Observable<Schedule> {
    return this.http.get<Schedule>(this.httpUtils.getWolfAPIUrl() + this.apiResource + '/' + thermostat_id + '/schedules/' + id).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  putSchedule(thermostat_id: string, id: string, schedule: Schedule): Observable<Schedule> {
    return this.http.put<Schedule>(this.httpUtils.getWolfAPIUrl() + this.apiResource + '/' + thermostat_id + '/schedules/' + id, schedule).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  postSchedule(thermostat_id: string, schedule: Schedule): Observable<any> {
    return this.http.post<any>(this.httpUtils.getWolfAPIUrl() + this.apiResource + '/' + thermostat_id + '/schedules', schedule).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  deleteSchedule(thermostat_id: string, id: string): Observable<Schedule> {
    return this.http.delete<Schedule>(this.httpUtils.getWolfAPIUrl() + this.apiResource + '/' + thermostat_id + '/schedules/' + id).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}

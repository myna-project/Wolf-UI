import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Connection } from '../_models/network';

import { HttpUtils } from '../_utils/http.utils';

@Injectable({
  providedIn: 'root'
})
export class NetConfigService {

  private apiResourceInterface = 'interfaces';

  constructor(private http: HttpClient, private httpUtils: HttpUtils) {}

  getInterfaces(): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceInterface).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getInterface(iface: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceInterface + '/' + iface).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getConnection(iface: string): Observable<Connection> {
    return this.http.get<Connection>(this.httpUtils.getWolfAPIUrl() + this.apiResourceInterface + '/' + iface + '/connection').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  createConnection(iface: string, network: Connection): Observable<Connection> {
    return this.http.post<Connection>(this.httpUtils.getWolfAPIUrl() + this.apiResourceInterface + '/' + iface + '/connection', network).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  updateConnection(iface: string, uuid: string, network: Connection): Observable<Connection> {
    return this.http.post<Connection>(this.httpUtils.getWolfAPIUrl() + this.apiResourceInterface + '/' + iface + '/connection/' + uuid, network).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getAccessPoints(): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + 'accesspoints').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}

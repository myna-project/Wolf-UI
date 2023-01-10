import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Regmap } from '../_models/regmap';

import { HttpUtils } from '../_utils/http.utils';

@Injectable({
  providedIn: 'root'
})
export class RegmapsService {

  apiResourceMaps = 'config/maps';

  constructor(private http: HttpClient, private httpUtils: HttpUtils) {}

  getRegMap(map: string): Observable<any> {
    return this.http.get<any>(this.httpUtils.getWolfAPIUrl() + this.apiResourceMaps + '/' + map).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getRegMaps(): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceMaps).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  createRegMap(map: Regmap): Observable<Regmap> {
    return this.http.post<Regmap>(this.httpUtils.getWolfAPIUrl() + this.apiResourceMaps, map).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  updateRegMap(mapName: string, map: Regmap): Observable<Regmap> {
    return this.http.put<Regmap>(this.httpUtils.getWolfAPIUrl() + this.apiResourceMaps + '/' + mapName, map).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  deleteMap(mapName: string): Observable<any> {
    return this.http.delete<Regmap>(this.httpUtils.getWolfAPIUrl() + this.apiResourceMaps + '/' + mapName).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getRegMapUrl(mapName: string): Observable<any> {
    return this.http.get<any>(this.httpUtils.getWolfAPIUrl() + this.apiResourceMaps + '/' + mapName).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}

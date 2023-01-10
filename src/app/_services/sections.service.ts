import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpUtils } from '../_utils/http.utils';

@Injectable({
  providedIn: 'root'
})
export class SectionsService {

  apiResourceSectionConfig = 'config/sections'

  constructor(private http: HttpClient, private httpUtils: HttpUtils) {}

  getSections(): Observable<string[]> {
    return this.http.get<string[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceSectionConfig).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getSection(name: string): Observable<string[]> {
    return this.http.get<string[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourceSectionConfig + '/' + name).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  putSection(name: string, section: any): Observable<any> {
    return this.http.put<any>(this.httpUtils.getWolfAPIUrl() + this.apiResourceSectionConfig + '/' + name, section).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  postSection(section: any): Observable<any> {
    return this.http.post<any>(this.httpUtils.getWolfAPIUrl() + this.apiResourceSectionConfig, section).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  deleteSection(name: string): Observable<any> {
    return this.http.delete<any>(this.httpUtils.getWolfAPIUrl() + this.apiResourceSectionConfig + '/' + name).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}

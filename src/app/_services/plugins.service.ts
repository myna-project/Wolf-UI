import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpUtils } from '../_utils/http.utils';

@Injectable({
  providedIn: 'root'
})
export class PluginsService {

  apiResourcePlugins = 'config/';

  constructor(private http: HttpClient, private httpUtils: HttpUtils) {}

  getPlugins(): Observable<any> {
    return this.http.get<any>(this.httpUtils.getWolfAPIUrl() + this.apiResourcePlugins + 'plugins').pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getPlugin(pluginType: string, plugin: string): Observable<any[]> {
    return this.http.get<any[]>(this.httpUtils.getWolfAPIUrl() + this.apiResourcePlugins + 'plugins/' + pluginType + '/' + plugin).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}

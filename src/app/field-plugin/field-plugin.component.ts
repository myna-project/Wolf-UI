import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PluginsService } from '../_services/plugins.service';
import { SectionsService } from '../_services/sections.service';

import { HttpUtils } from '../_utils/http.utils';

@Component({
  templateUrl: './field-plugin.component.html',
  styleUrls: ['./field-plugin.component.scss']
})
export class FieldPluginComponent implements OnInit {

  isLoading: boolean = true;
  fieldPlugins: string[];
  fieldDict: any = {};
  backRoute: string = 'configmenu';

  constructor(private pluginsService: PluginsService, private sectionsService: SectionsService, private router: Router, private location: Location, private httpUtils: HttpUtils) {}

  ngOnInit(): void {
    forkJoin(this.pluginsService.getPlugins(), this.sectionsService.getSections()).subscribe(
      (results: any) => {
        this.fieldPlugins = results[0].plugins[0].field;
        this.fieldPlugins.forEach((field: string) => {
          const sectionsFromField = [];
          results[1].forEach((s: string) => {
            if (s.includes(field))
              sectionsFromField.push(s);
          });
          this.fieldDict[field] = sectionsFromField;
        });
        this.isLoading = false
      },
      (error: any) => {
        const dialogRef = this.httpUtils.errorDialog(error);
        dialogRef.afterClosed().subscribe((_value: any) => {
          this.router.navigate([this.backRoute]);
        });
      }
    )
  }

  showDetail(plugin: string, section: string): void {
    this.router.navigate(['section/field/'+ plugin + (section ? '/' + section : '')]);
  }

  goBack(): void {
    this.location.back();
  }
}

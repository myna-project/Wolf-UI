import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PluginsService } from '../_services/plugins.service';
import { SectionsService } from '../_services/sections.service';

import { HttpUtils } from '../_utils/http.utils';

@Component({
  templateUrl: './cloud-plugin.component.html',
  styleUrls: ['./cloud-plugin.component.scss']
})
export class CloudPluginComponent implements OnInit {

  isLoading: boolean = true;
  cloudPlugins: string[];
  cloudDict: any = {};
  backRoute: string = 'configmenu';

  constructor(private pluginsService: PluginsService, private sectionService: SectionsService, private router: Router, private location: Location, private httpUtils: HttpUtils) {}

  ngOnInit(): void {
    forkJoin(this.pluginsService.getPlugins(), this.sectionService.getSections()).subscribe(
      (results: any) => {
        this.cloudPlugins = results[0].plugins[1].cloud;
        this.cloudPlugins.forEach(cloud => {
          this.cloudDict[cloud] = (results[1].find((s: string) => s === cloud) !== undefined);
        });
        this.isLoading = false;
      },(error: any) => {
        const dialogRef = this.httpUtils.errorDialog(error);
        dialogRef.afterClosed().subscribe((_value: any) => {
          this.router.navigate([this.backRoute]);
        });
      }
    );
  }

  showDetail(plugin: string, section: string): void {
    this.router.navigate(['section/cloud/'+ plugin + (section ? '/' + section : '')]);
  }

  goBack(): void {
    this.location.back();
  }
}

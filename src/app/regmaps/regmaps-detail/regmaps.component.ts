import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { Regmap } from '../../_models/regmap';

import { PluginsService } from '../../_services/plugins.service';
import { RegmapsService } from '../../_services/regmaps.service';
import { SectionsService } from '../../_services/sections.service';

import { HttpUtils } from '../../_utils/http.utils';

@Component({
  templateUrl: './regmaps.component.html',
  styleUrls: ['./regmaps.component.scss']
})
export class RegmapsComponent implements OnInit {

  isLoading: boolean = true;
  isDeleting: boolean = false;
  isSaving: boolean = false;
  csvMapName: string;
  fieldPlugins: string[] = [];
  map: any = {};
  mapForm: FormGroup;
  group: any = {};
  backRoute: string = '/regmaps-list';

  constructor(private regMapsService: RegmapsService, private pluginService: PluginsService, private sectionService: SectionsService, private route: ActivatedRoute, private router: Router, private location: Location, private httpUtils: HttpUtils, private translate: TranslateService) {}

  ngOnInit(): void {
    this.createForm();
    this.route.paramMap.subscribe((params: any) => {
      forkJoin(this.pluginService.getPlugins(), this.sectionService.getSections(), this.regMapsService.getRegMaps()).subscribe(
        (results: any) => {
          this.fieldPlugins = results[0].plugins[0].field;
          this.fieldPlugins.push('None');
          const name = params.get('map');
          if (name && results[2].includes(name)) {
            this.csvMapName = name;
            this.regMapsService.getRegMap(name).subscribe(
              (response: any) => {
                if (response) {
                  this.map.content = response.content;
                  results[1].forEach((section: string) => {
                    this.sectionService.getSection(section).subscribe(
                      (sectionConfig: string[]) => {
                        const keys = Object.keys(sectionConfig);
                        if (keys.includes('csvmap') && sectionConfig['csvmap'] === "config/" + name ) {
                          const pluginName = section.slice(section.indexOf('/') + 1, section.indexOf('.'));
                          if (this.fieldPlugins.includes(pluginName))
                            this.map.fieldPlugin = pluginName;
                        }
                        this.createForm();
                        this.isLoading = false
                      },
                      (error: any) => {
                        const dialogRef = this.httpUtils.errorDialog(error);
                        dialogRef.afterClosed().subscribe((_value: any) => {
                          this.router.navigate([this.backRoute]);
                        });
                      }
                    );
                  });
                } else {
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
          } else {
            this.isLoading = false
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
  }

  get name() { return this.mapForm.get('name'); }
  get plugin() { return this.mapForm.get('plugin'); }
  get content() { return this.mapForm.get('content'); }

  createForm(): void {
    this.group['name'] = new FormControl({ value: this.csvMapName, disabled: (this.csvMapName !== undefined) }, [ Validators.required, Validators.pattern('.+\\.csv$') ]);
    this.group['plugin'] = new FormControl({ value: this.map.fieldPlugin, disabled: (this.csvMapName !== undefined) }, (this.csvMapName === undefined) ?  [ Validators.required ] : undefined);
    this.group['content'] = new FormControl(this.map.content, [ Validators.required ]);
    this.mapForm = new FormGroup(this.group);
  }

  save(): void {
    this.isSaving = true;
    let map = new Regmap();
    map.filename = this.name.value;
    map.content = this.content.value;
    if ((this.plugin.value !== 'None') && (this.plugin.value !== '') && (this.plugin.value !== undefined))
      map.plugin = this.plugin.value;
    if (this.csvMapName) {
      this.regMapsService.updateRegMap(this.csvMapName, map).subscribe(
        (_response: Regmap) => {
          this.httpUtils.successSnackbar(this.translate.instant('REGMAPS.UPDATED'));
          this.isSaving = false;
        },
        (error: any) => {
          this.httpUtils.errorDialog(error);
          this.isSaving = false;
        }
      );
    } else {
      this.regMapsService.createRegMap(map).subscribe(
        (_response: Regmap) => {
          this.httpUtils.successSnackbar(this.translate.instant('REGMAPS.SAVED'));
          this.isSaving = false;
        },
        (error: any) => {
          this.httpUtils.errorDialog(error);
          this.isSaving = false;
        }
      );
    }
  }

  delete(): void {
    const dialogRef = this.httpUtils.confirmDelete(this.translate.instant('SECTION.DELETECONFIRM'));
    dialogRef.afterClosed().subscribe((dialogResult: any) => {
      if (dialogResult) {
        this.isDeleting = true;
        this.regMapsService.deleteMap(this.csvMapName).subscribe(
          (_response: any) => {
            this.isDeleting = false;
            this.httpUtils.successSnackbar(this.translate.instant('SECTION.DELETED'));
            this.router.navigate([this.backRoute]);
          },
          (error: any) => {
            this.isDeleting = false;
            this.httpUtils.errorDialog(error);
          }
        );
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}

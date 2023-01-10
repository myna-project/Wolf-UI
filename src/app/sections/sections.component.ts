import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { PluginsService } from '../_services/plugins.service';
import { RegmapsService } from '../_services/regmaps.service';
import { SectionsService } from '../_services/sections.service';

import { HttpUtils } from '../_utils/http.utils';

@Component({
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
})
export class SectionsComponent implements OnInit {

  isLoading: boolean = true;
  isDeleting: boolean = false;
  isSaving: boolean = false;
  pluginType: string;
  pluginName: string;
  sectionName: string;
  maps: any[] = [];
  plugin: any = [];
  section: any = [];
  sectionForm: FormGroup;
  group: any = {};
  isNew: boolean;
  backRoute: string;

  constructor(private pluginsService: PluginsService, private sectionsService: SectionsService, private regMapsService: RegmapsService, private location: Location, private route: ActivatedRoute, private router: Router, private httpUtils: HttpUtils, private translate: TranslateService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: any) => {
      this.pluginType = params.get('pluginType');
      this.pluginName = params.get('plugin');
      this.sectionName = params.get('section');
      this.backRoute = (this.pluginType === 'field') ? 'field-plugin' : 'cloud-plugin';
      forkJoin(this.pluginsService.getPlugin(this.pluginType, this.pluginName), this.sectionsService.getSections(), this.regMapsService.getRegMaps()).subscribe(
        (results: any) => {
          this.plugin = results[0];
          this.section = results[1];
          results[2].forEach((map: any) => {
            this.maps.push({ path:'config/' + map, name: map })
          });
          this.maps.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name) ? 1 : 0);
          this.createForm();
          if (this.sectionName) {
            this.sectionsService.getSection(this.sectionName).subscribe(
              (sectionConfig: string[]) => {
                Object.keys(sectionConfig).forEach(key => {
                  if (this.sectionForm.get(key)) {
                    if (this.plugin.find((plugin: any) => plugin.name === key).type === 'boolean')
                      this.sectionForm.get(key).setValue((sectionConfig[key] !== 'true') ? false : true);
                    else
                      this.sectionForm.get(key).setValue(sectionConfig[key]);
                  }
                });
                this.isLoading = false;
              },
              (error: any) => {
                this.httpUtils.errorDialog(error);
                this.isLoading = false;
              }
            );
          } else {
            this.isLoading = false;
          }
        },
        (error: any) => {
          this.httpUtils.errorDialog(error);
          this.isLoading = false;
        }
      );
    });
  }

  createForm(): void {
    let patterns = this.httpUtils.getPatterns();
    this.plugin.forEach((p: any) => {
      this.group[p.name] = new FormControl({ value: (p.type !== 'boolean') ? p.default : ((p.default !== 'true') ? false : true), disabled: (this.sectionName && (p.name === 'deviceid')) });
      if (p.required)
        this.group[p.name].addValidators(Validators.required);
      if (p.type === 'int')
        this.group[p.name].addValidators(Validators.pattern(patterns.positiveInteger));
    });
    this.sectionForm = new FormGroup(this.group);
  }

  editMap(): void {
    if (this.sectionName) {
      const mapForm = this.sectionForm.get('csvmap').value;
      const index = mapForm.indexOf('/');
      if (index !== -1)
        this.router.navigate(['/regmaps', mapForm.slice(index + 1)])
    } else {
      this.router.navigate(['/regmaps']);
    }
  }

  save(): void {
    this.isSaving = true;
    const newSection: any = {};
    this.plugin.forEach((form: any) => {
      if (this.sectionForm.get(form.name)) {
        newSection[form.name] = (form.type === 'boolean') ? (this.sectionForm.get(form.name).value ? "true" : "false") : (!this.sectionForm.get(form.name).value ? '' : (((form.type === 'int') && (this.sectionForm.get(form.name).value === '0')) ? "0" : this.sectionForm.get(form.name).value.toString()));
      } else {
        newSection[form.name] = '';
      }
    });
    newSection.plugin = this.pluginName;
    if (this.sectionName) {
      this.sectionsService.putSection(this.sectionName, newSection).subscribe(
        (_response: any) => {
          this.httpUtils.successSnackbar(this.translate.instant('SECTION.SAVED'));
          this.isSaving = false;
          this.router.navigate([this.backRoute]);
        },
        (error: any) => {
          this.httpUtils.errorDialog(error);
          this.isSaving = false;
        }
      );
    } else {
      this.sectionsService.postSection(newSection).subscribe(
        (_response: any) => {
          this.isSaving = false;
          this.httpUtils.successSnackbar(this.translate.instant('SECTION.SAVED'));
          this.router.navigate([this.backRoute]);
        },
        (error: any) => {
          this.isSaving = false;
          this.httpUtils.errorDialog(error);
        }
      );
    }
  }

  delete(): void {
    const dialogRef = this.httpUtils.confirmDelete(this.translate.instant('SECTION.DELETECONFIRM'));
    dialogRef.afterClosed().subscribe((dialogResult: any) => {
      if (dialogResult) {
        this.isDeleting = true;
        this.sectionsService.deleteSection(this.sectionName).subscribe(
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

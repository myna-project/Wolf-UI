import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RegmapsService } from '../../_services/regmaps.service';

import { HttpUtils } from '../../_utils/http.utils';

@Component({
  templateUrl: './regmaps-list.component.html',
  styleUrls: ['./regmaps-list.component.scss']
})
export class RegmapsListComponent implements OnInit {

  isLoading: boolean = true
  mapsList: string[] = [];

  constructor(private regMapsService: RegmapsService, private router: Router, private location: Location, private httpUtils: HttpUtils) {}

  ngOnInit(): void {
    this.regMapsService.getRegMaps().subscribe(
      (maps: string[]) => {
        this.mapsList = maps;
        this.mapsList.sort((a, b) => a < b ? -1 : (a > b) ? 1 : 0);
        this.isLoading = false;
      },
      (error: any) => {
        this.httpUtils.errorDialog(error);
      }
    );
  }

  modify(mapName: string): void{
    this.router.navigate(['/regmaps', mapName]);
  }

  download(mapName: string) {
    this.regMapsService.getRegMapUrl(mapName).subscribe(
      (map: any) => {
        const blob = new Blob([map.content], { type: 'text/csv' });
        let anchor = document.createElement("a");
        anchor.download = mapName;
        anchor.href = window.URL.createObjectURL(blob);
        anchor.click();
      },
      (error: any) => {
        this.httpUtils.errorDialog(error);
      }
    );
  }

  goBack(): void {
    this.location.back();
  }
}

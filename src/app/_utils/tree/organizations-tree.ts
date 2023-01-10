import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Device } from '../../_models/device';
import { Drain } from '../../_models/drain';
import { TreeItemNode } from '../../_models/treenode';

import { TreeUtils } from './tree.utils';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsTree {

  allDevices: Device[];
  allDrains: Drain[];
  deviceNodes: TreeItemNode[] = [];
  last: boolean = false;
  treeData: any[];
  dataChange = new BehaviorSubject<TreeItemNode[]>([]);

  get data(): TreeItemNode[] {
    return this.dataChange.value;
  }

  constructor(private treeUtils: TreeUtils) {}

  initialize(devices: Device[], drains: Drain[], lastMeasures: boolean) {
    let devicesTree = this;
    devicesTree.allDevices = devices;
    devicesTree.allDrains = drains;
    devicesTree.last = lastMeasures;
    devicesTree.deviceNodes = [];
    devicesTree.treeData = [];
    devicesTree.dataChange.next(devicesTree.treeUtils.buildTree(devicesTree.deviceNodes, '0'));
    devicesTree.allDevices.forEach((dev) => {
      let deviceNode = new TreeItemNode();
      deviceNode.id = dev.device_id;
      deviceNode.client_id = dev.client_id;
      deviceNode.item = dev.device_descr + ' - ' + dev.device_id;
      deviceNode.full_name = dev.device_descr;
      deviceNode.type = 'device';
      deviceNode.code = '0' + '.' + dev.device_id;
      deviceNode.is_last = lastMeasures;
      devicesTree.deviceNodes.push(deviceNode);
      if(!lastMeasures) {
        devicesTree.createChildrenTree(devicesTree, deviceNode, dev);
      }
    });
    devicesTree.treeData = devicesTree.deviceNodes;
    devicesTree.dataChange.next(devicesTree.treeUtils.buildTree(devicesTree.deviceNodes, '0'));
  }

  getTreeData(devices: Device[], drains: Drain[], lastMeasures: boolean): TreeItemNode[] {
    this.initialize(devices, drains, lastMeasures);
    return this.treeUtils.buildTree(this.deviceNodes, '0');
  }

  createChildrenTree(devicesTree: OrganizationsTree, fatherNode: TreeItemNode, parentDev: Device): void {
    if (devicesTree.allDrains) {
      let childrenDevices = devicesTree.allDrains.filter(drain => (drain.device_id === parentDev.device_id));
      if (childrenDevices.length > 0) {
        childrenDevices.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
        childrenDevices.forEach((child) => {
          let childNode = new TreeItemNode();
          childNode.id = parentDev.device_id + '-' + parentDev.client_id + '-' + child.measure_id;
          childNode.device_id = parentDev.device_id;
          childNode.client_id = parentDev.client_id;
          childNode.measure_id = child.measure_id;
          childNode.item = child.unit_of_measure ? child.name + ' (' + child.unit_of_measure + ')' : child.name;
          childNode.device_description = parentDev.device_descr;
          childNode.full_name = child.unit_of_measure ? parentDev.device_descr + ' - ' + child.name + ' (' + child.unit_of_measure + ')' : parentDev.device_descr + ' - ' + child.name;
          childNode.type = 'drain';
          childNode.code = (fatherNode.code ? fatherNode.code : '0') + '.' + child.measure_id;
          childNode.unit_of_measure = child.unit_of_measure;
          devicesTree.deviceNodes.push(childNode);
        });
      }
    }
  }
}

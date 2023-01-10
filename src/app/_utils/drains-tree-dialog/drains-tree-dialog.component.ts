import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import { Device } from '../../_models/device';
import { Drain} from '../../_models/drain';
import { TreeItemFlatNode, TreeItemNode } from '../../_models/treenode';

import { OrganizationsTree } from '../tree/organizations-tree';

export interface DrainsTreeDialogData {
  devices: Device[];
  drains: Drain[];
  singleDrain: boolean;
  lastMeasures: boolean;
}

@Component({
  templateUrl: './drains-tree-dialog.component.html'
})
export class DrainsTreeDialogComponent implements OnInit {

  selectedDrains: any[] = [];
  selectedDrain: TreeItemNode = new TreeItemNode();
  singleDrain: boolean = false;
  isLoading: boolean = true;

  flatNodeMap = new Map<TreeItemFlatNode, TreeItemNode>();
  nestedNodeMap = new Map<TreeItemNode, TreeItemFlatNode>();
  treeControl: FlatTreeControl<TreeItemFlatNode>;
  treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;

  constructor(public dialogRef: MatDialogRef<DrainsTreeDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: DrainsTreeDialogData, private organizationsTree: OrganizationsTree) {}

  ngOnInit(): void {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.organizationsTree.dataChange.subscribe((data: any) => {
      this.dataSource.data = data;
    });

    this.organizationsTree.initialize(this.data.devices, this.data.drains, this.data.lastMeasures)
    this.singleDrain = this.data.singleDrain ? this.data.singleDrain : false;
    this.isLoading = false;
  }

  getLevel = (node: TreeItemFlatNode) => node.level;

  isExpandable = (node: TreeItemFlatNode) => node.expandable;

  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item ? existingNode : new TreeItemFlatNode();
    flatNode.id = node.id;
    flatNode.client_id = node.client_id;
    flatNode.device_description = node.device_description;
    flatNode.device_id = node.device_id;
    flatNode.measure_id = node.measure_id;
    flatNode.type = node.type;
    flatNode.item = node.item;
    flatNode.full_name = node.full_name;
    flatNode.level = level;
    flatNode.code = node.code;
    flatNode.unit_of_measure = node.unit_of_measure;
    flatNode.expandable = node.children && node.children.length > 0;
    flatNode.is_last = node.is_last;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  checkSelectedDrain(node: TreeItemNode): boolean {
    return (this.selectedDrains.filter(d => d.id === node.id).length > 0) || (this.selectedDrain && (this.selectedDrain.id === node.id));
  }

  selectDrain(node: TreeItemNode): void {
    if (node.type === 'drain') {
      if (this.data.singleDrain) {
        this.selectedDrain = (this.selectedDrain && (this.selectedDrain.id === node.id)) ? null : node;
      } else {
        let i: number = this.selectedDrains.indexOf(node);
        if (i > -1)
          this.selectedDrains.splice(i, 1);
        else
          this.selectedDrains.push(node);
      }
    }
    if (node.type === 'device' && node.is_last) {
      let i: number = this.selectedDrains.indexOf(node);
      if (i > -1) {
        this.selectedDrains.splice(i, 1);
      } else {
        this.selectedDrains.pop();
        this.selectedDrains.push(node);
      }
    }
  }
}

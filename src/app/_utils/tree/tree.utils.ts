import { Injectable } from '@angular/core';

import { TreeItemNode } from '../../_models/treenode';

@Injectable({
  providedIn: 'root',
})
export class TreeUtils {

  constructor() {}

  public buildTree(obj: any[], level: string): TreeItemNode[] {
    return obj.filter(o => (<string>o.code).startsWith(level + '.') && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1)
      .map(o => {
        const node = new TreeItemNode();
        node.id = o.id;
        node.client_id = o.client_id;
        node.device_id = o.device_id;
        node.measure_id = o.measure_id;
        node.full_name = o.full_name;
        node.device_description = o.device_description ? o.device_description : undefined;
        node.unit_of_measure = o.unit_of_measure ? o.unit_of_measure : undefined;
        node.item = o.item;
        node.type = o.type;
        node.subtype = o.subtype;
        node.code = o.code;
        node.is_last = o.is_last;
        const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
        if (children && children.length > 0)
          node.children = this.buildTree(children, o.code);
        return node;
      });
  }
}

export class TreeItemNode {
  id: string;
  client_id: string;
  device_id: string;
  measure_id: string;
  device_description: string;
  item: string;
  type: string;
  full_name: string;
  subtype: string;
  code: string;
  unit_of_measure: string;
  children: TreeItemNode[];
  is_last: boolean;
}

export class TreeItemFlatNode {
  id: string;
  client_id: string;
  device_id: string;
  measure_id: string;
  device_description: string;
  item: string;
  type: string;
  full_name: string;
  unit_of_measure: string;
  subtype: string;
  code: string;
  level: number;
  expandable: boolean;
  is_last: boolean;
}

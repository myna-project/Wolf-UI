import { Measure } from './measure';

export class Measures {
  drain_id: number;
  drain_name: string;
  unit: string;
  type: string;
  decimals: number;
  measures: Measure[];
  measure_type: string;
  read_write: boolean;
}

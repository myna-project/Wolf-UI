export class Schedule {
  uuid: string;
  weekdays: boolean[];
  setpoint: number;
  delta: number;
  start: string;
  stop: string;
  window: number;
  enable: boolean;
}

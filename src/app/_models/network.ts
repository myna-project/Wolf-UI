export class AccessPoint {
  bssid: string;
  frequency: number;
  signal: number;
  ssid: string;
}

export class Connection {
  '802-3-ethernet': any;
  '802-11-wireless': Wireless;
  '802-11-wireless-security': WirelessSecurity;
  bridge: any;
  connection: ConnectionInfo;
  ipv4: IpConfig;
  ipv6: IpConfig;
  proxy: any;
}

export class ConnectionInfo {
  autoconnect: boolean;
  id: string;
  'interface-name': string;
  permissions: any[];
  timestamp: number;
  type: string;
  uuid: string;
}

export class Interface {
  interface: string;
  devicetype: string;
  state: string;
  ip4config: IpConfig;
}

export class IpConfig {
  'address-data': IpAddress[];
  addresses: any[];
  dns: string[];
  'dns-search': string[];
  gateway: string;
  method: string;
  'route-data': string[];
  routes: string[];
}

export class IpAddress {
  address: string;
  prefix: number;
}

export class Wireless {
  mode: string;
  '802-11-wireless-security': string;
  ssid: string;
}

export class WirelessSecurity {
  'auth-alg': string;
  'key-mgmt': number;
  psk: string;
}

import { ConnectorType } from '../models/ChargingPoint';

export interface ChargingConnectorProfile {
  connectorType: ConnectorType;
  name: string;
  shortName: string;
  currentType: 'AC' | 'DC';
  defaultPowerKw: number;
  maxOutputVoltage: string;
  description: string;
}

export const chargingConnectorProfiles: ChargingConnectorProfile[] = [
  {
    connectorType: 'AC_Type2',
    name: 'Type 2 AC',
    shortName: 'AC Type 2',
    currentType: 'AC',
    defaultPowerKw: 22,
    maxOutputVoltage: '400V',
    description: 'Cổng sạc AC phổ biến cho ô tô điện.',
  },
  {
    connectorType: 'CCS2',
    name: 'CCS Combo 2',
    shortName: 'CCS2',
    currentType: 'DC',
    defaultPowerKw: 60,
    maxOutputVoltage: '500V',
    description: 'Cổng sạc nhanh DC cho ô tô điện.',
  },
  {
    connectorType: 'CHAdeMO',
    name: 'CHAdeMO',
    shortName: 'CHAdeMO',
    currentType: 'DC',
    defaultPowerKw: 50,
    maxOutputVoltage: '500V',
    description: 'Chuẩn sạc nhanh DC tương thích một số dòng xe điện.',
  },
  {
    connectorType: 'GB_T',
    name: 'GB/T',
    shortName: 'GB/T',
    currentType: 'DC',
    defaultPowerKw: 60,
    maxOutputVoltage: '500V',
    description: 'Chuẩn đầu sạc GB/T.',
  },
];

export const connectorTypeValues = chargingConnectorProfiles.map((profile) => profile.connectorType);

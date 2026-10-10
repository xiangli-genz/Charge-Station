import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ChargingPointStatus, ConnectorType } from '../../models/ChargingPoint';
import { StationStatus } from '../../models/Station';
import { connectorTypeValues } from '../../configs/charging-connector-types';
import {
  createAdminStation,
  createAdminStationWithChargingPoints,
  deleteAdminStation,
  getAdminStationById,
  importAdminStations,
  listAdminStations,
  updateAdminStation,
  StationChargingPointPayload,
} from '../../services/admin-station.service';

const stationStatuses: StationStatus[] = ['active', 'inactive', 'maintenance', 'closed'];

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseStationStatus = (value: unknown): StationStatus | undefined => {
  return typeof value === 'string' && stationStatuses.includes(value as StationStatus)
    ? (value as StationStatus)
    : undefined;
};

const parseLocationNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBooleanField = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'on' || normalized === 'yes';
  }

  return false;
};

const parseDateField = (value: unknown): Date | null | undefined => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parseAmenitiesField = (value: unknown): string[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseConnectorTypesField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const isValidObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

const chargingPointStatuses: ChargingPointStatus[] = [
  'available',
  'occupied',
  'reserved',
  'maintenance',
];

const parseChargingPoints = (value: unknown): StationChargingPointPayload[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error('chargingPoints phai la mot mang');
  }

  return value.map((rawPoint, index) => {
    if (!rawPoint || typeof rawPoint !== 'object') {
      throw new Error(`Cong sac thu ${index + 1} khong hop le`);
    }

    const point = rawPoint as Record<string, unknown>;
    const pricingId = typeof point.pricingId === 'string' ? point.pricingId.trim() : '';
    const code = typeof point.code === 'string' ? point.code.trim() : '';
    const connectorType = point.connectorType as ConnectorType;
    const powerKw = Number(point.powerKw);
    const status = point.status as ChargingPointStatus | undefined;

    if (
      !isValidObjectId(pricingId) ||
      !code ||
      !connectorTypeValues.includes(connectorType) ||
      !Number.isFinite(powerKw) ||
      powerKw <= 0 ||
      (status !== undefined && !chargingPointStatuses.includes(status))
    ) {
      throw new Error(`Thong tin cong sac thu ${index + 1} khong hop le`);
    }

    const maxOutputCurrentA = point.maxOutputCurrentA === undefined
      ? null
      : parseOptionalPositiveNumber(point.maxOutputCurrentA);

    return {
      pricingId,
      code,
      connectorType,
      outputCurrentType: typeof point.outputCurrentType === 'string' ? point.outputCurrentType.trim() : '',
      inputSupply: typeof point.inputSupply === 'string' ? point.inputSupply.trim() : '',
      maxOutputCurrentA,
      description: typeof point.description === 'string' ? point.description.trim() : '',
      powerKw,
      maxOutputVoltage: typeof point.maxOutputVoltage === 'string' ? point.maxOutputVoltage.trim() : '',
      multiPortEnabled: parseBooleanField(point.multiPortEnabled),
      positionLabel: typeof point.positionLabel === 'string' ? point.positionLabel.trim() : '',
      status,
    };
  });
};

const parseOptionalPositiveNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const listAdminStationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const status = parseStationStatus(req.query.status);
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined;

    const result = await listAdminStations({ page, limit, status, keyword });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getAdminStationByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Station id khong hop le',
      });
      return;
    }

    const station = await getAdminStationById(id);

    res.status(200).json({
      success: true,
      item: station,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createAdminStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const imei = typeof req.body.imei === 'string' ? req.body.imei.trim() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
    const city = typeof req.body.city === 'string' ? req.body.city.trim() : '';
    const district = typeof req.body.district === 'string' ? req.body.district.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const lat = parseLocationNumber(req.body.location?.lat);
    const lng = parseLocationNumber(req.body.location?.lng);
    const status = parseStationStatus(req.body.status);
    const chargingType = typeof req.body.chargingType === 'string' ? req.body.chargingType.trim() : '';
    const currentType = typeof req.body.currentType === 'string' ? req.body.currentType.trim() : '';
    const connectorTypes = parseConnectorTypesField(req.body.connectorTypes);
    const isActivated = parseBooleanField(req.body.isActivated);
    const activatedAt = parseDateField(req.body.activatedAt);
    const warrantyUntil = parseDateField(req.body.warrantyUntil);
    const simType = typeof req.body.simType === 'string' ? req.body.simType.trim() : '';
    const simNumber = typeof req.body.simNumber === 'string' ? req.body.simNumber.trim() : '';
    const billingSimNumber =
      typeof req.body.billingSimNumber === 'string' ? req.body.billingSimNumber.trim() : '';
    const supportPhone = typeof req.body.supportPhone === 'string' ? req.body.supportPhone.trim() : '';
    const open24_7 = parseBooleanField(req.body.open24_7);
    const amenities = parseAmenitiesField(req.body.amenities);
    const chargingPoints = parseChargingPoints(req.body.chargingPoints);

    if (!name || !address || typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Thong tin tram sac khong hop le',
      });
      return;
    }

    const stationPayload = {
      imei,
      name,
      address,
      city,
      district,
      description,
      location: { lat, lng },
      status,
      chargingType,
      currentType,
      connectorTypes,
      isActivated,
      activatedAt,
      warrantyUntil,
      simType,
      simNumber,
      billingSimNumber,
      supportPhone,
      open24_7,
      amenities,
    };

    if (chargingPoints?.length) {
      const result = await createAdminStationWithChargingPoints(stationPayload, chargingPoints);
      res.status(201).json({
        success: true,
        message: `Tao tram sac va ${result.chargingPoints.length} cong sac thanh cong`,
        item: result.station,
        chargingPoints: result.chargingPoints,
      });
      return;
    }

    const station = await createAdminStation(stationPayload);

    res.status(201).json({
      success: true,
      message: 'Tao tram sac thanh cong',
      item: station,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateAdminStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Station id khong hop le',
      });
      return;
    }

    const imei = typeof req.body.imei === 'string' ? req.body.imei.trim() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
    const city = typeof req.body.city === 'string' ? req.body.city.trim() : '';
    const district = typeof req.body.district === 'string' ? req.body.district.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const lat = parseLocationNumber(req.body.location?.lat);
    const lng = parseLocationNumber(req.body.location?.lng);
    const status = parseStationStatus(req.body.status);
    const chargingType = typeof req.body.chargingType === 'string' ? req.body.chargingType.trim() : '';
    const currentType = typeof req.body.currentType === 'string' ? req.body.currentType.trim() : '';
    const connectorTypes = parseConnectorTypesField(req.body.connectorTypes);
    const isActivated = parseBooleanField(req.body.isActivated);
    const activatedAt = parseDateField(req.body.activatedAt);
    const warrantyUntil = parseDateField(req.body.warrantyUntil);
    const simType = typeof req.body.simType === 'string' ? req.body.simType.trim() : '';
    const simNumber = typeof req.body.simNumber === 'string' ? req.body.simNumber.trim() : '';
    const billingSimNumber =
      typeof req.body.billingSimNumber === 'string' ? req.body.billingSimNumber.trim() : '';
    const supportPhone = typeof req.body.supportPhone === 'string' ? req.body.supportPhone.trim() : '';
    const open24_7 = parseBooleanField(req.body.open24_7);
    const amenities = parseAmenitiesField(req.body.amenities);

    if (!name || !address || typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Thong tin tram sac khong hop le',
      });
      return;
    }

    const station = await updateAdminStation(id, {
      imei,
      name,
      address,
      city,
      district,
      description,
      location: { lat, lng },
      status,
      chargingType,
      currentType,
      connectorTypes,
      isActivated,
      activatedAt,
      warrantyUntil,
      simType,
      simNumber,
      billingSimNumber,
      supportPhone,
      open24_7,
      amenities,
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat tram sac thanh cong',
      item: station,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteAdminStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Station id khong hop le',
      });
      return;
    }

    await deleteAdminStation(id);

    res.status(200).json({
      success: true,
      message: 'Xoa tram sac thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const importAdminStationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await importAdminStations({
      format: req.body.format,
      mode: req.body.mode,
      content: req.body.content,
      items: req.body.items,
    });

    res.status(200).json({
      success: true,
      message: 'Import tram sac thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

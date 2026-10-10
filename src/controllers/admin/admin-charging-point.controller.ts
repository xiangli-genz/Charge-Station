import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { chargingConnectorProfiles } from '../../configs/charging-connector-types';
import {
  ChargingPointStatus,
  ConnectorType,
} from '../../models/ChargingPoint';
import {
  createAdminChargingPoint,
  deleteAdminChargingPoint,
  getAdminChargingPointById,
  importAdminChargingPoints,
  listAdminChargingPoints,
  updateAdminChargingPoint,
} from '../../services/admin-charging-point.service';

const chargingPointStatuses: ChargingPointStatus[] = [
  'available',
  'occupied',
  'reserved',
  'maintenance',
];
const connectorTypes: ConnectorType[] = ['AC_Type2', 'CCS2', 'CHAdeMO', 'GB_T'];

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parsePower = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const parseOptionalNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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

const parseStatus = (value: unknown): ChargingPointStatus | undefined => {
  return typeof value === 'string' && chargingPointStatuses.includes(value as ChargingPointStatus)
    ? (value as ChargingPointStatus)
    : undefined;
};

const parseConnectorType = (value: unknown): ConnectorType | undefined => {
  return typeof value === 'string' && connectorTypes.includes(value as ConnectorType)
    ? (value as ConnectorType)
    : undefined;
};

const isValidObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

export const listChargingConnectorProfilesHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({
    success: true,
    items: chargingConnectorProfiles,
  });
};

export const listAdminChargingPointsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const stationId =
      typeof req.query.stationId === 'string' && isValidObjectId(req.query.stationId)
        ? req.query.stationId
        : undefined;
    const status = parseStatus(req.query.status);
    const connectorType = parseConnectorType(req.query.connectorType);

    const result = await listAdminChargingPoints({
      page,
      limit,
      stationId,
      status,
      connectorType,
    });

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

export const getAdminChargingPointByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Charging point id khong hop le',
      });
      return;
    }

    const chargingPoint = await getAdminChargingPointById(id);

    res.status(200).json({
      success: true,
      item: chargingPoint,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createAdminChargingPointHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stationId =
      typeof req.body.stationId === 'string' ? req.body.stationId.trim() : '';
    const pricingId =
      typeof req.body.pricingId === 'string' ? req.body.pricingId.trim() : '';
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    const connectorType = parseConnectorType(req.body.connectorType);
    const outputCurrentType =
      typeof req.body.outputCurrentType === 'string' ? req.body.outputCurrentType.trim() : '';
    const inputSupply =
      typeof req.body.inputSupply === 'string' ? req.body.inputSupply.trim() : '';
    const maxOutputCurrentA = parseOptionalNumber(req.body.maxOutputCurrentA);
    const description =
      typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const powerKw = parsePower(req.body.powerKw);
    const maxOutputVoltage =
      typeof req.body.maxOutputVoltage === 'string' ? req.body.maxOutputVoltage.trim() : '';
    const multiPortEnabled = parseBooleanField(req.body.multiPortEnabled);
    const positionLabel =
      typeof req.body.positionLabel === 'string' ? req.body.positionLabel.trim() : '';
    const status = parseStatus(req.body.status);

    if (
      !isValidObjectId(stationId) ||
      !isValidObjectId(pricingId) ||
      !code ||
      !connectorType ||
      typeof powerKw !== 'number'
    ) {
      res.status(400).json({
        success: false,
        message: 'Thong tin cong sac khong hop le',
      });
      return;
    }

    const chargingPoint = await createAdminChargingPoint({
      stationId,
      pricingId,
      code,
      connectorType,
      outputCurrentType,
      inputSupply,
      maxOutputCurrentA,
      description,
      powerKw,
      maxOutputVoltage,
      multiPortEnabled,
      positionLabel,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Tao cong sac thanh cong',
      item: chargingPoint,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateAdminChargingPointHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Charging point id khong hop le',
      });
      return;
    }

    const stationId =
      typeof req.body.stationId === 'string' ? req.body.stationId.trim() : '';
    const pricingId =
      typeof req.body.pricingId === 'string' ? req.body.pricingId.trim() : '';
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    const connectorType = parseConnectorType(req.body.connectorType);
    const outputCurrentType =
      typeof req.body.outputCurrentType === 'string' ? req.body.outputCurrentType.trim() : '';
    const inputSupply =
      typeof req.body.inputSupply === 'string' ? req.body.inputSupply.trim() : '';
    const maxOutputCurrentA = parseOptionalNumber(req.body.maxOutputCurrentA);
    const description =
      typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const powerKw = parsePower(req.body.powerKw);
    const maxOutputVoltage =
      typeof req.body.maxOutputVoltage === 'string' ? req.body.maxOutputVoltage.trim() : '';
    const multiPortEnabled = parseBooleanField(req.body.multiPortEnabled);
    const positionLabel =
      typeof req.body.positionLabel === 'string' ? req.body.positionLabel.trim() : '';
    const status = parseStatus(req.body.status);

    if (
      !isValidObjectId(stationId) ||
      !isValidObjectId(pricingId) ||
      !code ||
      !connectorType ||
      typeof powerKw !== 'number'
    ) {
      res.status(400).json({
        success: false,
        message: 'Thong tin cong sac khong hop le',
      });
      return;
    }

    const chargingPoint = await updateAdminChargingPoint(id, {
      stationId,
      pricingId,
      code,
      connectorType,
      outputCurrentType,
      inputSupply,
      maxOutputCurrentA,
      description,
      powerKw,
      maxOutputVoltage,
      multiPortEnabled,
      positionLabel,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat cong sac thanh cong',
      item: chargingPoint,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteAdminChargingPointHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Charging point id khong hop le',
      });
      return;
    }

    await deleteAdminChargingPoint(id);

    res.status(200).json({
      success: true,
      message: 'Xoa cong sac thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const importAdminChargingPointsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await importAdminChargingPoints({
      format: req.body.format,
      mode: req.body.mode,
      content: req.body.content,
      items: req.body.items,
    });

    res.status(200).json({
      success: true,
      message: 'Import cong sac thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

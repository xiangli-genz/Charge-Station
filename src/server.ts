import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import activityLogRoutes from './routes/client/activity-log.routes';
import chargingConnectorTypeRoutes from './routes/admin/charging-connector-type.routes';
import cors from 'cors';
import customerAuthRoutes from './routes/client/customer-auth.routes';
import deviceTypeRoutes from './routes/admin/device-type.routes';
import path from 'path';
import adminChargingPointRoutes from './routes/admin/admin-charging-point.routes';
import adminBookingRoutes from './routes/admin/admin-booking.routes';
import adminPricingRoutes from './routes/admin/admin-pricing.routes';
import adminStationRoutes from './routes/admin/admin-station.routes';
import adminUserTreeRoutes from './routes/admin/admin-user-tree.routes';
import connectDB from './configs/db';
import authRoutes from './routes/admin/auth.routes';
import favoriteStationRoutes from './routes/client/favorite-station.routes';
import loginPageRoutes from './routes/admin/login-page.routes';
import permissionRoutes from './routes/admin/permission.routes';
import permissionGroupRoutes from './routes/admin/permission-group.routes';
import profileRoutes from './routes/client/profile.routes';
import { getLoginPageByHost } from './services/login-page.service';
import simTypeRoutes from './routes/admin/sim-type.routes';
import stationRoutes from './routes/client/station.routes';
import superadminRoutes from './routes/admin/superadmin.routes';
import userBookingRoutes from './routes/client/user-booking.routes';
import chargingSessionRoutes from './routes/client/charging-session.routes';
import billingRoutes from './routes/client/billing.routes';
import adminBillingRoutes from './routes/admin/billing.routes';
import adminChargingSessionRoutes from './routes/admin/admin-charging-session.routes';
import occupancyRoutes from './routes/admin/occupancy.routes';
import mongoose from 'mongoose';

connectDB();

const app: Application = express();
const publicDir = path.join(process.cwd(), 'public');
const viewsDir = path.join(process.cwd(), 'views');

const renderChargingShellPage = (
  template: string,
  pageTitle: string,
  initialView: string,
  shellRole: 'admin' | 'client' = 'admin'
) => {
  return (_req: Request, res: Response) => {
    res.render(template, {
      pageTitle,
      stylesheet: shellRole === 'admin' ? '/admin/assets/css/site.css' : '/client/assets/css/site.css',
      locationiqKey: process.env.LOCATIONIQ_API_KEY || '',
      initialView,
      shellRole,
      bodyClass: 'map-page',
    });
  };
};

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(publicDir));

app.set('views', viewsDir);
app.set('view engine', 'pug');

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'tram-sac-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (_req: Request, res: Response) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? 'ready' : 'not_ready',
    database: ready ? 'connected' : 'disconnected',
  });
});

app.get('/', renderChargingShellPage('client/pages/home', 'Tram Sac Hub', 'map', 'client'));
app.get('/stations', renderChargingShellPage('client/pages/home', 'Danh sach tram sac', 'stations', 'client'));
app.get('/notifications', renderChargingShellPage('client/pages/home', 'Thong bao', 'notifications', 'client'));
app.get('/admin/dashboard', renderChargingShellPage('admin/pages/charging-dashboard', 'Tong quan tram sac', 'dashboard'));
app.get('/admin/accounts', renderChargingShellPage('admin/pages/account-admin-list', 'Quan ly tai khoan', 'accounts'));
app.get('/admin/stations/map', renderChargingShellPage('admin/pages/charging-station-map', 'Ban do tram sac', 'station-map'));
app.get('/admin/stations/list', renderChargingShellPage('admin/pages/charging-station-list', 'Thong tin tram sac', 'station-info'));
app.get('/admin/charging-points', renderChargingShellPage('admin/pages/charging-port-list', 'Quan ly cong sac', 'charging-points'));
app.get('/admin/pricings', renderChargingShellPage('admin/pages/charging-service-list', 'Gia dich vu', 'pricings'));
app.get('/admin/system/roles', renderChargingShellPage('admin/pages/role-list', 'Vai tro', 'roles'));
app.get('/admin/system/permissions', renderChargingShellPage('admin/pages/permission-list', 'Quyen', 'permissions'));
app.get('/admin/system/login-pages', renderChargingShellPage('admin/pages/login-page-list', 'Trang dang nhap', 'login-pages'));
app.get('/admin/system/sim-types', renderChargingShellPage('admin/pages/sim-type-list', 'Loai sim', 'sim-types'));
app.get('/admin/device-config/device-types', renderChargingShellPage('admin/pages/device-type-list', 'Loai thiet bi', 'device-types'));
app.get('/admin/device-config/connector-types', renderChargingShellPage('admin/pages/connector-type-list', 'Loai cong sac', 'connector-types'));
app.get('/admin/reports/summary', renderChargingShellPage('admin/pages/charging-report-summary', 'Bao cao tong hop', 'report-summary'));
app.get('/admin/reports/bookings', renderChargingShellPage('admin/pages/charging-booking-list', 'Lich su dat lich', 'bookings'));
app.get('/admin/reports/station-distribution', renderChargingShellPage('admin/pages/charging-report-distribution', 'Phan bo tram sac', 'station-distribution'));
app.get('/admin/permission-groups', (_req: Request, res: Response) => {
  res.redirect('/admin/system/roles');
});

app.get('/admin/login', async (req: Request, res: Response) => {
  const loginPage = await getLoginPageByHost(req.hostname).catch(() => null);

  res.render('admin/pages/login', {
    pageTitle: loginPage?.title || 'Dang nhap admin',
    stylesheet: '/admin/assets/css/site.css',
    authPageConfig: loginPage,
    faviconHref: loginPage?.iconImage || '',
  });
});

app.get('/admin/register', async (req: Request, res: Response) => {
  const loginPage = await getLoginPageByHost(req.hostname).catch(() => null);

  res.render('admin/pages/register', {
    pageTitle: 'Dang ky admin',
    stylesheet: '/admin/assets/css/site.css',
    authPageConfig: loginPage,
    faviconHref: loginPage?.iconImage || '',
  });
});

app.get('/admin', (req: Request, res: Response) => {
  res.redirect('/admin/dashboard');
});

app.get('/dashboard', (req: Request, res: Response) => {
  res.redirect('/');
});

app.get('/admin/tools', (req: Request, res: Response) => {
  res.render('admin/pages/admin-tools', {
    pageTitle: 'Admin Data Tools',
    stylesheet: '/admin/assets/css/admin-import.css',
  });
});

app.get('/admin/import-tools', (req: Request, res: Response) => {
  res.render('admin/pages/admin-import-tools', {
    pageTitle: 'Admin Import Tools',
    stylesheet: '/admin/assets/css/admin-import.css',
  });
});

app.get('/admin/users/tree', (req: Request, res: Response) => {
  res.render('admin/pages/admin-users', {
    pageTitle: 'Cay nguoi dung quan tri',
    stylesheet: '/admin/assets/css/site.css',
  });
});

app.get('/admin/editor', (req: Request, res: Response) => {
  if (req.query.panel === 'stations') {
    res.redirect('/admin/stations/list');
    return;
  }

  res.render('admin/pages/admin-editor', {
    pageTitle: 'Admin Editor',
    stylesheet: '/admin/assets/css/admin-import.css',
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Tram sac API dang chay' });
});

app.use('/api/admin/auth', authRoutes);
app.use('/api/app/auth', customerAuthRoutes);
app.use('/api/app/profile', profileRoutes);
app.use('/api/app/favorites', favoriteStationRoutes);
app.use('/api/app/activity-logs', activityLogRoutes);
app.use('/api/app/bookings', userBookingRoutes);
app.use('/api/app/charging-sessions', chargingSessionRoutes);
app.use('/api/app/billing', billingRoutes);
app.use('/api/admin/billing', adminBillingRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/users', adminUserTreeRoutes);
app.use('/api/admin/login-pages', loginPageRoutes);
app.use('/api/admin/permission-groups', permissionGroupRoutes);
app.use('/api/admin/roles', permissionGroupRoutes);
app.use('/api/admin/permissions', permissionRoutes);
app.use('/api/admin/sim-types', simTypeRoutes);
app.use('/api/admin/device-types', deviceTypeRoutes);
app.use('/api/admin/connector-types', chargingConnectorTypeRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin/pricings', adminPricingRoutes);
app.use('/api/admin/stations', adminStationRoutes);
app.use('/api/admin/charging-points', adminChargingPointRoutes);
app.use('/api/admin/charging-sessions', adminChargingSessionRoutes);
app.use('/api/admin/occupancy', occupancyRoutes);
app.use('/api/stations', stationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server dang chay tai port ${PORT}`);
});

import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import adminChargingPointRoutes from './routes/admin-charging-point.routes';
import adminBookingRoutes from './routes/admin-booking.routes';
import adminPricingRoutes from './routes/admin-pricing.routes';
import adminStationRoutes from './routes/admin-station.routes';
import adminSwapStationRoutes from './routes/admin-swap-station.routes';
import adminUserTreeRoutes from './routes/admin-user-tree.routes';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import deviceTypeRoutes from './routes/device-type.routes';
import loginPageRoutes from './routes/login-page.routes';
import permissionRoutes from './routes/permission.routes';
import permissionGroupRoutes from './routes/permission-group.routes';
import { getLoginPageByHost } from './services/login-page.service';
import simTypeRoutes from './routes/sim-type.routes';
import stationRoutes from './routes/station.routes';
import superadminRoutes from './routes/superadmin.routes';
import swapStationRoutes from './routes/swap-station.routes';

connectDB();

const app: Application = express();
const publicDir = path.join(process.cwd(), 'public');
const viewsDir = path.join(process.cwd(), 'views');

const renderChargingShellPage = (
  template: string,
  pageTitle: string,
  initialView: string
) => {
  return (_req: Request, res: Response) => {
    res.render(template, {
      pageTitle,
      stylesheet: '/css/site.css',
      locationiqKey: process.env.LOCATIONIQ_API_KEY || '',
      initialView,
      bodyClass: 'map-page',
    });
  };
};

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(publicDir));

app.set('views', viewsDir);
app.set('view engine', 'pug');

app.get('/', renderChargingShellPage('pages/home', 'Tram Sac Hub', 'map'));
app.get('/charging-dashboard', renderChargingShellPage('pages/charging-dashboard', 'Tong quan tram sac', 'map'));
app.get('/admin/accounts', renderChargingShellPage('pages/account-admin-list', 'Quan ly tai khoan', 'accounts'));
app.get('/admin/stations/map', renderChargingShellPage('pages/charging-station-map', 'Ban do tram sac', 'station-map'));
app.get('/admin/stations/list', renderChargingShellPage('pages/charging-station-list', 'Thong tin tram sac', 'station-info'));
app.get('/admin/charging-points', renderChargingShellPage('pages/charging-port-list', 'Quan ly cong sac', 'charging-points'));
app.get('/admin/pricings', renderChargingShellPage('pages/charging-service-list', 'Gia dich vu', 'pricings'));
app.get('/admin/swap-stations', renderChargingShellPage('pages/charging-swap-list', 'Tram doi pin', 'manage-swap'));
app.get('/system/roles', renderChargingShellPage('pages/role-list', 'Vai tro', 'roles'));
app.get('/system/permissions', renderChargingShellPage('pages/permission-list', 'Quyen', 'permissions'));
app.get('/system/login-pages', renderChargingShellPage('pages/login-page-list', 'Trang dang nhap', 'login-pages'));
app.get('/system/sim-types', renderChargingShellPage('pages/sim-type-list', 'Loai sim', 'sim-types'));
app.get('/device-config/device-types', renderChargingShellPage('pages/device-type-list', 'Loai thiet bi', 'device-types'));
app.get('/reports/summary', renderChargingShellPage('pages/charging-report-summary', 'Bao cao tong hop', 'report-summary'));
app.get('/reports/bookings', renderChargingShellPage('pages/charging-booking-list', 'Lich su dat lich', 'bookings'));
app.get('/reports/station-distribution', renderChargingShellPage('pages/charging-report-distribution', 'Phan bo tram sac', 'station-distribution'));
app.get('/admin/permission-groups', (_req: Request, res: Response) => {
  res.redirect('/system/roles');
});

app.get('/login', async (req: Request, res: Response) => {
  const loginPage = await getLoginPageByHost(req.hostname).catch(() => null);

  res.render('pages/login', {
    pageTitle: loginPage?.title || 'Dang nhap admin',
    stylesheet: '/css/site.css',
    authPageConfig: loginPage,
    faviconHref: loginPage?.iconImage || '',
  });
});

app.get('/register', async (req: Request, res: Response) => {
  const loginPage = await getLoginPageByHost(req.hostname).catch(() => null);

  res.render('pages/register', {
    pageTitle: 'Dang ky admin',
    stylesheet: '/css/site.css',
    authPageConfig: loginPage,
    faviconHref: loginPage?.iconImage || '',
  });
});

app.get('/dashboard', (req: Request, res: Response) => {
  res.redirect('/');
});

app.get('/admin-tools', (req: Request, res: Response) => {
  res.render('pages/admin-tools', {
    pageTitle: 'Admin Data Tools',
    stylesheet: '/css/admin-import.css',
  });
});

app.get('/admin-import-tools', (req: Request, res: Response) => {
  res.render('pages/admin-import-tools', {
    pageTitle: 'Admin Import Tools',
    stylesheet: '/css/admin-import.css',
  });
});

app.get('/admin-users', (req: Request, res: Response) => {
  res.render('pages/admin-users', {
    pageTitle: 'Cay nguoi dung quan tri',
    stylesheet: '/css/site.css',
  });
});

app.get('/admin-editor', (req: Request, res: Response) => {
  if (req.query.panel === 'stations') {
    res.redirect('/');
    return;
  }

  res.render('pages/admin-editor', {
    pageTitle: 'Admin Editor',
    stylesheet: '/css/admin-import.css',
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Tram sac API dang chay' });
});

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/users', adminUserTreeRoutes);
app.use('/api/admin/login-pages', loginPageRoutes);
app.use('/api/admin/permission-groups', permissionGroupRoutes);
app.use('/api/admin/roles', permissionGroupRoutes);
app.use('/api/admin/permissions', permissionRoutes);
app.use('/api/admin/sim-types', simTypeRoutes);
app.use('/api/admin/device-types', deviceTypeRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin/pricings', adminPricingRoutes);
app.use('/api/admin/stations', adminStationRoutes);
app.use('/api/admin/charging-points', adminChargingPointRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/admin/swap-stations', adminSwapStationRoutes);
app.use('/api/swap-stations', swapStationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server dang chay tai port ${PORT}`);
});

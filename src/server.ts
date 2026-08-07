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
import permissionGroupRoutes from './routes/permission-group.routes';
import stationRoutes from './routes/station.routes';
import superadminRoutes from './routes/superadmin.routes';
import swapStationRoutes from './routes/swap-station.routes';

connectDB();

const app: Application = express();
const publicDir = path.join(process.cwd(), 'public');
const viewsDir = path.join(process.cwd(), 'views');

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(publicDir));

app.set('views', viewsDir);
app.set('view engine', 'pug');

app.get('/', (req: Request, res: Response) => {
  res.render('pages/home', {
    pageTitle: 'Tram Sac Hub',
    stylesheet: '/css/site.css',
    locationiqKey: process.env.LOCATIONIQ_API_KEY || '',
    bodyClass: 'map-page',
  });
});

app.get('/login', (req: Request, res: Response) => {
  res.render('pages/login', {
    pageTitle: 'Dang nhap admin',
    stylesheet: '/css/site.css',
  });
});

app.get('/register', (req: Request, res: Response) => {
  res.render('pages/register', {
    pageTitle: 'Dang ky admin',
    stylesheet: '/css/site.css',
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
app.use('/api/admin/permission-groups', permissionGroupRoutes);
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

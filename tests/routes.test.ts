import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/server';
import { env } from '../src/config/env';
import { activitiesService } from '../src/modules/activities/activities.service';
import { authService } from '../src/modules/auth/auth.service';
import { citiesService } from '../src/modules/cities/cities.service';
import { publicService } from '../src/modules/public/public.service';
import { stopsService } from '../src/modules/stops/stops.service';
import { tripsService } from '../src/modules/trips/trips.service';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'tester@traveloop.test',
  name: 'Test Traveler',
  avatarUrl: null,
  travelerProfile: 'solo' as const,
  isAdmin: false,
  createdAt: '2026-05-10T00:00:00.000Z'
};

const city = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Jaipur',
  state: 'Rajasthan',
  country: 'India',
  countryCode: 'IN',
  latitude: 26.9124,
  longitude: 75.7873,
  costIndex: 'medium' as const,
  areaType: 'city',
  bestSeason: 'Oct-Feb',
  isRegionalGem: false,
  thumbnailUrl: null
};

const trip = {
  id: '33333333-3333-4333-8333-333333333333',
  userId: user.id,
  title: 'Rajasthan Loop',
  description: null,
  coverPhotoUrl: null,
  startDate: '2026-06-01',
  endDate: '2026-06-05',
  tripType: 'solo' as const,
  budgetCapUsd: 500,
  vibe: 'comfort' as const,
  isPublic: false,
  publicSlug: null,
  status: 'planning' as const,
  createdAt: '2026-05-10T00:00:00.000Z',
  updatedAt: '2026-05-10T00:00:00.000Z'
};

const stop = {
  id: '44444444-4444-4444-8444-444444444444',
  tripId: trip.id,
  cityId: city.id,
  orderIndex: 0,
  arrivalDate: '2026-06-01',
  departureDate: '2026-06-03',
  notes: null,
  accommodationName: null,
  accommodationCost: null
};

const activity = {
  id: '55555555-5555-4555-8555-555555555555',
  cityId: city.id,
  name: 'Heritage walk in Jaipur',
  category: 'cultural',
  tripTypeTags: ['solo'],
  estimatedCostUsd: 18,
  durationHours: 2.5,
  description: null,
  imageUrl: null
};

const stopActivity = {
  id: '66666666-6666-4666-8666-666666666666',
  stopId: stop.id,
  activityId: activity.id,
  scheduledTime: null,
  actualCostUsd: null,
  isCompleted: false
};

jest.mock('../src/modules/auth/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn()
  }
}));

jest.mock('../src/modules/cities/cities.service', () => ({
  citiesService: {
    list: jest.fn(),
    getById: jest.fn()
  }
}));

jest.mock('../src/modules/activities/activities.service', () => ({
  activitiesService: {
    list: jest.fn(),
    getById: jest.fn(),
    assignToStop: jest.fn(),
    removeFromStop: jest.fn()
  }
}));

jest.mock('../src/modules/trips/trips.service', () => ({
  tripsService: {
    list: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    publish: jest.fn(),
    budget: jest.fn()
  }
}));

jest.mock('../src/modules/stops/stops.service', () => ({
  stopsService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    reorder: jest.fn()
  }
}));

jest.mock('../src/modules/public/public.service', () => ({
  publicService: {
    getTripBySlug: jest.fn()
  }
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedCitiesService = citiesService as jest.Mocked<typeof citiesService>;
const mockedActivitiesService = activitiesService as jest.Mocked<typeof activitiesService>;
const mockedTripsService = tripsService as jest.Mocked<typeof tripsService>;
const mockedStopsService = stopsService as jest.Mocked<typeof stopsService>;
const mockedPublicService = publicService as jest.Mocked<typeof publicService>;

const authCookie = (): string => {
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: 'user',
      isAdmin: false
    },
    env.JWT_SECRET
  );
  return `token=${token}`;
};

describe('implemented API route contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('covers auth endpoints', async () => {
    mockedAuthService.register.mockResolvedValueOnce({ user, token: 'register.jwt' });
    mockedAuthService.login.mockResolvedValueOnce({ user, token: 'login.jwt' });
    mockedAuthService.me.mockResolvedValueOnce(user);
    mockedAuthService.forgotPassword.mockResolvedValueOnce();
    mockedAuthService.resetPassword.mockResolvedValueOnce();

    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: user.email, password: 'password123', name: user.name, travelerProfile: 'solo' })
      .expect(201);
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'password123' })
      .expect(200);
    await request(app).get('/api/v1/auth/me').set('Cookie', [authCookie()]).expect(200);
    await request(app).post('/api/v1/auth/logout').set('Cookie', [authCookie()]).expect(200);
    await request(app).post('/api/v1/auth/forgot-password').send({ email: user.email }).expect(200);
    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ email: user.email, otp: '123456', newPassword: 'newpass123' })
      .expect(200);
  });

  it('covers public city and activity endpoints', async () => {
    mockedCitiesService.list.mockResolvedValueOnce({
      data: [city],
      meta: { total: 1, page: 1, limit: 20 }
    });
    mockedCitiesService.getById.mockResolvedValueOnce({ ...city, activities: [activity] });
    mockedActivitiesService.list.mockResolvedValueOnce({
      data: [activity],
      meta: { total: 1, page: 1, limit: 20 }
    });
    mockedActivitiesService.getById.mockResolvedValueOnce(activity);

    await request(app).get('/api/v1/cities?page=1&limit=20').expect(200);
    await request(app).get(`/api/v1/cities/${city.id}`).expect(200);
    await request(app).get('/api/v1/activities?page=1&limit=20').expect(200);
    await request(app).get(`/api/v1/activities/${activity.id}`).expect(200);
  });

  it('covers trip endpoints', async () => {
    mockedTripsService.list.mockResolvedValueOnce({
      data: [trip],
      meta: { total: 1, page: 1, limit: 20 }
    });
    mockedTripsService.create.mockResolvedValueOnce(trip);
    mockedTripsService.getById.mockResolvedValueOnce({ ...trip, stops: [stop] });
    mockedTripsService.update.mockResolvedValueOnce({ ...trip, title: 'Updated Trip' });
    mockedTripsService.delete.mockResolvedValueOnce();
    mockedTripsService.publish.mockResolvedValueOnce({ publicSlug: 'rajasthan-loop' });
    mockedTripsService.budget.mockResolvedValueOnce({
      tripId: trip.id,
      totalBudgetCapUsd: 500,
      totalSpentUsd: 0,
      byDay: [],
      byCategory: [],
      isOverBudget: false,
      remainingUsd: 500
    });

    await request(app).get('/api/v1/trips?page=1&limit=20').set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .post('/api/v1/trips')
      .set('Cookie', [authCookie()])
      .send({
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        tripType: trip.tripType,
        budgetCapUsd: trip.budgetCapUsd,
        vibe: trip.vibe
      })
      .expect(201);
    await request(app).get(`/api/v1/trips/${trip.id}`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .put(`/api/v1/trips/${trip.id}`)
      .set('Cookie', [authCookie()])
      .send({ title: 'Updated Trip' })
      .expect(200);
    await request(app).get(`/api/v1/trips/${trip.id}/budget`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/publish`)
      .set('Cookie', [authCookie()])
      .send({ isPublic: true })
      .expect(200);
    await request(app).delete(`/api/v1/trips/${trip.id}`).set('Cookie', [authCookie()]).expect(204);
  });

  it('covers stop and stop activity endpoints', async () => {
    mockedStopsService.list.mockResolvedValueOnce([stop]);
    mockedStopsService.create.mockResolvedValueOnce(stop);
    mockedStopsService.update.mockResolvedValueOnce({ ...stop, notes: 'Updated' });
    mockedStopsService.reorder.mockResolvedValueOnce([stop]);
    mockedStopsService.delete.mockResolvedValueOnce();
    mockedActivitiesService.assignToStop.mockResolvedValueOnce(stopActivity);
    mockedActivitiesService.removeFromStop.mockResolvedValueOnce();

    await request(app).get(`/api/v1/trips/${trip.id}/stops`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .post(`/api/v1/trips/${trip.id}/stops`)
      .set('Cookie', [authCookie()])
      .send({
        cityId: city.id,
        orderIndex: 0,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate
      })
      .expect(201);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/stops/reorder`)
      .set('Cookie', [authCookie()])
      .send({ stopOrders: [{ id: stop.id, orderIndex: 0 }] })
      .expect(200);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/stops/${stop.id}`)
      .set('Cookie', [authCookie()])
      .send({ notes: 'Updated' })
      .expect(200);
    await request(app)
      .post(`/api/v1/trips/${trip.id}/stops/${stop.id}/activities`)
      .set('Cookie', [authCookie()])
      .send({ activityId: activity.id })
      .expect(201);
    await request(app)
      .delete(`/api/v1/trips/${trip.id}/stops/${stop.id}/activities/${stopActivity.id}`)
      .set('Cookie', [authCookie()])
      .expect(204);
    await request(app)
      .delete(`/api/v1/trips/${trip.id}/stops/${stop.id}`)
      .set('Cookie', [authCookie()])
      .expect(204);
  });

  it('covers public trip sharing endpoint', async () => {
    mockedPublicService.getTripBySlug.mockResolvedValueOnce({ ...trip, isPublic: true });

    await request(app).get('/api/v1/public/trips/rajasthan-loop').expect(200);
  });
});

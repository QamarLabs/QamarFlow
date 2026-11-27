import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp, register } from './helpers.js';

describe('auth', () => {
  it('registers, logs in, refreshes with the cookie and logs out', async () => {
    const { app } = makeApp();
    const reg = await request(app).post('/api/auth/register').send({ email: 'Ali@Example.com', password: 'password123' });
    expect(reg.status).toBe(201);
    expect(reg.body.user).toMatchObject({ email: 'ali@example.com', username: 'ali' });
    expect(reg.body.user.passwordHash).toBeUndefined();
    expect(String(reg.headers['set-cookie'])).toMatch(/qf_refresh=.*HttpOnly/);

    const dup = await request(app).post('/api/auth/register').send({ email: 'ali@example.com', password: 'password123' });
    expect(dup.status).toBe(409);

    const bad = await request(app).post('/api/auth/login').send({ email: 'ali@example.com', password: 'wrong-pass' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('UNAUTHORIZED');

    const agent = request.agent(app);
    const login = await agent.post('/api/auth/login').send({ email: 'ali@example.com', password: 'password123' });
    expect(login.status).toBe(200);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(me.body.user.email).toBe('ali@example.com');

    const refreshed = await agent.post('/api/auth/refresh');
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeTruthy();

    expect((await agent.post('/api/auth/logout')).status).toBe(204);
    expect((await agent.post('/api/auth/refresh')).status).toBe(401);
  });

  it('rejects requests without a valid access token', async () => {
    const { app } = makeApp();
    expect((await request(app).get('/api/boards')).status).toBe(401);
    expect((await request(app).get('/api/boards').set('Authorization', 'Bearer nope')).status).toBe(401);
  });

  it('validates the register body', async () => {
    const { app } = makeApp();
    const res = await request(app).post('/api/auth/register').send({ email: 'x@y.z', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    await register(app, 'ok@example.com');
  });
});

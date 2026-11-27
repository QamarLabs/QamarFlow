import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp, register } from './helpers.js';

describe('boards', () => {
  it('supports CRUD for the owner and hides boards from non-members', async () => {
    const { app } = makeApp();
    const owner = await register(app, 'owner@example.com');
    const stranger = await register(app, 'stranger@example.com');

    const created = await request(app).post('/api/boards').set(owner.auth).send({ name: '  Roadmap ' });
    expect(created.status).toBe(201);
    const board = created.body.board;
    expect(board).toMatchObject({ name: 'Roadmap', role: 'owner', ownerId: owner.user.id });

    expect((await request(app).get('/api/boards').set(owner.auth)).body.boards).toHaveLength(1);
    expect((await request(app).get('/api/boards').set(stranger.auth)).body.boards).toHaveLength(0);

    const detail = await request(app).get(`/api/boards/${board.id}`).set(owner.auth);
    expect(detail.body.board.members).toHaveLength(1);
    expect(detail.body.board.members[0].role).toBe('owner');

    // Non-members cannot read, edit or delete.
    expect((await request(app).get(`/api/boards/${board.id}`).set(stranger.auth)).status).toBe(404);
    expect((await request(app).patch(`/api/boards/${board.id}`).set(stranger.auth).send({ name: 'x' })).status).toBe(404);
    expect((await request(app).delete(`/api/boards/${board.id}`).set(stranger.auth)).status).toBe(404);
    expect((await request(app).post(`/api/boards/${board.id}/columns`).set(stranger.auth).send({ name: 'c' })).status).toBe(404);

    const patched = await request(app).patch(`/api/boards/${board.id}`).set(owner.auth)
      .send({ name: 'Renamed', backgroundImage: 'https://images.unsplash.com/photo-1' });
    expect(patched.status).toBe(200);
    expect(patched.body.board.name).toBe('Renamed');

    expect((await request(app).patch(`/api/boards/${board.id}`).set(owner.auth).send({ backgroundImage: 'javascript:alert(1)' })).status).toBe(400);
    expect((await request(app).post('/api/boards').set(owner.auth).send({ name: '' })).status).toBe(400);

    expect((await request(app).delete(`/api/boards/${board.id}`).set(owner.auth)).status).toBe(204);
    expect((await request(app).get(`/api/boards/${board.id}`).set(owner.auth)).status).toBe(404);
  });

  it('lets invited members edit but only the owner delete', async () => {
    const { app, mailer } = makeApp();
    const owner = await register(app, 'owner@example.com');
    const guest = await register(app, 'guest@example.com');
    const board = (await request(app).post('/api/boards').set(owner.auth).send({ name: 'Team' })).body.board;

    const inv = await request(app).post(`/api/boards/${board.id}/invitations`).set(owner.auth).send({ email: 'guest@example.com' });
    expect(inv.status).toBe(201);
    expect(mailer.sent).toHaveLength(1);
    const token = decodeURIComponent(/\/invite\/([^"\s]+)/.exec(mailer.sent[0].text)![1]);

    expect((await request(app).get(`/api/invitations/${token}`)).body.invitation).toMatchObject({ boardName: 'Team', status: 'pending' });
    expect((await request(app).post(`/api/invitations/${token}/accept`).set(owner.auth)).status).toBe(403);
    const accepted = await request(app).post(`/api/invitations/${token}/accept`).set(guest.auth);
    expect(accepted.body).toEqual({ boardId: board.id });

    expect((await request(app).patch(`/api/boards/${board.id}`).set(guest.auth).send({ name: 'Team 2' })).status).toBe(200);
    expect((await request(app).delete(`/api/boards/${board.id}`).set(guest.auth)).status).toBe(403);
  });

  it('reorders columns in one call', async () => {
    const { app } = makeApp();
    const owner = await register(app, 'o@example.com');
    const board = (await request(app).post('/api/boards').set(owner.auth).send({ name: 'B' })).body.board;
    const ids: string[] = [];
    for (const name of ['a', 'b', 'c']) {
      ids.push((await request(app).post(`/api/boards/${board.id}/columns`).set(owner.auth).send({ name })).body.column.id);
    }
    const res = await request(app).put(`/api/boards/${board.id}/columns/order`).set(owner.auth).send({ columnIds: [ids[2], ids[0], ids[1]] });
    expect(res.body.columns.map((c: { name: string }) => c.name)).toEqual(['c', 'a', 'b']);
    expect((await request(app).put(`/api/boards/${board.id}/columns/order`).set(owner.auth).send({ columnIds: [ids[0]] })).status).toBe(400);
  });
});

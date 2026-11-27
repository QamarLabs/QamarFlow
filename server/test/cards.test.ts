import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp, register } from './helpers.js';

type CardDto = { id: string; title: string; columnId: string; sequence: number };

async function setup() {
  const { app } = makeApp();
  const owner = await register(app, 'owner@example.com');
  const board = (await request(app).post('/api/boards').set(owner.auth).send({ name: 'B' })).body.board;
  const col = async (name: string) =>
    (await request(app).post(`/api/boards/${board.id}/columns`).set(owner.auth).send({ name })).body.column.id as string;
  const todo = await col('todo');
  const done = await col('done');
  const card = async (columnId: string, title: string) =>
    (await request(app).post(`/api/boards/${board.id}/columns/${columnId}/cards`).set(owner.auth).send({ title })).body.card as CardDto;
  return { app, owner, board, todo, done, card };
}

const order = (cards: CardDto[], columnId: string) =>
  cards.filter((c) => c.columnId === columnId).sort((a, b) => a.sequence - b.sequence).map((c) => c.title);

describe('cards', () => {
  it('moves a card between columns and renumbers both, transactionally', async () => {
    const { app, owner, board, todo, done, card } = await setup();
    const a = await card(todo, 'A');
    await card(todo, 'B');
    await card(todo, 'C');
    await card(done, 'X');

    const res = await request(app).put(`/api/boards/${board.id}/cards/order`).set(owner.auth)
      .send({ cardId: a.id, toColumnId: done, toIndex: 1 });
    expect(res.status).toBe(200);
    expect(order(res.body.cards, todo)).toEqual(['B', 'C']);
    expect(order(res.body.cards, done)).toEqual(['X', 'A']);
    const seqs = res.body.cards.filter((c: CardDto) => c.columnId === todo).map((c: CardDto) => c.sequence).sort();
    expect(seqs).toEqual([0, 1]);

    // Reorder within the same column; out-of-range index is clamped.
    const res2 = await request(app).put(`/api/boards/${board.id}/cards/order`).set(owner.auth)
      .send({ cardId: a.id, toColumnId: done, toIndex: 0 });
    expect(order(res2.body.cards, done)).toEqual(['A', 'X']);
    const res3 = await request(app).put(`/api/boards/${board.id}/cards/order`).set(owner.auth)
      .send({ cardId: a.id, toColumnId: todo, toIndex: 99 });
    expect(order(res3.body.cards, todo)).toEqual(['B', 'C', 'A']);
  });

  it('rejects moves by non-members and into foreign columns', async () => {
    const { app, owner, board, todo, card } = await setup();
    const a = await card(todo, 'A');
    const stranger = await register(app, 'stranger@example.com');
    const other = (await request(app).post('/api/boards').set(stranger.auth).send({ name: 'Other' })).body.board;
    const otherCol = (await request(app).post(`/api/boards/${other.id}/columns`).set(stranger.auth).send({ name: 'x' })).body.column.id;

    expect((await request(app).put(`/api/boards/${board.id}/cards/order`).set(stranger.auth)
      .send({ cardId: a.id, toColumnId: todo, toIndex: 0 })).status).toBe(404);
    expect((await request(app).put(`/api/boards/${board.id}/cards/order`).set(owner.auth)
      .send({ cardId: a.id, toColumnId: otherCol, toIndex: 0 })).status).toBe(404);
  });

  it('sanitises description HTML and enforces member assignees', async () => {
    const { app, owner, board, todo, card } = await setup();
    const a = await card(todo, 'A');
    const res = await request(app).patch(`/api/boards/${board.id}/cards/${a.id}`).set(owner.auth).send({
      description: '<p class="ql-align-center" onclick="x()">Hi<script>alert(1)</script><img src=x onerror=y></p>',
      label: { type: 'Bug', bg: 'red' }, assigneeId: owner.user.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.card.description).toBe('<p class="ql-align-center">Hi</p>');
    expect(res.body.card.label).toEqual({ type: 'Bug', bg: 'red' });

    const stranger = await register(app, 's@example.com');
    expect((await request(app).patch(`/api/boards/${board.id}/cards/${a.id}`).set(owner.auth)
      .send({ assigneeId: stranger.user.id })).status).toBe(400);
  });
});

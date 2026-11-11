import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { type Move } from '~/types/Move';

const frameData = (
  characterName: string,
  moves: Move[],
): CharacterFrameDataPage => ({
  characterName,
  editUrl: 'https://docs.google.com/spreadsheets/d/sheet',
  moves,
});
const kazuya1 = { id: 'Kazuya-1', characterId: 'kazuya' } as Move;
const kazuya2 = { id: 'Kazuya-2', characterId: 'kazuya' } as Move;
const jack1 = { id: 'Jack-8-1', characterId: 'jack-8' } as Move;
const allFrameData = frameData('mokujin', [kazuya1, jack1, kazuya2]);

// the cache lives in the module, so every test gets a new one
const importModule = () => import('./frameDataCache');
beforeEach(() => {
  vi.resetModules();
});

describe('loadFrameDataWithCache', () => {
  test('loads from the server and caches the frame data of every character', async () => {
    const { loadFrameDataWithCache } = await importModule();
    const serverLoader = vi.fn(async () => allFrameData);

    expect(await loadFrameDataWithCache(serverLoader)).toBe(allFrameData);
    expect(await loadFrameDataWithCache(serverLoader)).toBe(allFrameData);
    expect(serverLoader).toHaveBeenCalledTimes(1);
  });

  test('makes the frame data of a character from the cache', async () => {
    const { loadFrameDataWithCache } = await importModule();
    await loadFrameDataWithCache(async () => allFrameData);

    const serverLoader = vi.fn(async () => frameData('kazuya', []));
    expect(await loadFrameDataWithCache(serverLoader, 'kazuya')).toEqual(
      frameData('kazuya', [kazuya1, kazuya2]),
    );
    expect(serverLoader).not.toHaveBeenCalled();
  });

  test('does not cache the frame data of one character', async () => {
    const { loadFrameDataWithCache } = await importModule();
    const kazuya = frameData('kazuya', [kazuya1, kazuya2]);
    const serverLoader = vi.fn(async () => kazuya);

    await loadFrameDataWithCache(serverLoader, 'kazuya');
    expect(await loadFrameDataWithCache(serverLoader, 'kazuya')).toBe(kazuya);
    expect(serverLoader).toHaveBeenCalledTimes(2);
  });

  test('is not found for a character without frame data', async () => {
    const { loadFrameDataWithCache } = await importModule();
    await loadFrameDataWithCache(async () => allFrameData);

    const error = await loadFrameDataWithCache(
      async () => allFrameData,
      'unknown',
    ).catch((e) => e);
    expect(error).toMatchObject({ init: { status: 404 } });
  });
});

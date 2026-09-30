import {ApiClient, ApiError} from '../src/infrastructure/api/ApiClient';
import {DummyJsonRecipeApi} from '../src/infrastructure/api/DummyJsonRecipeApi';

const fetchMock = jest.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

describe('API layer', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('maps online recipes into local domain entities', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        recipes: [
          {
            id: 3,
            name: 'Chocolate Cookies',
            ingredients: ['Flour', 'Chocolate'],
            instructions: ['Mix', 'Bake'],
            image: 'https://example.com/cookies.png',
            mealType: ['Snack', 'Dessert'],
            tags: ['Baking'],
          },
        ],
      }),
    });

    const api = new DummyJsonRecipeApi(new ApiClient('https://example.com'));
    const recipes = await api.getFeatured();

    expect(recipes[0].id).toBe('online-3');
    expect(recipes[0].typeId).toBe('dessert');
    expect(recipes[0].validate()).toEqual([]);
  });

  it('converts unsuccessful responses into clear API errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({message: 'Invalid credentials'}),
    });

    const client = new ApiClient('https://example.com');
    await expect(client.request('/auth/login')).rejects.toEqual(
      new ApiError('Invalid credentials', 401),
    );
  });
});

const DEFAULT_TIMEOUT_MS = 12_000;

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  public constructor(private readonly baseUrl: string) {}

  public async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });
      const body = (await response.json()) as T & {message?: string};

      if (!response.ok) {
        throw new ApiError(
          body.message ?? `Request failed with status ${response.status}.`,
          response.status,
        );
      }

      return body;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('The request timed out. Please try again.', 408);
      }
      throw new ApiError(
        'Unable to reach the server. Check your connection and try again.',
        0,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

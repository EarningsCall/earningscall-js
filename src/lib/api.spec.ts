import { getTranscript } from './api';

describe('api', () => {
  test('getTranscript with wrong bad quarter parameter throws 400 error', async () => {
    // Mock API response for 400 error
    const mockResponse = {
      ok: false,
      status: 400,
      headers: new Headers(),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    await expect(getTranscript('NASDAQ', 'ABC', 2022, 10, 1)).rejects.toThrow(
      'Bad request',
    );
  });

  test('getTranscript throws unexpected http 500 internal server error', async () => {
    const mockResponse = {
      ok: false,
      status: 999,
      headers: new Headers(),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    await expect(getTranscript('NASDAQ', 'ABC', 2022, 1, 1)).rejects.toThrow(
      'HTTP error status: 999',
    );
  });

  test('validate user agent headers on HTTP request', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: jest.fn().mockResolvedValue({}),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    const result = await getTranscript('NASDAQ', 'ABC', 2022, 1, 1);
    expect(result).toEqual({});
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-EarningsCall-Version': expect.stringMatching(/^\d+\.\d+\.\d+$/),
          'User-Agent': expect.stringContaining('EarningsCallJavaScript/'),
        }),
      }),
    );
  });
});

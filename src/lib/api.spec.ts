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
});

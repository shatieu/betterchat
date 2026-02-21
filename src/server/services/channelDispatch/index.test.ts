import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { dispatchToChannel } from './index';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('dispatchToChannel', () => {
  describe('webhook', () => {
    it('should dispatch to webhook with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await dispatchToChannel(
        'webhook',
        { url: 'https://example.com/hook' },
        { content: 'Test message' },
      );

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/hook', {
        body: expect.any(String),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        method: 'POST',
      });
    });

    it('should dispatch text payload format', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

      await dispatchToChannel(
        'webhook',
        { payloadFormat: 'text' as const, url: 'https://example.com/hook' },
        { content: 'Plain text' },
      );

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/hook', {
        body: 'Plain text',
        headers: expect.objectContaining({ 'Content-Type': 'text/plain' }),
        method: 'POST',
      });
    });

    it('should include custom headers', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

      await dispatchToChannel(
        'webhook',
        {
          headers: { Authorization: 'Bearer token' },
          url: 'https://example.com/hook',
        },
        { content: 'Test' },
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/hook',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
        }),
      );
    });

    it('should return error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await dispatchToChannel(
        'webhook',
        { url: 'https://example.com/hook' },
        { content: 'Test' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await dispatchToChannel(
        'webhook',
        { url: 'https://example.com/hook' },
        { content: 'Test' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('slack', () => {
    it('should dispatch to Slack webhook', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await dispatchToChannel(
        'slack',
        { webhookUrl: 'https://hooks.slack.com/services/test' },
        { content: 'Slack message' },
      );

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://hooks.slack.com/services/test', {
        body: expect.stringContaining('Slack message'),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
    });

    it('should include channel and username', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

      await dispatchToChannel(
        'slack',
        {
          channel: '#reports',
          username: 'TestBot',
          webhookUrl: 'https://hooks.slack.com/services/test',
        },
        { content: 'Test' },
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.channel).toBe('#reports');
      expect(body.username).toBe('TestBot');
    });
  });

  describe('unknown type', () => {
    it('should return error for unknown channel type', async () => {
      const result = await dispatchToChannel(
        'unknown' as any,
        {} as any,
        { content: 'Test' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown channel type');
    });
  });
});

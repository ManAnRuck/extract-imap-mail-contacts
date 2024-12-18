import { describe, it, expect, vi } from 'vitest';
import { FetchMessageObject, ImapFlow } from 'imapflow';
import { fetchAndProcessMessages, listMailboxes, ContactInfo } from './messageProcessor';

vi.mock('imapflow', () => {
  return {
    ImapFlow: vi.fn().mockImplementation(() => ({
      fetch: vi.fn().mockImplementation(async function* () {
        yield {
          envelope: {
            from: [{
              address: 'test@example.com',
              name: 'Test User'
            }],
          },
        };
      }),
      getMailboxLock: vi.fn().mockResolvedValue({
        release: vi.fn(),
      }),
      list: vi.fn().mockImplementation(async function* () {
        yield { path: 'INBOX' };
      }),
      status: vi.fn().mockResolvedValue({ messages: 1 }),
      mailboxOpen: vi.fn().mockResolvedValue({ exists: 1 })
    })),
  };
});

function createEmailGenerator(emails: string[]) {
    return async function* () {
        for (const email of emails) {
            yield {
                envelope: {
                    from: [{ address: email }],
                },
            };
        }
    } as unknown as () => AsyncGenerator<FetchMessageObject, never, void>;
}

function createListGenerator(paths: string[]) {
    return async () => {
        const responses = paths.map(path => ({ path }));
        return Promise.resolve(responses);
    };
}

describe('fetchAndProcessMessages', () => {
  it('should fetch and process messages with contact names', async () => {
    const client = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    const result = await fetchAndProcessMessages(client, 'INBOX');
    expect(result).toEqual({
      mailbox: 'INBOX',
      contacts: new Set([{
        email: 'test@example.com',
        name: 'Test User'
      }])
    });
  });

  it('should fetch and process messages from specified mailbox', async () => {
    const client = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    const result = await fetchAndProcessMessages(client, 'INBOX');
    expect(result).toEqual({
      mailbox: 'INBOX',
      contacts: new Set([{
        email: 'test@example.com',
        name: 'Test User'
      }])
    });
  });

  it('should use INBOX as default mailbox', async () => {
    const client = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    const result = await fetchAndProcessMessages(client);
    expect(result).toEqual({
      mailbox: 'INBOX',
      contacts: new Set([{
        email: 'test@example.com',
        name: 'Test User'
      }])
    });
  });

  it('should handle errors in mailbox processing', async () => {
    const client = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock status to throw an error
    client.status = vi.fn().mockRejectedValue(new Error('Mailbox error'));
    
    const result = await fetchAndProcessMessages(client, 'Sent');
    
    expect(consoleSpy).not.toHaveBeenCalled(); // We don't use console.warn anymore
    expect(result).toEqual({
      mailbox: 'Sent',
      contacts: new Set([]),
      error: 'Mailbox error'
    });
  });

  it('should handle duplicate emails with different names using the latest name', async () => {
    const client = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    
    // Mock fetch to return multiple messages with same email but different names
    client.fetch = vi.fn().mockImplementation(async function* () {
      yield {
        envelope: {
          from: [{
            address: 'test@example.com',
            name: 'Old Name'
          }],
        },
      };
      yield {
        envelope: {
          from: [{
            address: 'test@example.com',
            name: 'New Name'
          }],
        },
      };
    });

    const result = await fetchAndProcessMessages(client, 'INBOX');
    
    expect(result).toEqual({
      mailbox: 'INBOX',
      contacts: new Set([{
        email: 'test@example.com',
        name: 'New Name'
      }])
    });
  });

  it('should preserve existing name if new message has no name', async () => {
    const client = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    
    client.fetch = vi.fn().mockImplementation(async function* () {
      yield {
        envelope: {
          from: [{
            address: 'test@example.com',
            name: 'Existing Name'
          }],
        },
      };
      yield {
        envelope: {
          from: [{
            address: 'test@example.com',
            name: undefined
          }],
        },
      };
    });

    const result = await fetchAndProcessMessages(client, 'INBOX');
    
    expect(result).toEqual({
      mailbox: 'INBOX',
      contacts: new Set([{
        email: 'test@example.com',
        name: 'Existing Name'
      }])
    });
  });
});

describe('listMailboxes', () => {
  it('should list all available mailboxes', async () => {
    const testClient = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    
    vi.spyOn(testClient, 'list').mockResolvedValue([
      { path: 'INBOX', name: 'INBOX', delimiter: '/', flags: new Set<string>(), specialUse: '', listed: true, subscribed: true },
      { path: 'Sent', name: 'Sent', delimiter: '/', flags: new Set<string>(), specialUse: '', listed: true, subscribed: true },
      { path: 'Drafts', name: 'Drafts', delimiter: '/', flags: new Set<string>(), specialUse: '', listed: true, subscribed: true }
    ]);

    const mailboxes = await listMailboxes(testClient);
    expect(mailboxes).toEqual(['INBOX', 'Sent', 'Drafts']);
  });

  it('should return empty array when no mailboxes exist', async () => {
    const testClient = new ImapFlow({ host: 'localhost', port: 993, auth: { user: 'user', pass: 'pass' } });
    
    vi.spyOn(testClient, 'list').mockResolvedValue([]);

    const mailboxes = await listMailboxes(testClient);
    expect(mailboxes).toEqual([]);
  });
});
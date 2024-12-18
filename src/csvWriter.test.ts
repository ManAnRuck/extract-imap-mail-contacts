import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { writeContactsToCsv } from './csvWriter';
import { writeFile } from 'fs/promises';
import { ContactInfo } from './messageProcessor';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

describe('writeContactsToCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate correct CSV format', async () => {
    const contacts = new Set<ContactInfo>([
      { email: 'test@example.com', name: 'Test User' }
    ]);

    await writeContactsToCsv(contacts, 'INBOX');

    const expectedCsv = 
      '"email","name","attributes"\n' +
      '"test@example.com","Test User","{""list"":""INBOX""}"';

    expect(writeFile).toHaveBeenCalledWith(
      './output/INBOX.csv',
      expectedCsv
    );
  });

  it('should handle multiple contacts', async () => {
    const contacts = new Set<ContactInfo>([
      { email: 'test1@example.com', name: 'User 1' },
      { email: 'test2@example.com', name: 'User 2' }
    ]);

    await writeContactsToCsv(contacts, 'INBOX');

    const expectedCsv = 
      '"email","name","attributes"\n' +
      '"test1@example.com","User 1","{""list"":""INBOX""}"\n' +
      '"test2@example.com","User 2","{""list"":""INBOX""}"';

    expect(writeFile).toHaveBeenCalledWith(
      './output/INBOX.csv',
      expectedCsv
    );
  });

  it('should handle contacts without names', async () => {
    const contacts = new Set<ContactInfo>([
      { email: 'test@example.com' }
    ]);

    await writeContactsToCsv(contacts, 'INBOX');

    const expectedCsv = 
      '"email","name","attributes"\n' +
      '"test@example.com","","{""list"":""INBOX""}"';

    expect(writeFile).toHaveBeenCalledWith(
      './output/INBOX.csv',
      expectedCsv
    );
  });

  it('should handle special characters in names and mailbox names', async () => {
    const contacts = new Set<ContactInfo>([
      { email: 'test@example.com', name: 'O\'Connor, John "Johnny"' }
    ]);

    await writeContactsToCsv(contacts, 'INBOX.3 – Volunteers');

    const expectedCsv = 
      '"email","name","attributes"\n' +
      '"test@example.com","O\'Connor, John "Johnny"","{""list"":""INBOX.3 – Volunteers""}"';

    expect(writeFile).toHaveBeenCalledWith(
      './output/INBOX.3 – Volunteers.csv',
      expectedCsv
    );
  });

  it('should use custom output path when provided', async () => {
    const contacts = new Set<ContactInfo>([
      { email: 'test@example.com', name: 'Test User' }
    ]);

    await writeContactsToCsv(contacts, 'INBOX', './custom/path');

    expect(writeFile).toHaveBeenCalledWith(
      './custom/path/INBOX.csv',
      expect.any(String)
    );
  });
});

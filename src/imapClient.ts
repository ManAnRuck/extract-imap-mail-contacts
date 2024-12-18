
import { ImapFlow } from 'imapflow';
import config from './config';

export async function createImapClient(): Promise<ImapFlow> {
  const client = new ImapFlow({
    host: config.IMAP_HOST,
    port: config.PORT,
    secure: true,
    auth: {
      user: config.IMAP_USER,
      pass: config.IMAP_PASS
    },
    logger: false
  });
  await client.connect();
  return client;
}
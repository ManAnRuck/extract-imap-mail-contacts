import { mkdir } from 'fs/promises';
import { validateConfig } from './config';
import { createImapClient } from './imapClient';
import { fetchAndProcessMessages, listMailboxes } from './messageProcessor';
import { writeContactsToCsv } from './csvWriter';

async function main() {
  validateConfig();
  const client = await createImapClient();

  // Create output directory
  const outputPath = './output';
  await mkdir(outputPath, { recursive: true });

  const mailboxes = await listMailboxes(client);
  
  for (const mailbox of mailboxes) {
    const result = await fetchAndProcessMessages(client, mailbox);
    
    if (!result.error && result.contacts.size > 0) {
      try {
        const sanitizedMailboxName = mailbox.replace(/[/\\?%*:|"<>]/g, '-');
        await writeContactsToCsv(result.contacts, sanitizedMailboxName, outputPath);
        console.log(`Created CSV for ${mailbox} with ${result.contacts.size} contacts`);
      } catch (error) {
        console.error(`Error writing CSV for ${mailbox}:`, error);
      }
    } else if (result.error) {
      console.error(`Error processing ${mailbox}:`, result.error);
    }
  }

  await client.logout();
  console.log('\nProcessing completed!');
}

main().catch(console.error);
import { validateConfig } from './config';
import { createImapClient } from './imapClient';
import { fetchAndProcessMessages, listMailboxes, MailboxContacts } from './messageProcessor';

async function main() {
  validateConfig();
  const client = await createImapClient();

  const mailboxes = await listMailboxes(client);
  const results: MailboxContacts[] = [];
  
  for (const mailbox of mailboxes) {
    const mailboxResults = await fetchAndProcessMessages(client, mailbox);
    results.push(mailboxResults);
  }

  await client.logout();

  console.log("\nResults per mailbox:");
  results.forEach(({ mailbox, contacts, error }) => {
    console.log(`\n${mailbox}:`);
    if (error) {
      console.log(`Status: ${error}`);
    } else {
      console.log(`Total contacts: ${contacts.size}`);
      if (contacts.size > 0) {
        contacts.forEach(contact => {
          if (contact.name) {
            console.log(`- ${contact.name} <${contact.email}>`);
          } else {
            console.log(`- ${contact.email}`);
          }
        });
      }
    }
  });
}

main().catch(console.error);
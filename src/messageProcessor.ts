import { ImapFlow } from 'imapflow';

export interface ContactInfo {
  email: string;
  name?: string;
}

export interface MailboxContacts {
  mailbox: string;
  contacts: Set<ContactInfo>;
  error?: string;
}

export async function fetchAndProcessMessages(client: ImapFlow, mailbox: string = 'INBOX'): Promise<MailboxContacts> {
  // Use Map instead of Set for temporary storage to handle duplicates
  const contactMap = new Map<string, ContactInfo>();
  
  try {
    // Check if mailbox exists and open it
    const status = await client.status(mailbox, {messages: true});
    if (!status) {
      return { mailbox, contacts: new Set(), error: 'Mailbox not found' };
    }

    const lock = await client.getMailboxLock(mailbox);
    try {
      // Check if mailbox contains messages
      const mailboxInfo = await client.mailboxOpen(mailbox);
      if (mailboxInfo.exists === 0) {
        return { mailbox, contacts: new Set(), error: 'Mailbox is empty' };
      }

      for await (let msg of client.fetch('1:*', { envelope: true })) {
        msg.envelope.from?.forEach(sender => {
          if (sender.address) {
            // Always update the contact info, effectively keeping the latest name
            contactMap.set(sender.address, {
              email: sender.address,
              name: sender.name || contactMap.get(sender.address)?.name
            });
          }
        });
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { mailbox, contacts: new Set(), error: errorMessage };
  }
  
  // Convert Map values to Set for return
  return { mailbox, contacts: new Set(contactMap.values()) };
}

export async function listMailboxes(client: ImapFlow): Promise<string[]> {
  const mailboxes: string[] = [];
  try {
    for await (let mailbox of await client.list()) {
      mailboxes.push(mailbox.path);
    }
  } catch (error) {
    console.error('Error listing mailboxes:', error);
  }
  return mailboxes;
}
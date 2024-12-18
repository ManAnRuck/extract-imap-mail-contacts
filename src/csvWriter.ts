import { writeFile } from 'fs/promises';
import { ContactInfo } from './messageProcessor';

export interface CsvContact {
  email: string;
  name: string;
  attributes: string;
}

function formatJsonForCsv(obj: Record<string, any>): string {
  return JSON.stringify(obj).replace(/"/g, '""');
}

export async function writeContactsToCsv(contacts: Set<ContactInfo>, mailbox: string, outputPath: string = './output'): Promise<void> {
  const csvContacts: CsvContact[] = Array.from(contacts).map(contact => ({
    email: contact.email,
    name: contact.name || '',
    attributes: formatJsonForCsv({ list: mailbox })
  }));

  const csvContent = [
    '"email","name","attributes"',
    ...csvContacts.map(contact => 
      `"${contact.email}","${contact.name}","${contact.attributes}"`
    )
  ].join('\n');

  await writeFile(`${outputPath}/${mailbox}.csv`, csvContent);
}

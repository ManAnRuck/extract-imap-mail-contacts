
# Extract IMAP Mail Contacts

## Overview

Extract IMAP Mail Contacts is a TypeScript-based tool designed to connect to an IMAP server, fetch email contacts from specified mailboxes, and export them into well-formatted CSV files. This tool is ideal for managing and organizing email contacts efficiently.

## Features

- **IMAP Integration**: Connects to any IMAP-compatible email server.
- **Contact Extraction**: Retrieves email addresses and associated names from mailboxes.
- **CSV Export**: Exports contacts into CSV files with customizable output paths.
- **Handling Special Characters**: Properly escapes special characters in email names and mailbox names to ensure CSV integrity.
- **Modular and Type-Safe**: Built with modular functions and TypeScript for type safety.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ManAnRuck/extract-imap-mail-contacts.git
   cd extract-imap-mail-contacts
   ```

2. **Install Dependencies**

   Ensure you have [Node.js](https://nodejs.org/) installed. Then, install the necessary packages:

   ```bash
   pnpm install
   ```

## Configuration

Create a `.env` file by duplicating the `.env.example` file and fill in your IMAP server details:

```env
IMAP_HOST=your-imap-host.com
IMAP_PORT=993
IMAP_USER=your-email@example.com
IMAP_PASS=your-email-password
```

Make sure to replace the placeholder values with your actual IMAP server credentials. The configuration will be automatically loaded when starting the application.
```

## Usage

Run the tool using the following command:

```bash
pnpm dev
```

This will:

1. Validate the configuration.
2. Connect to the IMAP server.
3. List all available mailboxes.
4. Fetch and process contacts from each mailbox.
5. Export the contacts to CSV files in the `./output` directory.

### Custom Output Path

To specify a custom output path, modify the `writeContactsToCsv` function call in `src/index.ts` or pass the desired path as an argument.

## Testing

Run the test suite using:

```bash
npm run test
```

This will execute all tests in the `src/csvWriter.test.ts` file, ensuring the CSV writer functions correctly, including handling special characters and various contact scenarios.

## Project Structure

```
extract-imap-mail-contacts/
├── src/
│   ├── config.ts
│   ├── csvWriter.ts
│   ├── csvWriter.test.ts
│   ├── imapClient.ts
│   ├── index.ts
│   ├── messageProcessor.ts
│   └── messageProcessor.test.ts
├── output/
│   └── *.csv
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your enhancements.

## License

This project is licensed under the [MIT License](LICENSE).

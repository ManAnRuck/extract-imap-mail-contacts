interface Config {
  IMAP_HOST: string;
  PORT: number;
  IMAP_USER: string;
  IMAP_PASS: string;
}

const config: Config = {
  IMAP_HOST: process.env.IMAP_HOST || '',
  PORT: Number(process.env.PORT) || 993,
  IMAP_USER: process.env.IMAP_USER || '',
  IMAP_PASS: process.env.IMAP_PASS || '',
};

export function validateConfig(): void {
  const missingVars: string[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  if (isNaN(config.PORT)) {
    throw new Error('PORT must be a valid number');
  }
}

export default config;

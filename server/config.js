export const TOKEN_SECRET = "MQerkSecretKey";
// Optional: set a strong token in the environment to allow first admin creation
// On Windows PowerShell: $env:ADMIN_BOOTSTRAP_TOKEN = 'your-very-strong-token'
export const ADMIN_BOOTSTRAP_TOKEN = process.env.ADMIN_BOOTSTRAP_TOKEN || null;
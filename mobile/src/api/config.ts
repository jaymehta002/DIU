const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set it to your backend\'s LAN IP.',
  );
}

export { API_URL };

const GOOGLE_CONFIG = {
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ')
};

export const handleGoogleLogin = () => {
  const url = new URL(GOOGLE_CONFIG.auth_uri);
  url.searchParams.append('client_id', GOOGLE_CONFIG.client_id);
  url.searchParams.append('redirect_uri', GOOGLE_CONFIG.redirect_uri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', GOOGLE_CONFIG.scope);
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');
  
  window.location.href = url.toString();
}; 
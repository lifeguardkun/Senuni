// activate OAuth
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

let OAuthClient = null;

// initialize OAuth client 
export const initOAuthClient = (onAuthSuccess) => {
  OAuthClient = google.accounts.oauth2.initTokenClient({
    client_id: OAUTH_CLIENT_ID,
    scope: SCOPES,
    callback: onAuthSuccess,
  });
};

export const signIn = () => {
  if (OAuthClient) {
    OAuthClient.requestAccessToken({ prompt: 'consent' });
  }
};

export const silentSignIn = () => {
  if (OAuthClient) {
    OAuthClient.requestAccessToken({ prompt: '' });
  }
};
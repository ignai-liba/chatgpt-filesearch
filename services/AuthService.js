var {google} = require('googleapis');
/**
 * Service for handling authentication information
 */
class AuthService {
  //static #CLIENT_ID = process.env.CLIENT_ID;
  //static #CLIENT_SECRET = process.env.CLIENT_SECRET;
  //static #REDIRECT_URI = process.env.REDIRECT_URI;
  static #SCOPES = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];

  #oauthClient;

  constructor() {
    this.#oauthClient = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
  }

  generateAuthUrl() {
    return this.#oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: AuthService.#SCOPES,
      include_granted_scopes: true,
      prompt: 'consent'
    });
  }

async handleOAuthRedirect(authCode) {
    const {tokens} = await this.#oauthClient.getToken(authCode);
    return {
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };
  }

  async getNewIDToken(refreshToken) {
    this.#oauthClient.setCredentials({refresh_token: refreshToken});
    const tokens = await this.#oauthClient.refreshAccessToken();
    return tokens.credentials.id_token;
  }

  async getUserData(idToken) {
    const data = await this.#oauthClient.verifyIdToken({idToken});
    return data.getPayload();
  }

  async revokeRefreshToken(refreshToken) {
    await this.#oauthClient.revokeToken(refreshToken);
  }
}

module.exports = AuthService;
const Twilio = require('twilio');

const config = require('./config');
const nameGenerator = require('../name_generator');
// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const newUser = urlParams.get('username');
// Access Token used for Video, IP Messaging, and Sync
const AccessToken = Twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VideoGrant = AccessToken.VideoGrant;
const SyncGrant = AccessToken.SyncGrant;

/**
 * Generate an Access Token for an application user - it generates a random
 * username for the client requesting a token or generates a token with an
 * identity if one is provided.
 *
 * @return {Object}
 *         {Object.identity} String random indentity
 *         {Object.token} String token generated
 */
function tokenGenerator(identity = 0) {
  // Create an access token which we will sign and return to the client
  const token = new AccessToken(
    config.TWILIO_ACCOUNT_SID,
    config.TWILIO_API_KEY,
    config.TWILIO_API_SECRET
  );

  // Assign the provided identity or generate a new one
  token.identity = identity || nameGenerator();

  // Grant the access token Twilio Video capabilities
  const videoGrant = new VideoGrant();
  token.addGrant(videoGrant);

  if (config.TWILIO_CHAT_SERVICE_SID) {
    // Create a "grant" which enables a client to use IPM as a given user,
    // on a given device
    const chatGrant = new ChatGrant({
      serviceSid: config.TWILIO_CHAT_SERVICE_SID
    });
    token.addGrant(chatGrant);
  }

  if (config.TWILIO_SYNC_SERVICE_SID) {
    // Point to a particular Sync service, or use the account default to
    // interact directly with Functions.
    const syncGrant = new SyncGrant({
      serviceSid: config.TWILIO_SYNC_SERVICE_SID || 'default'
    });
    token.addGrant(syncGrant);
  }

  // Serialize the token to a JWT string and include it in a JSON response
  return {
    identity: token.identity,
    token: token.toJwt()
  };
}

module.exports = tokenGenerator;

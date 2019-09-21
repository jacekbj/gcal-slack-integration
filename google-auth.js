const credentials = require('./credentials');
const { google } = require('googleapis');
const { collectionName, setOrUpdate } = require('./store');
const slack = require('./slack');

const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0],
);

module.exports.generateRegisterUrl = function generateRegisterUrl(state) {
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events.readonly',
    ];

    return oauth2Client.generateAuthUrl({
        scope: scopes,
        access_type: 'offline',
        state,
    });
};


module.exports.googleOauthCallbackEndpoint = async function googleOauthCallback(req, res) {
    const { code, state } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    const [team_id, user_id, user_name] = state.split(';');

    await setOrUpdate(`${collectionName}/${team_id}-${user_id}`, {
        tokens,
        slack_team_id: team_id,
        slack_user_id: user_id,
        slack_user_name: user_name,
    });
    slack.sendSlackMessage(`New registration: ${user_name}`);
    res.send('Successfully authorized!')
};

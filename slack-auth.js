const credentials = require('./credentials');
const queryString = require('querystring');
const fetch = require('node-fetch');
const { collectionName, setOrUpdate } = require('./store');

module.exports.getAuthUrl = function getAuthUrl() {
    const params = {
        client_id: credentials.slack.client_id,
        scope:  'users.profile:write',
        redirect_uri: credentials.slack.redirect_uri,
    };

    return `https://slack.com/oauth/authorize?${queryString.stringify(params)}`;
};

module.exports.slackOauthCallbackEndpoint = async function oauthCallback(req, res) {
    const { code } = req.query;

    const params = {
        code,
        client_id: credentials.slack.client_id,
        client_secret: credentials.slack.client_secret,
        redirect_uri: credentials.slack.redirect_uri,
    };

    const resp = await fetch(`https://slack.com/api/oauth.access?${queryString.stringify(params)}`)
        .then(resp => resp.json());
    const { access_token, user_id, team_id, team_name } = resp;

    await setOrUpdate(
        `${collectionName}/${team_id}-${user_id}`,
        {
            team_name,
            slack_access_token: access_token,
        },
    );

    res.send('Successfully authorized Slack account!');
};

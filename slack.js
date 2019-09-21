const fetch = require('node-fetch');
const credentials = require('./credentials');
const googleAuth = require('./google-auth');
const slackAuth = require('./slack-auth');

module.exports.sendSlackMessage = function sendSlackMessage(text) {
    return fetch(credentials.slack.webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
            mrkdwn: true,
        }),
    });
};

module.exports.setUserStatus = function setUserStatus(text, emoji, expiration) {
    return fetch('https://slack.com/api/users.profile.set', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.slack_user_token}`,
        },
        body: JSON.stringify({
            profile: {
                status_text: text,
                status_emoji: emoji,
                status_expiration: expiration,
            }
        }),
    });
};

module.exports.slackActionsEndpoint = function slackActions(req, res) {
    const { team_id, user_id, user_name } = req.body;
    const message = {
        text: 'Please authorize integration to access your Google Calendar account.',
        response_type: 'in_channel',
        attachments: [
            {
                callback_id: 'authorize',
                attachment_type: 'default',
                actions: [
                    {
                        name: 'authorize',
                        text: 'Google',
                        type: 'button',
                        value: 'authorize_google',
                        url: googleAuth.generateRegisterUrl(`${team_id};${user_id};${user_name}`),
                    },
                    {
                        name: 'authorize',
                        text: 'Slack',
                        type: 'button',
                        value: 'authorize_slack',
                        url: slackAuth.getAuthUrl(),
                    },
                ],
            },
        ],
    };

    res.set('Content-Type', 'application/json');
    res.send(message);
};

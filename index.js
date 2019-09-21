const { calendarCheckBackgroundFunction } = require('./calendar');
const { googleOauthCallbackEndpoint } = require('./google-auth');
const { slackActionsEndpoint } = require('./slack');
const { slackOauthCallbackEndpoint } = require('./slack-auth');

module.exports = {
    calendarCheck: calendarCheckBackgroundFunction,
    googleOauthCallback: googleOauthCallbackEndpoint,
    slackActions: slackActionsEndpoint,
    slackOauthCallback: slackOauthCallbackEndpoint,
};

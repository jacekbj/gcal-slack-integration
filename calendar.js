const { google } = require('googleapis');
const isWithinInterval = require('date-fns/isWithinInterval');
const format = require('date-fns/format');
const parseISO = require('date-fns/parseISO');
const addSeconds = require('date-fns/addSeconds');
const getUnixTime = require('date-fns/getUnixTime');
const credentials = require('./credentials');
const slack = require('./slack');
const { forEachToken } = require('./store');

module.exports.calendarCheckBackgroundFunction = function calendarCheck(pubSubEvent, context) {
    forEachToken(
        (doc) => {
            const oAuth2Client = new google.auth.OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0],
            );

            oAuth2Client.setCredentials(doc.tokens);

            setUserStatus(oAuth2Client, doc.slack_user_name);
        },
        (count) => {
            slack.sendSlackMessage(`Run calendar check for ${count} users.`);
        }
    );
};

function setUserStatus(oAuth2Client, slackId) {
    const calendar = google.calendar({
        auth: oAuth2Client,
        version: 'v3',
    });
    const now = new Date();
    let futureEvent;

    // Future events
    calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) {
            return console.log(`${slackId}: The API returned an error: ${err}`);
        }

        futureEvent = res.data.items
            .filter(event => !!event.start.dateTime && event.status === 'confirmed')
            .find(event => {
                return isWithinInterval(
                    parseISO(event.start.dateTime),
                    {
                        start: now,
                        end: addSeconds(now, 60),
                    },
                );
            });

        if (futureEvent) {
            const message = `
                ${slackId}: Found event *${futureEvent.summary}*:
                • start: ${formatDate(parseISO(futureEvent.start.dateTime))}
                • end: ${formatDate(parseISO(futureEvent.end.dateTime))}
            `;

            slack.sendSlackMessage(message);
            slack.setUserStatus('In a meeting', ':calendar:', getUnixTime(parseISO(futureEvent.end.dateTime)));
        } else {
            const message = `${slackId} No future events found.`;

            console.log(message);
        }
    });
}

function formatDate(date) {
    return format(date, 'H:mm');
}

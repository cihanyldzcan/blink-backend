const { Expo } = require('expo-server-sdk');
let expo = new Expo();

exports.sendPush = async (token, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(token)) {
    console.error('Push token is not valid');
    return;
  }

  let messages = [{
    to: token,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  }];

  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log('Push ticket:', ticketChunk);
  } catch (error) {
    console.error('Push error:', error);
  }
};

const GMAIL_API_KEY = process.env.NEXT_PUBLIC_GMAIL_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';


const loadGapiClient = () => {
  return new Promise((resolve) => {
    gapi.load('client', resolve);
  });
};

export const initGapiClient = async () => {
  await loadGapiClient();
  await gapi.client.init({
    apiKey: GMAIL_API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
};

const getMessages = async (query) => {
  const metaMessagesResponse = await gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'q': query,
    'maxResults': 15
  });

  const metamessages = metaMessagesResponse.result.messages || [];

  const messagePromises = metamessages.map((metamessage) =>
    gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': metamessage.id
    })
  );

  const messages = await Promise.all(messagePromises);

  const filteredMessages = messages.map(message => ({
    snippet: message.result.snippet
  }));

  return filteredMessages;
};

export const fetchIncampusMessages = () => {
  return getMessages('from:no-reply-incampus@isc.senshu-u.ac.jp');
};

export const fetchClassroomMessages = () => {
  return getMessages('from:<no-reply@classroom.google.com>');
};
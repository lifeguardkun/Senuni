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
  const metaDataResponse = await gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'q': query,
    'maxResults': 15
  });

  const metaData = metaDataResponse.result.messages || [];

  const messageRequest = metaData.map((metadata) =>
    gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': metadata.id
    })
  );

  const messagesResponse = await Promise.all(messageRequest);

  const filteredMessages = messagesResponse.map(message => {
    const result = message.result;
    const headers = result.payload.headers; // ヘッダー情報の配列

    // ヘッダー配列から特定の名前(Key)の値を探すヘルパー関数
    const getHeaderValue = (name) => {
      const header = headers.find(h => h.name === name);
      return header ? header.value : '';
    };

    return {
      // DBのカラム名 : GmailAPIの値
      gmail_id: result.id,
      snippet: result.snippet,
      subject: getHeaderValue('Subject'), // 件名を取得
      sender: getHeaderValue('From'),     // 送信者を取得
      // internalDateはミリ秒なので、Postgresが読めるISO形式の日付文字列に変換
      received_at: new Date(parseInt(result.internalDate)).toISOString(), 
    };
  });
  
  return filteredMessages;
};

export const fetchIncampusMessages = () => {
  return getMessages('from:no-reply-incampus@isc.senshu-u.ac.jp');
};

export const fetchClassroomMessages = () => {
  return getMessages('from:<no-reply@classroom.google.com>');
};
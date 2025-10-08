import { useState, useRef} from 'react';
import Script from 'next/script'

function Home (){

  // GmailAPI, OAuth instance
  const OAuthClientRef = useRef(null);


  const [IncampusMessages, setIncampusMessages] = useState([]);
  const [ClassroomMessages, setClassroomMessages] = useState([]);

  // --------------- GmailAPI -------------- //
  // activate GmailAPI
  const GMAIL_API_KEY = process.env.NEXT_PUBLIC_GMAIL_API_KEY;
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'; 

  //initialize
  const LoadGapi = () => {
    gapi.load('client', initializeGapiClient);
  }

  // LoadGapi's callback
  const initializeGapiClient = () => {
    gapi.client.init({
      apiKey: GMAIL_API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }


  //--------------- OAuth --------------- //
  // activate OAuth
  const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
  const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

  // initialize
  const LoadGsi = () => {
    OAuthClientRef.current = google.accounts.oauth2.initTokenClient({
      client_id: OAUTH_CLIENT_ID,
      scope: SCOPES,
      // 認証完了時のコールバック
      callback: () => {
        console.log('認証完了')
        fetchMessages();
      }
    });
  }

  // call OAuth after clicked button
  const hadleOAuthClick = () => {
    if (OAuthClientRef.current){
      OAuthClientRef.current.requestAccessToken({ prompt: 'consent' });
    }
  }


  // fetch Gmail's content after OAuth
  const fetchMessages= async () => {

    //----- fetch in Campus messages ----//
    // メールのメタ情報(idなど)を取得
    const incampus_fetchMetamessages = await gapi.client.gmail.users.messages.list({
      'userId': 'me',
      q: 'from:no-reply-incampus@isc.senshu-u.ac.jp',
      'maxResults': 15
    });
    const incampus_metamessages = incampus_fetchMetamessages.result.messages;

    //メタ情報からメッセージを取得
    const incampus_fetchMessages = incampus_metamessages.map((metamessage) =>
      gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': metamessage.id
      })
    );
    const incampus_messages = await Promise.all(incampus_fetchMessages);

    //　情報の抽出・整形
    const incampus_FilteredMessages = incampus_messages.map(message => {
      return{
        snippet: message.result.snippet
      }
    })
    
    setIncampusMessages(incampus_FilteredMessages);

    //----- fetch Google Classroom messages ----//
    // メールのメタ情報(idなど)を取得
    const classroom_fetchMetamessages = await gapi.client.gmail.users.messages.list({
      'userId': 'me',
      q: 'from:<no-reply@classroom.google.com>',
      'maxResults': 15
    });
    const classroom_metamessages = classroom_fetchMetamessages.result.messages;

    //メタ情報からメッセージを取得
    const classroom_fetchMessages = classroom_metamessages.map((metamessage) =>
      gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': metamessage.id
      })
    );
    const classroom_messages = await Promise.all(classroom_fetchMessages);

    //　情報の抽出・整形
    const classroom_FilteredMessages = classroom_messages.map(message => {
      return{
        snippet: message.result.snippet
      }
    })
    
    setClassroomMessages(classroom_FilteredMessages);

  }


  return(
    <>

      <Script src="https://apis.google.com/js/api.js" onLoad={LoadGapi} />
      <Script async defer src="https://accounts.google.com/gsi/client" onLoad={LoadGsi}></Script>
      
      

      <button onClick = {hadleOAuthClick}>
        Authentication
      </button>

      {IncampusMessages.length > 0 ? (
        <>
          <h2>in Campus Messages</h2>
          <ul>
            {IncampusMessages.map(message => (
              <li>
                {message.snippet}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {ClassroomMessages.length > 0 ? (
        <>
          <h2> Google Classroom Messages</h2>
          <ul>
            {ClassroomMessages.map(message => (
              <li>
                {message.snippet}
              </li>
            ))}
          </ul>
        </>
      ) : null}

    </>
  )
}

export default Home;

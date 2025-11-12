import { useState, useEffect } from 'react';
import Script from 'next/script';
import { initOAuthClient, signIn, silentSignIn } from '../lib/OAuth';
import { initGapiClient, fetchIncampusMessages, fetchClassroomMessages } from '../lib/GmailAPI';

function Home() {
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  const [IncampusMessages, setIncampusMessages] = useState([]);
  const [ClassroomMessages, setClassroomMessages] = useState([]);

  const fetchMessages = async () => {
    const incampusData = await fetchIncampusMessages();
    setIncampusMessages(incampusData);

    const classroomData = await fetchClassroomMessages();
    setClassroomMessages(classroomData);
  };

  const LoadGmailAPI = async () => {
    await initGapiClient();
    setGapiReady(true);
  };

  const LoadOAuth = () => {
    initOAuthClient(fetchMessages);
    setGisReady(true);
  };

  useEffect(() => {
    if (gapiReady && gisReady) {
      silentSignIn();
    }
  }, [gapiReady, gisReady]);

  return (
    <>
      <Script src="https://apis.google.com/js/api.js" onLoad={LoadGmailAPI} />
      <Script async defer src="https://accounts.google.com/gsi/client" onLoad={LoadOAuth}></Script>

      <button onClick={signIn}>
        Authentication
      </button>

      {IncampusMessages.length > 0 ? (
        <>
          <h2>in Campus Messages</h2>
          <ul>
            {IncampusMessages.map((message, index) => (
              <li key={`incampus-${index}`}>
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
            {ClassroomMessages.map((message, index) => (
              <li key={`classroom-${index}`}>
                {message.snippet}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

export default Home;
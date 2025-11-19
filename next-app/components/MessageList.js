export const MessageList = ({ title, messages }) => {
  if (!messages || messages.length === 0) return null;

  return (
    <>
      <h2>{title}</h2>
      <h3>Unread messages</h3>
      <ul>
        {messages.map((message, index) => (
          // 表示したいプロパティに合わせて調整してください
          <p>
            ||||| {message.sender} |||||
          </p>
        ))}
      </ul>
    </>
  );
};
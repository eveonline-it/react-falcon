// React 19 JSX Transform - no explicit React import needed
import { users } from '../../../data/dashboard/default.js';

const LastMessage = ({ lastMessage, thread }) => {
  const user = users.find(({ id }) => id === lastMessage?.senderUserId);
  const name = user?.name.split(' ');

  const lastMassagePreview =
    lastMessage?.messageType === 'attachment'
      ? `${name[0]} sent ${lastMessage.attachment}`
      : lastMessage?.message.split('<br>');

  if (lastMessage) {
    if (lastMessage.senderUserId === 3) {
      return `You: ${lastMassagePreview[0]}`;
    }

    if (thread.type === 'group') {
      return (
        <div
          className="chat-contact-content"
          dangerouslySetInnerHTML={{
            __html: `${name[0]}: ${lastMassagePreview}`
          }}
        />
      );
    }

    return (
      <div
        className="chat-contact-content"
        dangerouslySetInnerHTML={{ __html: lastMassagePreview }}
      />
    );
  }

  return <div>Say hi to your new friend</div>;
};

export default LastMessage;

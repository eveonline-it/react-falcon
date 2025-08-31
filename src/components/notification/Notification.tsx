// React 19 JSX Transform - no explicit React import needed
import classNames from 'classnames';
import { Link } from 'react-router';
import createMarkup from 'helpers/createMarkup';
import Avatar from 'components/common/Avatar';

const Notification = ({
  avatar,
  time,
  className,
  unread = false,
  flush = false,
  emoji,
  children
}) => (
  <Link
    className={classNames(
      'notification',
      { 'notification-unread': unread, 'notification-flush': flush },
      className
    )}
    to="#!"
  >
    {avatar && (
      <div className="notification-avatar">
        <Avatar {...avatar} className="me-3" />
      </div>
    )}
    <div className="notification-body">
      <p className="mb-1" dangerouslySetInnerHTML={createMarkup(children)} />
      <span className="notification-time">
        {emoji && (
          <span className="me-2" role="img" aria-label="Emoji">
            {emoji}
          </span>
        )}
        {time}
      </span>
    </div>
  </Link>
);

export default Notification;

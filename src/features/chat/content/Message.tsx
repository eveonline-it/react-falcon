import React from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Avatar from 'components/common/Avatar';
import Flex from 'components/common/Flex';
import classNames from 'classnames';
import users from 'data/people';
import FalconLightBox from 'components/common/FalconLightBox';
import FalconLightBoxGallery from 'components/common/FalconLightBoxGallery';
import ChatMessageOptions from './ChatMessageOptions';

// Type definitions for chat messages
interface MessageTime {
  day: string;
  hour: string;
  date: string;
}

interface MessageContent {
  text?: string;
  attachment?: string;
  attachments?: string[];
}

interface ChatMessage {
  text?: string;
  attachment?: string;
  attachments?: string[];
}

interface MessageProps {
  message: string | ChatMessage;
  senderUserId: number;
  status?: 'sent' | 'delivered' | 'seen' | '';
  time: MessageTime;
  isGroup?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, senderUserId, status = '', time, isGroup = false }) => {
  const user = users.find(({ id }) => id === senderUserId);
  const name = user?.name.split(' ')[0];
  const isLeft = senderUserId !== 3;

  const isMessageObject = typeof message === 'object' && message !== null;

  return (
    <Flex className={classNames('p-3', { 'd-block': !isLeft })}>
      {isLeft && <Avatar size="l" className="me-2" src={user?.avatarSrc} />}
      <div
        className={classNames('flex-1', {
          'd-flex justify-content-end': !isLeft
        })}
      >
        <div
          className={classNames('w-xxl-75', {
            'w-100': !isLeft
          })}
        >
          <Flex
            alignItems="center"
            className={classNames('hover-actions-trigger', {
              'flex-end-center': !isLeft,
              'align-items-center': isLeft
            })}
          >
            {!isLeft && <ChatMessageOptions />}
            {isMessageObject && (message as ChatMessage).attachments ? (
              <div className="chat-message chat-gallery">
                {isMessageObject && (message as ChatMessage).text && (
                  <p
                    className="mb-0"
                    dangerouslySetInnerHTML={{
                      __html: (message as ChatMessage).text || ''
                    }}
                  />
                )}
                <FalconLightBoxGallery images={(message as ChatMessage).attachments || []}>
                  {(setImgIndex: (index: number) => void) => (
                    <Row className="mx-n1">
                      {((message as ChatMessage).attachments || []).map((img: string, index: number) => {
                        return (
                          <Col
                            xs={6}
                            md={4}
                            className="px-1"
                            style={{ minWidth: 50 }}
                            key={index}
                          >
                            <Image
                              fluid
                              rounded
                              className="mb-2 cursor-pointer"
                              src={img}
                              alt=""
                              onClick={() => setImgIndex(index)}
                            />
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </FalconLightBoxGallery>
              </div>
            ) : (
              <>
                <div
                  className={classNames('p-2 rounded-2 chat-message', {
                    'bg-200': isLeft,
                    'bg-primary text-white': !isLeft
                  })}
                >
                  {(typeof message === 'string' || (isMessageObject && (message as ChatMessage).text)) && (
                    <p
                      className="mb-0"
                      dangerouslySetInnerHTML={{
                        __html: isMessageObject ? (message as ChatMessage).text || '' : (message as string)
                      }}
                    />
                  )}
                  {isMessageObject && (message as ChatMessage).attachment && (
                    <FalconLightBox image={(message as ChatMessage).attachment!}>
                      <Image
                        fluid
                        rounded
                        src={(message as ChatMessage).attachment}
                        width={150}
                        alt=""
                      />
                    </FalconLightBox>
                  )}
                </div>
              </>
            )}
            {isLeft && <ChatMessageOptions />}
          </Flex>
          <div
            className={classNames('text-400 fs-11', {
              'text-end': !isLeft
            })}
          >
            {isLeft && isGroup && (
              <span className="fw-semibold me-2">{name}</span>
            )}
            {time.hour}
            {!isLeft && !!message && !!status && (
              <FontAwesomeIcon
                icon={classNames({
                  check: status === 'seen' || status === 'sent',
                  'check-double': status === 'delivered'
                })}
                className={classNames('ms-2', {
                  'text-success': status === 'seen'
                })}
              />
            )}
          </div>
        </div>
      </div>
    </Flex>
  );
};

export default Message;

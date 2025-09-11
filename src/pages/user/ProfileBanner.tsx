// React 19 JSX Transform - no explicit React import needed
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { CorporationLogo, AllianceLogo } from 'components/common/eve';
import classNames from 'classnames';

const ProfileBannerHeader = ({
  avatar,
  character,
  className
}: {
  avatar: any;
  character?: any;
  className?: string;
}) => {
  return (
    <Card.Header className={classNames(className, 'position-relative py-4')}>
      <Row className="align-items-center">
        <Col className="d-flex align-items-center">
          <div className="me-3">{avatar}</div>
          <div>
            <h4 className="mb-1">{character?.name || 'Loading...'}</h4>
            <p className="text-600 mb-0">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Born{' '}
              {character?.birthday
                ? new Date(character.birthday).toLocaleDateString()
                : 'Unknown'}
            </p>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex align-items-center gap-2">
            {character?.corporation_id && (
              <CorporationLogo
                corporationId={character.corporation_id}
                size={64}
              />
            )}
            {character?.alliance_id && (
              <AllianceLogo allianceId={character.alliance_id} size={64} />
            )}
          </div>
        </Col>
      </Row>
    </Card.Header>
  );
};

const ProfileBannerBody = ({ children }: { children: React.ReactNode }) => {
  return <Card.Body>{children}</Card.Body>;
};

const ProfileBanner = ({ children }: { children: React.ReactNode }) => {
  return <Card className="mb-3">{children}</Card>;
};

ProfileBanner.Header = ProfileBannerHeader;
ProfileBanner.Body = ProfileBannerBody;

export default ProfileBanner;

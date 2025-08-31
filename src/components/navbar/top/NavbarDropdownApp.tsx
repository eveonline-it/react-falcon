// React 19 JSX Transform - no explicit React import needed
import { Nav, Row, Col } from 'react-bootstrap';
import { getFlatRoutes } from 'helpers/utils';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownApp = ({ items }) => {
  const routes = getFlatRoutes(items);

  return (
    <Row>
      <Col xs={6} md={4}>
        <Nav className="flex-column">
          {routes.unTitled.map(route => (
            <NavbarNavLink key={route.name} route={route} />
          ))}
          <NavbarNavLink label="Social" title="Social" />
          {routes.social.map(route => (
            <NavbarNavLink key={route.name} route={route} />
          ))}
          <NavbarNavLink label="Support Desk" title="Support Desk" />
          {routes.supportDesk.map(route => (
            <NavbarNavLink key={route.name} route={route} />
          ))}
        </Nav>
      </Col>
      <Col xs={6} md={4}>
        <NavbarNavLink label="E Learning" title="E Learning" />
        {routes.eLearning.map(route => (
          <NavbarNavLink key={route.name} route={route} />
        ))}
        <NavbarNavLink label="Events" title="Events" />
        {routes.events.map(route => (
          <NavbarNavLink key={route.name} route={route} />
        ))}
        <NavbarNavLink label="Email" title="Email" />
        {routes.email.map(route => (
          <NavbarNavLink key={route.name} route={route} />
        ))}
      </Col>
      <Col xs={6} md={4}>
        <NavbarNavLink label="E Commerce" title="E Commerce" />
        {routes.eCommerce.map(route => (
          <NavbarNavLink key={route.name} route={route} />
        ))}
      </Col>
    </Row>
  );
};

export default NavbarDropdownApp;

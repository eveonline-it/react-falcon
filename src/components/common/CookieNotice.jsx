import { Toast } from 'react-bootstrap';

const CookieNotice = ({ show, setShow, children, ...rest }) => {
  return (
    <Toast
      onClose={() => setShow(false)}
      show={show}
      className="notice shadow-none bg-transparent"
      style={{
        maxWidth: '35rem'
      }}
      {...rest}
    >
      <Toast.Body className="my-3 ms-0 ms-md-5">{children}</Toast.Body>
    </Toast>
  );
};

export default CookieNotice;

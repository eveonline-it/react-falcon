import { useEffect } from 'react';
import Bowser from 'bowser';
import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Chart as ChartJS, registerables } from 'chart.js';
import { CloseButton } from 'components/common/Toast';
import { useAppContext } from 'providers/AppProvider';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import 'simplebar-react/dist/simplebar.min.css';

// Load development helpers in development mode
if (process.env.NODE_ENV === 'development') {
  import('stores/devtools');
}

ChartJS.register(...registerables);

const App = () => {
  const HTMLClassList = document.getElementsByTagName('html')[0].classList;
  const {
    config: { navbarPosition }
  } = useAppContext();

  useEffect(() => {
    const browser = Bowser.getParser(window.navigator.userAgent);
    const parsedResult = browser.parse() as any;
    const { platform, browser: browserInfo } = parsedResult;

    if (platform?.type === 'windows') {
      HTMLClassList.add('windows');
    }
    if (browserInfo?.name === 'Chrome') {
      HTMLClassList.add('chrome');
    }
    if (browserInfo?.name === 'Firefox') {
      HTMLClassList.add('firefox');
    }
    if (browserInfo?.name === 'Safari') {
      HTMLClassList.add('safari');
    }
  }, [HTMLClassList]);

  useEffect(() => {
    if ((navbarPosition as string) === 'double-top') {
      HTMLClassList.add('double-top-nav-layout');
    }
    return () => HTMLClassList.remove('double-top-nav-layout');
  }, [navbarPosition]);

  return (
    <>
      <Outlet />
      <ToastContainer
        closeButton={CloseButton as any}
        icon={false}
        position="bottom-left"
      />
    </>
  );
};

export default App;

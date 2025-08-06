import React, { createContext, use, useEffect, useReducer } from 'react';
import { settings } from 'config';
import { getColor, getItemFromStore } from 'helpers/utils';
import useToggleStyle from 'hooks/useToggleStyle';
import { configReducer } from 'reducers/configReducer';

export const AppContext = createContext(settings);

const AppProvider = ({ children }) => {
  const configState = {
    isFluid: getItemFromStore('isFluid', settings.isFluid),
    isRTL: getItemFromStore('isRTL', settings.isRTL),
    isDark: getItemFromStore('isDark', settings.isDark),
    theme: getItemFromStore('theme', settings.theme),
    navbarPosition: getItemFromStore('navbarPosition', settings.navbarPosition),
    disabledNavbarPosition: [],
    isNavbarVerticalCollapsed: getItemFromStore(
      'isNavbarVerticalCollapsed',
      settings.isNavbarVerticalCollapsed
    ),
    navbarStyle: getItemFromStore('navbarStyle', settings.navbarStyle),
    currency: settings.currency,
    showBurgerMenu: settings.showBurgerMenu,
    showSettingPanel: false,
    navbarCollapsed: false,
    openAuthModal: false
  };

  const [config, configDispatch] = useReducer(configReducer, configState);

  const setConfig = (key, value) => {
    configDispatch({
      type: 'SET_CONFIG',
      payload: {
        key,
        value,
        setInStore: [
          'isFluid',
          'isRTL',
          'isDark',
          'theme',
          'navbarPosition',
          'isNavbarVerticalCollapsed',
          'navbarStyle'
        ].includes(key)
      }
    });
  };
  const { isLoaded } = useToggleStyle(config.isRTL, config.isDark);

  useEffect(() => {
    const isDark =
      config.theme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : config.theme === 'dark';

    setConfig('isDark', isDark);
  }, [config.theme]);

  const changeTheme = theme => {
    const isDark =
      theme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : theme === 'dark';

    document.documentElement.setAttribute(
      'data-bs-theme',
      isDark ? 'dark' : 'light'
    );

    setConfig('theme', theme);
    setConfig('isDark', isDark);
  };

  const getThemeColor = name => getColor(name);

  if (!isLoaded) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: config.isDark
            ? getThemeColor('dark')
            : getThemeColor('light')
        }}
      />
    );
  }

  return (
    <AppContext
      value={{ config, setConfig, configDispatch, changeTheme, getThemeColor }}
    >
      {children}
    </AppContext>
  );
};


export const useAppContext = () => use(AppContext);

export default AppProvider;

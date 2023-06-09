import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';

import { Button, Container, Dropdown, Icon, Menu, Segment } from 'semantic-ui-react';
import { API, getLogo, getSystemName, isAdmin, isMobile, showSuccess } from '../helpers';
import '../index.css';

// Header Buttons
const headerButtons = [
  {
    name: 'front page',
    to: '/',
    icon: 'home',
  },
  {
    name: 'channel',
    to: '/channel',
    icon: 'sitemap',
    admin: true,
  },
  {
    name: 'token',
    to: '/token',
    icon: 'key',
  },
  {
    name: 'exchange',
    to: '/redemption',
    icon: 'dollar sign',
    admin: true,
  },
  {
    name: 'recharge',
    to: '/topup',
    icon: 'cart',
  },
  {
    name: 'user',
    to: '/user',
    icon: 'user',
    admin: true,
  },
  {
    name: 'set up',
    to: '/setting',
    icon: 'setting',
  },
  {
    name: 'about',
    to: '/about',
    icon: 'info circle',
  },
];

const Header = () => {
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const systemName = getSystemName();
  const logo = getLogo();

  async function logout() {
    setShowSidebar(false);
    await API.get('/api/user/logout');
    showSuccess('logout successful!');
    userDispatch({ type: 'logout' });
    localStorage.removeItem('user');
    navigate('/login');
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const renderButtons = (isMobile) => {
    return headerButtons.map((button) => {
      if (button.admin && !isAdmin()) return <></>;
      if (isMobile) {
        return (
          <Menu.Item
            onClick={() => {
              navigate(button.to);
              setShowSidebar(false);
            }}
          >
            {button.name}
          </Menu.Item>
        );
      }
      return (
        <Menu.Item key={button.name} as={Link} to={button.to}>
          <Icon name={button.icon} />
          {button.name}
        </Menu.Item>
      );
    });
  };

  if (isMobile()) {
    return (
      <>
        <Menu
          borderless
          size='large'
          style={
            showSidebar
              ? {
                  borderBottom: 'none',
                  marginBottom: '0',
                  borderTop: 'none',
                  height: '51px',
                }
              : { borderTop: 'none', height: '52px' }
          }
        >
          <Container>
            <Menu.Item as={Link} to='/'>
              <img
                src={logo}
                alt='logo'
                style={{ marginRight: '0.75em' }}
              />
              <div style={{ fontSize: '20px' }}>
                <b>{systemName}</b>
              </div>
            </Menu.Item>
            <Menu.Menu position='right'>
              <Menu.Item onClick={toggleSidebar}>
                <Icon name={showSidebar ? 'close' : 'sidebar'} />
              </Menu.Item>
            </Menu.Menu>
          </Container>
        </Menu>
        {showSidebar ? (
          <Segment style={{ marginTop: 0, borderTop: '0' }}>
            <Menu secondary vertical style={{ width: '100%', margin: 0 }}>
              {renderButtons(true)}
              <Menu.Item>
                {userState.user ? (
                  <Button onClick={logout}>log out</Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setShowSidebar(false);
                        navigate('/login');
                      }}
                    >
                     Log in
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSidebar(false);
                        navigate('/register');
                      }}
                    >
                      register
                    </Button>
                  </>
                )}
              </Menu.Item>
            </Menu>
          </Segment>
        ) : (
          <></>
        )}
      </>
    );
  }

  return (
    <>
      <Menu borderless style={{ borderTop: 'none' }}>
        <Container>
          <Menu.Item as={Link} to='/' className={'hide-on-mobile'}>
            <img src={logo} alt='logo' style={{ marginRight: '0.75em' }} />
            <div style={{ fontSize: '20px' }}>
              <b>{systemName}</b>
            </div>
          </Menu.Item>
          {renderButtons(false)}
          <Menu.Menu position='right'>
            {userState.user ? (
              <Dropdown
                text={userState.user.username}
                pointing
                className='link item'
              >
                <Dropdown.Menu>
                  <Dropdown.Item onClick={logout}>log out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Menu.Item
                name='Log in'
                as={Link}
                to='/login'
                className='btn btn-link'
              />
            )}
          </Menu.Menu>
        </Container>
      </Menu>
    </>
  );
};

export default Header;

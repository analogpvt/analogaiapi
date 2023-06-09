import React from 'react';

import { Container, Segment } from 'semantic-ui-react';
import { getFooterHTML, getSystemName } from '../helpers';

const Footer = () => {
  const systemName = getSystemName();
  const footer = getFooterHTML();

  return (
    <Segment vertical>
      <Container textAlign='center'>
        {footer ? (
          <div
            className='custom-footer'
            dangerouslySetInnerHTML={{ __html: footer }}
          ></div>
        ) : (
          <div className='custom-footer'>
            <a
              href='https://github.com/songquanpeng/one-api'
              target='_blank'
            >
              {systemName} {process.env.REACT_APP_VERSION}{' '}
            </a>
            Depend on{' '}
            <a href='https://github.com/songquanpeng' target='_blank'>
              JustSong
            </a>{' '}
            To build, the source code follows{' '}
            <a href='https://opensource.org/licenses/mit-license.php'>
              MIT protocol
            </a>
          </div>
        )}
      </Container>
    </Segment>
  );
};

export default Footer;

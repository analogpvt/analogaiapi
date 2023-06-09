import React from 'react';
import { Segment, Dimmer, Loader } from 'semantic-ui-react';

const Loading = ({ prompt: name = 'page' }) => {
  return (
    <Segment style={{ height: 100 }}>
      <Dimmer active inverted>
        <Loader indeterminate>load{name}中...</Loader>
      </Dimmer>
    </Segment>
  );
};

export default Loading;

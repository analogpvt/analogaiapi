import React from 'react';
import { Segment, Tab } from 'semantic-ui-react';
import SystemSetting from '../../components/SystemSetting';
import { isRoot } from '../../helpers';
import OtherSetting from '../../components/OtherSetting';
import PersonalSetting from '../../components/PersonalSetting';

const Setting = () => {
  let panes = [
    {
      menuItem: 'Personal settings',
      render: () => (
        <Tab.Pane attached={false}>
          <PersonalSetting />
        </Tab.Pane>
      )
    }
  ];

  if (isRoot()) {
    panes.push({
      menuItem: 'system settings',
      render: () => (
        <Tab.Pane attached={false}>
          <SystemSetting />
        </Tab.Pane>
      )
    });
    panes.push({
      menuItem: 'other settings',
      render: () => (
        <Tab.Pane attached={false}>
          <OtherSetting />
        </Tab.Pane>
      )
    });
  }

  return (
    <Segment>
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    </Segment>
  );
};

export default Setting;

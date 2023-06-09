import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, Grid, Header, Modal } from 'semantic-ui-react';
import { API, showError, showSuccess } from '../helpers';
import { marked } from 'marked';

const OtherSetting = () => {
  let [inputs, setInputs] = useState({
    Footer: '',
    Notice: '',
    About: '',
    SystemName: '',
    Logo: '',
    HomePageContent: '',
  });
  let [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    tag_name: '',
    content: '',
  });

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (item.key in inputs) {
          newInputs[item.key] = item.value;
        }
      });
      setInputs(newInputs);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    getOptions().then();
  }, []);

  const updateOption = async (key, value) => {
    setLoading(true);
    const res = await API.put('/api/option/', {
      key,
      value,
    });
    const { success, message } = res.data;
    if (success) {
      setInputs((inputs) => ({ ...inputs, [key]: value }));
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const handleInputChange = async (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const submitNotice = async () => {
    await updateOption('Notice', inputs.Notice);
  };

  const submitFooter = async () => {
    await updateOption('Footer', inputs.Footer);
  };

  const submitSystemName = async () => {
    await updateOption('SystemName', inputs.SystemName);
  };

  const submitLogo = async () => {
    await updateOption('Logo', inputs.Logo);
  };

  const submitAbout = async () => {
    await updateOption('About', inputs.About);
  };

  const submitOption = async (key) => {
    await updateOption(key, inputs[key]);
  };

  const openGitHubRelease = () => {
    window.location =
      'https://github.com/songquanpeng/one-api/releases/latest';
  };

  const checkUpdate = async () => {
    const res = await API.get(
      'https://api.github.com/repos/songquanpeng/one-api/releases/latest'
    );
    const { tag_name, body } = res.data;
    if (tag_name === process.env.REACT_APP_VERSION) {
      showSuccess(`Already the latest version：${tag_name}`);
    } else {
      setUpdateData({
        tag_name: tag_name,
        content: marked.parse(body),
      });
      setShowUpdateModal(true);
    }
  };

  return (
    <Grid columns={1}>
      <Grid.Column>
        <Form loading={loading}>
          <Header as='h3'>general settings</Header>
          <Form.Button onClick={checkUpdate}>Check for updates</Form.Button>
          <Form.Group widths='equal'>
            <Form.TextArea
              label='announcement'
              placeholder='Enter new announcement content here'
              value={inputs.Notice}
              name='Notice'
              onChange={handleInputChange}
              style={{ minHeight: 150, fontFamily: 'JetBrains Mono, Consolas' }}
            />
          </Form.Group>
          <Form.Button onClick={submitNotice}>save bulletin</Form.Button>
          <Divider />
          <Header as='h3'>personalized settings</Header>
          <Form.Group widths='equal'>
            <Form.Input
              label='system name'
              placeholder='enter system name here'
              value={inputs.SystemName}
              name='SystemName'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Button onClick={submitSystemName}>set system name</Form.Button>
          <Form.Group widths='equal'>
            <Form.Input
              label='LogoThe maps address'
              placeholder='Enter the URL of the Logo image here'
              value={inputs.Logo}
              name='Logo'
              type='url'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Button onClick={submitLogo}>set logo</Form.Button>
          <Form.Group widths='equal'>
            <Form.TextArea
              label='home page content'
              placeholder='Enter the content of the homepage here, support Markdown & HTML code, after setting, the status information of the homepage will no longer be displayed. If a link is entered, it will be used as the iframes src attribute, which allows you to set any webpage as the homepage.'
              value={inputs.HomePageContent}
              name='HomePageContent'
              onChange={handleInputChange}
              style={{ minHeight: 150, fontFamily: 'JetBrains Mono, Consolas' }}
            />
          </Form.Group>
          <Form.Button onClick={()=>submitOption('HomePageContent')}>Save home page content</Form.Button>
          <Form.Group widths='equal'>
            <Form.TextArea
              label='about'
              placeholder='Enter new about content here, support Markdown & HTML code. If the input is a link, it will be used as the src attribute of the iframe, which allows you to set any web page as the about page。'
              value={inputs.About}
              name='About'
              onChange={handleInputChange}
              style={{ minHeight: 150, fontFamily: 'JetBrains Mono, Consolas' }}
            />
          </Form.Group>
          <Form.Button onClick={submitAbout}>save about</Form.Button>
          <Form.Group widths='equal'>
            <Form.Input
              label='footer'
              placeholder='Enter a new footer here, leave it blank to use the default footer, HTML code is supported'
              value={inputs.Footer}
              name='Footer'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Button onClick={submitFooter}>set footer</Form.Button>
        </Form>
      </Grid.Column>
      <Modal
        onClose={() => setShowUpdateModal(false)}
        onOpen={() => setShowUpdateModal(true)}
        open={showUpdateModal}
      >
        <Modal.Header>new version：{updateData.tag_name}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <div dangerouslySetInnerHTML={{ __html: updateData.content }}></div>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setShowUpdateModal(false)}>closure</Button>
          <Button
            content='details'
            onClick={() => {
              setShowUpdateModal(false);
              openGitHubRelease();
            }}
          />
        </Modal.Actions>
      </Modal>
    </Grid>
  );
};

export default OtherSetting;

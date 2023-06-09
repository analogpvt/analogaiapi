import React, { useEffect, useState } from 'react';
import { Divider, Form, Grid, Header, Message } from 'semantic-ui-react';
import { API, removeTrailingSlash, showError, verifyJSON } from '../helpers';

const SystemSetting = () => {
  let [inputs, setInputs] = useState({
    PasswordLoginEnabled: '',
    PasswordRegisterEnabled: '',
    EmailVerificationEnabled: '',
    GitHubOAuthEnabled: '',
    GitHubClientId: '',
    GitHubClientSecret: '',
    Notice: '',
    SMTPServer: '',
    SMTPPort: '',
    SMTPAccount: '',
    SMTPFrom: '',
    SMTPToken: '',
    ServerAddress: '',
    Footer: '',
    WeChatAuthEnabled: '',
    WeChatServerAddress: '',
    WeChatServerToken: '',
    WeChatAccountQRCodeImageURL: '',
    TurnstileCheckEnabled: '',
    TurnstileSiteKey: '',
    TurnstileSecretKey: '',
    RegisterEnabled: '',
    QuotaForNewUser: 0,
    QuotaRemindThreshold: 0,
    PreConsumedQuota: 0,
    ModelRatio: '',
    TopUpLink: '',
    AutomaticDisableChannelEnabled: '',
    ChannelDisableThreshold: 0,
  });
  const [originInputs, setOriginInputs] = useState({});
  let [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        newInputs[item.key] = item.value;
      });
      setInputs(newInputs);
      setOriginInputs(newInputs);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    getOptions().then();
  }, []);

  const updateOption = async (key, value) => {
    setLoading(true);
    switch (key) {
      case 'PasswordLoginEnabled':
      case 'PasswordRegisterEnabled':
      case 'EmailVerificationEnabled':
      case 'GitHubOAuthEnabled':
      case 'WeChatAuthEnabled':
      case 'TurnstileCheckEnabled':
      case 'RegisterEnabled':
      case 'AutomaticDisableChannelEnabled':
        value = inputs[key] === 'true' ? 'false' : 'true';
        break;
      default:
        break;
    }
    const res = await API.put('/api/option/', {
      key,
      value
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
    if (
      name === 'Notice' ||
      name.startsWith('SMTP') ||
      name === 'ServerAddress' ||
      name === 'GitHubClientId' ||
      name === 'GitHubClientSecret' ||
      name === 'WeChatServerAddress' ||
      name === 'WeChatServerToken' ||
      name === 'WeChatAccountQRCodeImageURL' ||
      name === 'TurnstileSiteKey' ||
      name === 'TurnstileSecretKey' ||
      name === 'QuotaForNewUser' ||
      name === 'QuotaRemindThreshold' ||
      name === 'PreConsumedQuota' ||
      name === 'ModelRatio' ||
      name === 'TopUpLink'
    ) {
      setInputs((inputs) => ({ ...inputs, [name]: value }));
    } else {
      await updateOption(name, value);
    }
  };

  const submitServerAddress = async () => {
    let ServerAddress = removeTrailingSlash(inputs.ServerAddress);
    await updateOption('ServerAddress', ServerAddress);
  };

  const submitOperationConfig = async () => {
    if (originInputs['QuotaForNewUser'] !== inputs.QuotaForNewUser) {
      await updateOption('QuotaForNewUser', inputs.QuotaForNewUser);
    }
    if (originInputs['QuotaRemindThreshold'] !== inputs.QuotaRemindThreshold) {
      await updateOption('QuotaRemindThreshold', inputs.QuotaRemindThreshold);
    }
    if (originInputs['PreConsumedQuota'] !== inputs.PreConsumedQuota) {
      await updateOption('PreConsumedQuota', inputs.PreConsumedQuota);
    }
    if (originInputs['ModelRatio'] !== inputs.ModelRatio) {
      if (!verifyJSON(inputs.ModelRatio)) {
        showError('Model scale is not a valid JSON string');
        return;
      }
      await updateOption('ModelRatio', inputs.ModelRatio);
    }
    if (originInputs['TopUpLink'] !== inputs.TopUpLink) {
      await updateOption('TopUpLink', inputs.TopUpLink);
    }
  };

  const submitSMTP = async () => {
    if (originInputs['SMTPServer'] !== inputs.SMTPServer) {
      await updateOption('SMTPServer', inputs.SMTPServer);
    }
    if (originInputs['SMTPAccount'] !== inputs.SMTPAccount) {
      await updateOption('SMTPAccount', inputs.SMTPAccount);
    }
    if (originInputs['SMTPFrom'] !== inputs.SMTPFrom) {
      await updateOption('SMTPFrom', inputs.SMTPFrom);
    }
    if (
      originInputs['SMTPPort'] !== inputs.SMTPPort &&
      inputs.SMTPPort !== ''
    ) {
      await updateOption('SMTPPort', inputs.SMTPPort);
    }
    if (
      originInputs['SMTPToken'] !== inputs.SMTPToken &&
      inputs.SMTPToken !== ''
    ) {
      await updateOption('SMTPToken', inputs.SMTPToken);
    }
  };

  const submitWeChat = async () => {
    if (originInputs['WeChatServerAddress'] !== inputs.WeChatServerAddress) {
      await updateOption(
        'WeChatServerAddress',
        removeTrailingSlash(inputs.WeChatServerAddress)
      );
    }
    if (
      originInputs['WeChatAccountQRCodeImageURL'] !==
      inputs.WeChatAccountQRCodeImageURL
    ) {
      await updateOption(
        'WeChatAccountQRCodeImageURL',
        inputs.WeChatAccountQRCodeImageURL
      );
    }
    if (
      originInputs['WeChatServerToken'] !== inputs.WeChatServerToken &&
      inputs.WeChatServerToken !== ''
    ) {
      await updateOption('WeChatServerToken', inputs.WeChatServerToken);
    }
  };

  const submitGitHubOAuth = async () => {
    if (originInputs['GitHubClientId'] !== inputs.GitHubClientId) {
      await updateOption('GitHubClientId', inputs.GitHubClientId);
    }
    if (
      originInputs['GitHubClientSecret'] !== inputs.GitHubClientSecret &&
      inputs.GitHubClientSecret !== ''
    ) {
      await updateOption('GitHubClientSecret', inputs.GitHubClientSecret);
    }
  };

  const submitTurnstile = async () => {
    if (originInputs['TurnstileSiteKey'] !== inputs.TurnstileSiteKey) {
      await updateOption('TurnstileSiteKey', inputs.TurnstileSiteKey);
    }
    if (
      originInputs['TurnstileSecretKey'] !== inputs.TurnstileSecretKey &&
      inputs.TurnstileSecretKey !== ''
    ) {
      await updateOption('TurnstileSecretKey', inputs.TurnstileSecretKey);
    }
  };

  return (
    <Grid columns={1}>
      <Grid.Column>
        <Form loading={loading}>
          <Header as='h3'>general settings</Header>
          <Form.Group widths='equal'>
            <Form.Input
              label='server address'
              placeholder='For example：https://yourdomain.com'
              value={inputs.ServerAddress}
              name='ServerAddress'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Button onClick={submitServerAddress}>
          update server address
          </Form.Button>
          <Divider />
          <Header as='h3'>Configure login registration</Header>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.PasswordLoginEnabled === 'true'}
              label='Allow login by password'
              name='PasswordLoginEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.PasswordRegisterEnabled === 'true'}
              label='Allow registration by password'
              name='PasswordRegisterEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.EmailVerificationEnabled === 'true'}
              label='Email verification is required when registering with a password'
              name='EmailVerificationEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.GitHubOAuthEnabled === 'true'}
              label='Allow login & registration via GitHub account'
              name='GitHubOAuthEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.WeChatAuthEnabled === 'true'}
              label='Allow login & registration via WeChat'
              name='WeChatAuthEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.RegisterEnabled === 'true'}
              label='Allow new users to register (when this is false, new users will not be able to register in any way)'
              name='RegisterEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.TurnstileCheckEnabled === 'true'}
              label='Enable Turnstile User Validation'
              name='TurnstileCheckEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Divider />
          <Header as='h3'>
          Operation Settings
          </Header>
          <Form.Group widths={4}>
            <Form.Input
              label='Initial quota for new users'
              name='QuotaForNewUser'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.QuotaForNewUser}
              type='number'
              min='0'
              placeholder='For example：100'
            />
            <Form.Input
              label='Recharge link'
              name='TopUpLink'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.TopUpLink}
              type='link'
              placeholder='For example, the purchase link of the card issuing website'
            />
            <Form.Input
              label='Quota Reminder Threshold'
              name='QuotaRemindThreshold'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.QuotaRemindThreshold}
              type='number'
              min='0'
              placeholder='When the amount is lower than this amount, an email will be sent to remind the user'
            />
            <Form.Input
              label='Request a withholding amount'
              name='PreConsumedQuota'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.PreConsumedQuota}
              type='number'
              min='0'
              placeholder='After the request ends, more refunds and less compensation'
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.TextArea
              label='Model magnification'
              name='ModelRatio'
              onChange={handleInputChange}
              style={{ minHeight: 250, fontFamily: 'JetBrains Mono, Consolas' }}
              autoComplete='new-password'
              value={inputs.ModelRatio}
              placeholder='It is a JSON text, the key is the model name, and the value is the multiplier'
            />
          </Form.Group>
          <Form.Button onClick={submitOperationConfig}>Save Operational Settings</Form.Button>
          <Divider />
          <Header as='h3'>
          monitoring settings
          </Header>
          <Form.Group widths={3}>
            <Form.Input
              label='maximum response time'
              name='ChannelDisableThreshold'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.ChannelDisableThreshold}
              type='number'
              min='0'
              placeholder='The unit is second. When running all channel tests, the channel will be automatically disabled if it exceeds this time'
            />
          </Form.Group>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.AutomaticDisableChannelEnabled === 'true'}
              label='Automatically disable channels on failure'
              name='AutomaticDisableChannelEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Divider />
          <Header as='h3'>
          Configure SMTP
            <Header.Subheader>Sending emails to support the system</Header.Subheader>
          </Header>
          <Form.Group widths={3}>
            <Form.Input
              label='SMTP server address'
              name='SMTPServer'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPServer}
              placeholder='For example：smtp.qq.com'
            />
            <Form.Input
              label='SMTP port'
              name='SMTPPort'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPPort}
              placeholder='default: 587'
            />
            <Form.Input
              label='SMTP account'
              name='SMTPAccount'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPAccount}
              placeholder='Usually an email address'
            />
          </Form.Group>
          <Form.Group widths={3}>
            <Form.Input
              label='SMTP sender email'
              name='SMTPFrom'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPFrom}
              placeholder='Usually the same as the email address'
            />
            <Form.Input
              label='SMTP access credentials'
              name='SMTPToken'
              onChange={handleInputChange}
              type='password'
              autoComplete='new-password'
              value={inputs.SMTPToken}
              placeholder='Sensitive information will not be sent to the front-end display'
            />
          </Form.Group>
          <Form.Button onClick={submitSMTP}>Save SMTP settings</Form.Button>
          <Divider />
          <Header as='h3'>
          configuration GitHub OAuth App
            <Header.Subheader>
            To support login registration through GitHub,
              <a href='https://github.com/settings/developers' target='_blank'>
              click here
              </a>
              manage your GitHub OAuth App
            </Header.Subheader>
          </Header>
          <Message>
            Homepage URL fill <code>{inputs.ServerAddress}</code>
            ，Authorization callback URL fill{' '}
            <code>{`${inputs.ServerAddress}/oauth/github`}</code>
          </Message>
          <Form.Group widths={3}>
            <Form.Input
              label='GitHub Client ID'
              name='GitHubClientId'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.GitHubClientId}
              placeholder='Enter the ID of your registered GitHub OAuth APP'
            />
            <Form.Input
              label='GitHub Client Secret'
              name='GitHubClientSecret'
              onChange={handleInputChange}
              type='password'
              autoComplete='new-password'
              value={inputs.GitHubClientSecret}
              placeholder='Sensitive information will not be sent to the front-end display'
            />
          </Form.Group>
          <Form.Button onClick={submitGitHubOAuth}>
          Save GitHub OAuth settings
          </Form.Button>
          <Divider />
          <Header as='h3'>
          configuration WeChat Server
            <Header.Subheader>
            To support login and registration through WeChat,
              <a
                href='https://github.com/songquanpeng/wechat-server'
                target='_blank'
              >
                click here
              </a>
              Learn about WeChat Server
            </Header.Subheader>
          </Header>
          <Form.Group widths={3}>
            <Form.Input
              label='WeChat Server server address'
              name='WeChatServerAddress'
              placeholder='For example：https://yourdomain.com'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.WeChatServerAddress}
            />
            <Form.Input
              label='WeChat Server access credentials'
              name='WeChatServerToken'
              type='password'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.WeChatServerToken}
              placeholder='Sensitive information will not be sent to the front-end display'
            />
            <Form.Input
              label='WeChat official account QR code picture link'
              name='WeChatAccountQRCodeImageURL'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.WeChatAccountQRCodeImageURL}
              placeholder='enter an image link'
            />
          </Form.Group>
          <Form.Button onClick={submitWeChat}>
          Save WeChat Server settings
          </Form.Button>
          <Divider />
          <Header as='h3'>
          configuration Turnstile
            <Header.Subheader>
            To support user verification，
              <a href='https://dash.cloudflare.com/' target='_blank'>
              click here
              </a>
              manage your Turnstile Sites，recommended choice Invisible Widget Type
            </Header.Subheader>
          </Header>
          <Form.Group widths={3}>
            <Form.Input
              label='Turnstile Site Key'
              name='TurnstileSiteKey'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.TurnstileSiteKey}
              placeholder='Enter your registered Turnstile Site Key'
            />
            <Form.Input
              label='Turnstile Secret Key'
              name='TurnstileSecretKey'
              onChange={handleInputChange}
              type='password'
              autoComplete='new-password'
              value={inputs.TurnstileSecretKey}
              placeholder='Sensitive information will not be sent to the front-end display'
            />
          </Form.Group>
          <Form.Button onClick={submitTurnstile}>
          Save Turnstile settings
          </Form.Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default SystemSetting;

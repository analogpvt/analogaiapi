import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, Header, Image, Message, Modal } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, copy, showError, showInfo, showSuccess } from '../helpers';
import Turnstile from 'react-turnstile';

const PersonalSetting = () => {
  const [inputs, setInputs] = useState({
    wechat_verification_code: '',
    email_verification_code: '',
    email: '',
  });
  const [status, setStatus] = useState({});
  const [showWeChatBindModal, setShowWeChatBindModal] = useState(false);
  const [showEmailBindModal, setShowEmailBindModal] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
  }, []);

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const generateAccessToken = async () => {
    const res = await API.get('/api/user/token');
    const { success, message, data } = res.data;
    if (success) {
      await copy(data);
      showSuccess(`Token was reset and copied to clipboard：${data}`);
    } else {
      showError(message);
    }
  };

  const bindWeChat = async () => {
    if (inputs.wechat_verification_code === '') return;
    const res = await API.get(
      `/api/oauth/wechat/bind?code=${inputs.wechat_verification_code}`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('Wechat account binding is successful！');
      setShowWeChatBindModal(false);
    } else {
      showError(message);
    }
  };

  const openGitHubOAuth = () => {
    window.open(
      `https://github.com/login/oauth/authorize?client_id=${status.github_client_id}&scope=user:email`
    );
  };

  const sendVerificationCode = async () => {
    if (inputs.email === '') return;
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('Please try again in a few seconds, Turnstile is checking user environment！');
      return;
    }
    setLoading(true);
    const res = await API.get(
      `/api/verification?email=${inputs.email}&turnstile=${turnstileToken}`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('The verification code has been sent successfully, please check your email！');
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const bindEmail = async () => {
    if (inputs.email_verification_code === '') return;
    setLoading(true);
    const res = await API.get(
      `/api/oauth/email/bind?email=${inputs.email}&code=${inputs.email_verification_code}`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('The email account is bound successfully！');
      setShowEmailBindModal(false);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  return (
    <div style={{ lineHeight: '40px' }}>
      <Header as='h3'>general settings</Header>
      <Message>
      Note that the token generated here is used for system management, not for requesting OpenAI-related services, please be aware.
      </Message>
      <Button as={Link} to={`/user/edit/`}>
      update personal information
      </Button>
      <Button onClick={generateAccessToken}>Generate system access token</Button>
      <Divider />
      <Header as='h3'>account binding</Header>
      {
        status.wechat_login && (
          <Button
            onClick={() => {
              setShowWeChatBindModal(true);
            }}
          >
            Bind WeChat account
          </Button>
        )
      }
      <Modal
        onClose={() => setShowWeChatBindModal(false)}
        onOpen={() => setShowWeChatBindModal(true)}
        open={showWeChatBindModal}
        size={'mini'}
      >
        <Modal.Content>
          <Modal.Description>
            <Image src={status.wechat_qrcode} fluid />
            <div style={{ textAlign: 'center' }}>
              <p>
              Scan the WeChat code to follow the official account, enter the "verification code" to get the verification code (valid within three minutes)
              </p>
            </div>
            <Form size='large'>
              <Form.Input
                fluid
                placeholder='verification code'
                name='wechat_verification_code'
                value={inputs.wechat_verification_code}
                onChange={handleInputChange}
              />
              <Button color='' fluid size='large' onClick={bindWeChat}>
              to bind
              </Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
      {
        status.github_oauth && (
          <Button onClick={openGitHubOAuth}>Bind GitHub account</Button>
        )
      }
      <Button
        onClick={() => {
          setShowEmailBindModal(true);
        }}
      >
       Bind email address
      </Button>
      <Modal
        onClose={() => setShowEmailBindModal(false)}
        onOpen={() => setShowEmailBindModal(true)}
        open={showEmailBindModal}
        size={'tiny'}
        style={{ maxWidth: '450px' }}
      >
        <Modal.Header>Bind email address</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form size='large'>
              <Form.Input
                fluid
                placeholder='Enter email address'
                onChange={handleInputChange}
                name='email'
                type='email'
                action={
                  <Button onClick={sendVerificationCode} disabled={loading}>
                    get verification code
                  </Button>
                }
              />
              <Form.Input
                fluid
                placeholder='verification code'
                name='email_verification_code'
                value={inputs.email_verification_code}
                onChange={handleInputChange}
              />
              {turnstileEnabled ? (
                <Turnstile
                  sitekey={turnstileSiteKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                  }}
                />
              ) : (
                <></>
              )}
              <Button
                color=''
                fluid
                size='large'
                onClick={bindEmail}
                loading={loading}
              >
                to bind
              </Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default PersonalSetting;

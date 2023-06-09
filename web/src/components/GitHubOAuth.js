import React, { useContext, useEffect, useState } from 'react';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';
import { UserContext } from '../context/User';

const GitHubOAuth = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [userState, userDispatch] = useContext(UserContext);
  const [prompt, setPrompt] = useState('Processing...');
  const [processing, setProcessing] = useState(true);

  let navigate = useNavigate();

  const sendCode = async (code, count) => {
    const res = await API.get(`/api/oauth/github?code=${code}`);
    const { success, message, data } = res.data;
    if (success) {
      if (message === 'bind') {
        showSuccess('bind successfully！');
        navigate('/setting');
      } else {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        showSuccess('login successful！');
        navigate('/');
      }
    } else {
      showError(message);
      if (count === 0) {
        setPrompt(`The operation failed, redirected to the login interface...`);
        navigate('/setting'); // in case this is failed to bind GitHub
        return;
      }
      count++;
      setPrompt(`An error occurred, ${count} retries...`);
      await new Promise((resolve) => setTimeout(resolve, count * 2000));
      await sendCode(code, count);
    }
  };

  useEffect(() => {
    let code = searchParams.get('code');
    sendCode(code, 0).then();
  }, []);

  return (
    <Segment style={{ minHeight: '300px' }}>
      <Dimmer active inverted>
        <Loader size='large'>{prompt}</Loader>
      </Dimmer>
    </Segment>
  );
};

export default GitHubOAuth;

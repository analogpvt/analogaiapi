import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Message, Segment } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { API, showError, showSuccess } from '../../helpers';
import { CHANNEL_OPTIONS } from '../../constants';

const EditChannel = () => {
  const params = useParams();
  const channelId = params.id;
  const isEdit = channelId !== undefined;
  const [loading, setLoading] = useState(isEdit);
  const originInputs = {
    name: '',
    type: 1,
    key: '',
    base_url: '',
    other: ''
  };
  const [batch, setBatch] = useState(false);
  const [inputs, setInputs] = useState(originInputs);
  const handleInputChange = (e, { name, value }) => {
    console.log(name, value);
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadChannel = async () => {
    let res = await API.get(`/api/channel/${channelId}`);
    const { success, message, data } = res.data;
    if (success) {
      data.password = '';
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (isEdit) {
      loadChannel().then();
    }
  }, []);

  const submit = async () => {
    if (!isEdit && (inputs.name === '' || inputs.key === '')) return;
    let localInputs = inputs;
    if (localInputs.base_url.endsWith('/')) {
      localInputs.base_url = localInputs.base_url.slice(0, localInputs.base_url.length - 1);
    }
    if (localInputs.type === 3 && localInputs.other === '') {
      localInputs.other = '2023-03-15-preview';
    }
    let res;
    if (isEdit) {
      res = await API.put(`/api/channel/`, { ...localInputs, id: parseInt(channelId) });
    } else {
      res = await API.post(`/api/channel/`, localInputs);
    }
    const { success, message } = res.data;
    if (success) {
      if (isEdit) {
        showSuccess('Channel updated successfully！');
      } else {
        showSuccess('Channel created successfully！');
        setInputs(originInputs);
      }
    } else {
      showError(message);
    }
  };

  return (
    <>
      <Segment loading={loading}>
        <Header as='h3'>{isEdit ? 'Update channel information' : 'create new channel'}</Header>
        <Form autoComplete='new-password'>
          <Form.Field>
            <Form.Select
              label='type'
              name='type'
              options={CHANNEL_OPTIONS}
              value={inputs.type}
              onChange={handleInputChange}
            />
          </Form.Field>
          {
            inputs.type === 3 && (
              <>
                <Message>
                Note, <strong>The model deployment name must be consistent with the model name</strong>, because One API will put the model in the request body
                Parameters replaced with your deployment name (dots in model names will be stripped)，<a target='_blank'
                                                                    href='https://github.com/songquanpeng/one-api/issues/133?notification_referrer_id=NT_kwDOAmJSYrM2NjIwMzI3NDgyOjM5OTk4MDUw#issuecomment-1571602271'>图片演示</a>。
                </Message>
                <Form.Field>
                  <Form.Input
                    label='AZURE_OPENAI_ENDPOINT'
                    name='base_url'
                    placeholder={'please enter AZURE_OPENAI_ENDPOINT，例如：https://docs-test-001.openai.azure.com'}
                    onChange={handleInputChange}
                    value={inputs.base_url}
                    autoComplete='new-password'
                  />
                </Form.Field>
                <Form.Field>
                  <Form.Input
                    label='Default API version'
                    name='other'
                    placeholder={'Please enter the default API version, for example: 2023-03-15-preview, this configuration can be overridden by actual request query parameters'}
                    onChange={handleInputChange}
                    value={inputs.other}
                    autoComplete='new-password'
                  />
                </Form.Field>
              </>
            )
          }
          {
            inputs.type === 8 && (
              <Form.Field>
                <Form.Input
                  label='Base URL'
                  name='base_url'
                  placeholder={'Please enter the Base URL of the custom channel, for example: https://openai.justsong.cn'}
                  onChange={handleInputChange}
                  value={inputs.base_url}
                  autoComplete='new-password'
                />
              </Form.Field>
            )
          }
          <Form.Field>
            <Form.Input
              label='name'
              name='name'
              placeholder={'please enter a name'}
              onChange={handleInputChange}
              value={inputs.name}
              autoComplete='new-password'
            />
          </Form.Field>
          {
            batch ? <Form.Field>
              <Form.TextArea
                label='key'
                name='key'
                placeholder={'Please enter the key, one per line'}
                onChange={handleInputChange}
                value={inputs.key}
                style={{ minHeight: 150, fontFamily: 'JetBrains Mono, Consolas' }}
                autoComplete='new-password'
              />
            </Form.Field> : <Form.Field>
              <Form.Input
                label='key'
                name='key'
                placeholder={'please enter key'}
                onChange={handleInputChange}
                value={inputs.key}
                autoComplete='new-password'
              />
            </Form.Field>
          }
          {
            !isEdit && (
              <Form.Checkbox
                checked={batch}
                label='Batch creation'
                name='batch'
                onChange={() => setBatch(!batch)}
              />
            )
          }
          <Button positive onClick={submit}>submit</Button>
        </Form>
      </Segment>
    </>
  );
};

export default EditChannel;

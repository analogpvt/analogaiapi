import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Message, Segment } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { API, showError, showInfo, showSuccess } from '../../helpers';
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
    other: '',
    group: 'default',
    models: [],
  };
  const [batch, setBatch] = useState(false);
  const [inputs, setInputs] = useState(originInputs);
  const [modelOptions, setModelOptions] = useState([]);
  const [basicModels, setBasicModels] = useState([]);
  const [fullModels, setFullModels] = useState([]);
  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadChannel = async () => {
    let res = await API.get(`/api/channel/${channelId}`);
    const { success, message, data } = res.data;
    if (success) {
      if (data.models === "") {
        data.models = []
      } else {
        data.models = data.models.split(",")
      }
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const fetchModels = async () => {
    try {
      let res = await API.get(`/api/channel/models`);
      setModelOptions(res.data.data.map((model) => ({
        key: model.id,
        text: model.id,
        value: model.id,
      })));
      setFullModels(res.data.data.map((model) => model.id));
      setBasicModels(res.data.data.filter((model) => !model.id.startsWith("gpt-4")).map((model) => model.id));
    } catch (error) {
      showError(error.message);
    }
  };

  useEffect(() => {
    if (isEdit) {
      loadChannel().then();
    }
    fetchModels().then();
  }, []);

  const submit = async () => {
    if (!isEdit && (inputs.name === '' || inputs.key === '')) {
      showInfo('Please fill in the channel name and channel key！');
      return;
    }
    let localInputs = inputs;
    if (localInputs.base_url.endsWith('/')) {
      localInputs.base_url = localInputs.base_url.slice(0, localInputs.base_url.length - 1);
    }
    if (localInputs.type === 3 && localInputs.other === '') {
      localInputs.other = '2023-03-15-preview';
    }
    let res;
    localInputs.models = localInputs.models.join(",")
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
                  Notice，<strong>The model deployment name must be consistent with the model name</strong>，Because One API will put the model in the request body
                   Parameters replaced with your deployment name (dots in model names will be stripped)，<a target='_blank'
                                                                    href='https://github.com/songquanpeng/one-api/issues/133?notification_referrer_id=NT_kwDOAmJSYrM2NjIwMzI3NDgyOjM5OTk4MDUw#issuecomment-1571602271'>图片演示</a>。
                </Message>
                <Form.Field>
                  <Form.Input
                    label='AZURE_OPENAI_ENDPOINT'
                    name='base_url'
                    placeholder={'Please enter AZURE_OPENAI_ENDPOINT eg：https://docs-test-001.openai.azure.com'}
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
                  placeholder={'Please enter the Base URL of the custom channel, eg：https://openai.justsong.cn'}
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
          <Form.Field>
            <Form.Input
              label='group'
              name='group'
              placeholder={'Please enter group'}
              onChange={handleInputChange}
              value={inputs.group}
              autoComplete='new-password'
            />
          </Form.Field>
          <Form.Field>
            <Form.Dropdown
              label='Model'
              placeholder={'Please select the model supported by this channel'}
              name='models'
              fluid
              multiple
              selection
              onChange={handleInputChange}
              value={inputs.models}
              autoComplete='new-password'
              options={modelOptions}
            />
          </Form.Field>
          <div style={{ lineHeight: '40px', marginBottom: '12px'}}>
            <Button type={'button'} onClick={() => {
              handleInputChange(null, { name: 'models', value: basicModels });
            }}>Fill in the base model</Button>
            <Button type={'button'} onClick={() => {
              handleInputChange(null, { name: 'models', value: fullModels });
            }}>Fill in all models</Button>
          </div>
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

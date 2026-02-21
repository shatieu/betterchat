'use client';

import { Form, Input, Modal, Select, Switch } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type ChannelConfig, type ChannelType } from '@lobechat/types';

const { TextArea } = Input;

interface ChannelFormData {
  config: ChannelConfig;
  enabled: boolean;
  name: string;
  type: ChannelType;
}

interface ChannelFormModalProps {
  onCancel: () => void;
  onSubmit: (data: ChannelFormData) => Promise<void>;
  open: boolean;
}

const CHANNEL_TYPE_OPTIONS: { label: string; value: ChannelType }[] = [
  { label: 'types.email', value: 'email' },
  { label: 'types.slack', value: 'slack' },
  { label: 'types.webhook', value: 'webhook' },
];

const ChannelFormModal = memo<ChannelFormModalProps>(({ open, onCancel, onSubmit }) => {
  const { t } = useTranslation('channels');
  const [form] = Form.useForm();
  const [channelType, setChannelType] = useState<ChannelType>('webhook');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setChannelType('webhook');
    }
  }, [open, form]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let config: ChannelConfig;

      switch (values.type as ChannelType) {
        case 'email': {
          const recipients = (values.recipients || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
          config = {
            recipients,
            subjectTemplate: values.subjectTemplate || undefined,
          };
          break;
        }
        case 'slack': {
          config = {
            channel: values.slackChannel || undefined,
            username: values.slackUsername || undefined,
            webhookUrl: values.slackWebhookUrl,
          };
          break;
        }
        case 'webhook':
        default: {
          let headers: Record<string, string> | undefined;
          if (values.webhookHeaders) {
            try {
              headers = JSON.parse(values.webhookHeaders);
            } catch {
              headers = undefined;
            }
          }
          config = {
            headers,
            method: values.webhookMethod || 'POST',
            payloadFormat: values.webhookPayloadFormat || 'json',
            url: values.webhookUrl,
          };
          break;
        }
      }

      await onSubmit({
        config,
        enabled: values.enabled ?? true,
        name: values.name,
        type: values.type,
      });

      onCancel();
    } catch {
      // validation error
    } finally {
      setSubmitting(false);
    }
  }, [form, onSubmit, onCancel]);

  return (
    <Modal
      confirmLoading={submitting}
      destroyOnClose
      okText={t('actions.add')}
      open={open}
      title={t('actions.add')}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} initialValues={{ enabled: true, type: 'webhook' }} layout="vertical">
        <Form.Item
          label={t('form.name')}
          name="name"
          rules={[{ message: t('form.namePlaceholder'), required: true }]}
        >
          <Input placeholder={t('form.namePlaceholder')} />
        </Form.Item>

        <Form.Item label={t('form.type')} name="type" rules={[{ required: true }]}>
          <Select
            options={CHANNEL_TYPE_OPTIONS.map((opt) => ({
              label: t(opt.label as any),
              value: opt.value,
            }))}
            onChange={(value: ChannelType) => setChannelType(value)}
          />
        </Form.Item>

        <Form.Item label={t('form.enabled')} name="enabled" valuePropName="checked">
          <Switch />
        </Form.Item>

        {/* Email Config */}
        {channelType === 'email' && (
          <>
            <Form.Item
              label={t('form.email.recipients')}
              name="recipients"
              rules={[{ required: true }]}
            >
              <Input placeholder={t('form.email.recipientsPlaceholder')} />
            </Form.Item>
            <Form.Item label={t('form.email.subjectTemplate')} name="subjectTemplate">
              <Input placeholder={t('form.email.subjectTemplatePlaceholder')} />
            </Form.Item>
          </>
        )}

        {/* Slack Config */}
        {channelType === 'slack' && (
          <>
            <Form.Item
              label={t('form.slack.webhookUrl')}
              name="slackWebhookUrl"
              rules={[{ required: true, type: 'url' }]}
            >
              <Input placeholder={t('form.slack.webhookUrlPlaceholder')} />
            </Form.Item>
            <Form.Item label={t('form.slack.channel')} name="slackChannel">
              <Input placeholder={t('form.slack.channelPlaceholder')} />
            </Form.Item>
            <Form.Item label={t('form.slack.username')} name="slackUsername">
              <Input placeholder={t('form.slack.usernamePlaceholder')} />
            </Form.Item>
          </>
        )}

        {/* Webhook Config */}
        {channelType === 'webhook' && (
          <>
            <Form.Item
              label={t('form.webhook.url')}
              name="webhookUrl"
              rules={[{ required: true, type: 'url' }]}
            >
              <Input placeholder={t('form.webhook.urlPlaceholder')} />
            </Form.Item>
            <Form.Item label={t('form.webhook.method')} name="webhookMethod">
              <Select
                defaultValue="POST"
                options={[
                  { label: 'GET', value: 'GET' },
                  { label: 'POST', value: 'POST' },
                  { label: 'PUT', value: 'PUT' },
                ]}
              />
            </Form.Item>
            <Form.Item label={t('form.webhook.payloadFormat')} name="webhookPayloadFormat">
              <Select
                defaultValue="json"
                options={[
                  { label: 'JSON', value: 'json' },
                  { label: 'Text', value: 'text' },
                ]}
              />
            </Form.Item>
            <Form.Item label={t('form.webhook.headers')} name="webhookHeaders">
              <TextArea placeholder='{"Content-Type": "application/json"}' rows={3} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
});

ChannelFormModal.displayName = 'ChannelFormModal';

export default ChannelFormModal;

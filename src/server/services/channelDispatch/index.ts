import type {
  ChannelType,
  EmailChannelConfig,
  SlackChannelConfig,
  WebhookChannelConfig,
} from '@lobechat/types';

export interface ChannelDispatchPayload {
  agentName?: string;
  content: string;
  jobName?: string;
}

export interface ChannelDispatchResult {
  error?: string;
  success: boolean;
}

/**
 * Dispatches a message through a configured channel
 */
export async function dispatchToChannel(
  type: ChannelType,
  config: EmailChannelConfig | SlackChannelConfig | WebhookChannelConfig,
  payload: ChannelDispatchPayload,
): Promise<ChannelDispatchResult> {
  switch (type) {
    case 'webhook': {
      return dispatchWebhook(config as WebhookChannelConfig, payload);
    }
    case 'slack': {
      return dispatchSlack(config as SlackChannelConfig, payload);
    }
    case 'email': {
      return dispatchEmail(config as EmailChannelConfig, payload);
    }
    default: {
      return { error: `Unknown channel type: ${type}`, success: false };
    }
  }
}

async function dispatchWebhook(
  config: WebhookChannelConfig,
  payload: ChannelDispatchPayload,
): Promise<ChannelDispatchResult> {
  try {
    const method = config.method || 'POST';
    const headers: Record<string, string> = {
      'Content-Type':
        config.payloadFormat === 'text' ? 'text/plain' : 'application/json',
      ...config.headers,
    };

    const body =
      config.payloadFormat === 'text'
        ? payload.content
        : JSON.stringify({
            agent_name: payload.agentName,
            content: payload.content,
            job_name: payload.jobName,
            timestamp: new Date().toISOString(),
          });

    const response = await fetch(config.url, {
      body: method !== 'GET' ? body : undefined,
      headers,
      method,
    });

    if (!response.ok) {
      return {
        error: `Webhook returned ${response.status}: ${response.statusText}`,
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      error: `Webhook dispatch failed: ${(error as Error).message}`,
      success: false,
    };
  }
}

async function dispatchSlack(
  config: SlackChannelConfig,
  payload: ChannelDispatchPayload,
): Promise<ChannelDispatchResult> {
  try {
    const slackPayload: Record<string, string> = {
      text: payload.content,
    };

    if (config.channel) slackPayload.channel = config.channel;
    if (config.username) slackPayload.username = config.username;

    const response = await fetch(config.webhookUrl, {
      body: JSON.stringify(slackPayload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      return {
        error: `Slack webhook returned ${response.status}: ${response.statusText}`,
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      error: `Slack dispatch failed: ${(error as Error).message}`,
      success: false,
    };
  }
}

async function dispatchEmail(
  config: EmailChannelConfig,
  payload: ChannelDispatchPayload,
): Promise<ChannelDispatchResult> {
  try {
    // Email dispatch requires the EmailService to be configured
    // Import dynamically to avoid circular dependencies
    const { EmailService } = await import('../email');
    const emailService = new EmailService();

    const subject = config.subjectTemplate
      ? config.subjectTemplate
          .replace('{{agent_name}}', payload.agentName || 'Agent')
          .replace('{{job_name}}', payload.jobName || 'Task')
      : `${payload.agentName || 'Agent'} - ${payload.jobName || 'Task'} Report`;

    for (const recipient of config.recipients) {
      await emailService.sendMail({
        html: `<pre>${payload.content}</pre>`,
        subject,
        to: recipient,
      });
    }

    return { success: true };
  } catch (error) {
    return {
      error: `Email dispatch failed: ${(error as Error).message}`,
      success: false,
    };
  }
}

'use client';

import { Flexbox, FormGroup, LobeSelect as Select, Text } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { agentChannelService } from '@/services/agentChannel';

const styles = createStaticStyles(({ css }) => ({
  label: css`
    flex-shrink: 0;
    width: 120px;
  `,
  row: css`
    min-height: 48px;
    padding-block: 12px;
    padding-inline: 0;
  `,
}));

interface CronJobChannelSelectProps {
  agentId?: string;
  channelId?: string | null;
  onChange: (channelId: string | null) => void;
}

const CronJobChannelSelect = memo<CronJobChannelSelectProps>(
  ({ agentId, channelId, onChange }) => {
    const { t } = useTranslation('channels');

    const { data: channelsData } = useSWR(
      agentId ? `/api/agent-channels/${agentId}` : null,
      agentId ? () => agentChannelService.getByAgentId(agentId) : null,
    );

    const channels = channelsData?.data || [];

    const options = [
      { label: t('form.config'), value: '' },
      ...channels
        .filter((ch) => ch.enabled)
        .map((ch) => ({
          label: `${ch.name} (${t(`types.${ch.type}` as any)})`,
          value: ch.id,
        })),
    ];

    return (
      <FormGroup title={t('title')} variant="filled">
        <Flexbox horizontal align="center" className={styles.row} gap={24}>
          <Text className={styles.label}>{t('title')}</Text>
          <Select
            allowClear
            options={options}
            placeholder={t('form.config')}
            popupMatchSelectWidth={false}
            style={{ minWidth: '200px', width: 'fit-content' }}
            value={channelId || ''}
            variant="outlined"
            onChange={(value: string) => onChange(value || null)}
          />
        </Flexbox>
      </FormGroup>
    );
  },
);

CronJobChannelSelect.displayName = 'CronJobChannelSelect';

export default CronJobChannelSelect;

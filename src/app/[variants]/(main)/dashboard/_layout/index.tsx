'use client';

import { Flexbox } from '@lobehub/ui';
import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';
import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

import { createStaticStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

const styles = createStaticStyles(({ css, cssVar }) => ({
  mainContainer: css`
    position: relative;
    overflow: hidden;
    background: ${cssVar.colorBgContainer};
  `,
}));

const DashboardSidebar = memo(() => {
  const { t } = useTranslation('common');
  return (
    <NavPanelPortal navKey="dashboard">
      <SideBarLayout
        header={
          <SideBarHeaderLayout
            breadcrumb={[{ href: '/dashboard', title: t('tab.dashboard') }]}
          />
        }
      />
    </NavPanelPortal>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

const DesktopDashboardLayout: FC = () => {
  return (
    <>
      <DashboardSidebar />
      <Flexbox className={styles.mainContainer} flex={1} height={'100%'}>
        <Outlet />
      </Flexbox>
    </>
  );
};

export default DesktopDashboardLayout;

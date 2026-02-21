'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { type FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

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

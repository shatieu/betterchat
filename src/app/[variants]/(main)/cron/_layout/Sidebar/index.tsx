import { memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import Header from './Header';
import SidebarBody from './SidebarBody';

const Sidebar = memo(() => {
  return (
    <NavPanelPortal navKey="cron">
      <SideBarLayout body={<SidebarBody />} header={<Header />} />
    </NavPanelPortal>
  );
});

Sidebar.displayName = 'CronSidebar';

export default Sidebar;

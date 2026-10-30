'use client';

import { Icon, Row, Tab, TabList, TabPanel, Tabs } from '@once-ui-system/core';
import type { IconName } from '@once-ui-system/core';

type TabId = 'events' | 'registrations' | 'settings';

interface DashboardTabsProps {
  eventsContent: React.ReactNode;
  registrationsContent: React.ReactNode;
  settingsContent: React.ReactNode;
}

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'registrations', label: 'Registrations', icon: 'document' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function DashboardTabs({
  eventsContent,
  registrationsContent,
  settingsContent,
}: DashboardTabsProps) {
  const content: Record<TabId, React.ReactNode> = {
    events: eventsContent,
    registrations: registrationsContent,
    settings: settingsContent,
  };

  return (
    <Tabs defaultValue="events">
      <TabList>
        {TABS.map((tab) => (
          <Tab key={tab.id} value={tab.id}>
            <Row gap="8" vertical="center">
              <Icon name={tab.icon} size="xs" />
              {tab.label}
            </Row>
          </Tab>
        ))}
      </TabList>
      {TABS.map((tab) => (
        // keepMounted so tab state (filters, open forms) survives switching tabs.
        <TabPanel key={tab.id} value={tab.id} keepMounted paddingTop="24">
          {content[tab.id]}
        </TabPanel>
      ))}
    </Tabs>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button, Row, Text, ThemeSwitcher } from '@once-ui-system/core';

export function SiteHeader() {
  return (
    <Row
      as="header"
      fillWidth
      horizontal="center"
      paddingX="24"
      paddingY="12"
      borderBottom
      background="surface"
      position="sticky"
      top="0"
      zIndex={5}
      className="print-hidden"
    >
      <Row maxWidth="l" horizontal="between" vertical="center" gap="16">
        <Link href="/" aria-label="District 79 Arts Grant Events home" style={{ display: 'flex' }}>
          <Row vertical="center" gap="12">
            <Image src="/images/d79logo.png" alt="" width={64} height={32} priority />
            <Text variant="label-strong-m" onBackground="neutral-strong" s={{ hide: true }}>
              Arts Grant Events
            </Text>
          </Row>
        </Link>
        <Row gap="8" vertical="center">
          <ThemeSwitcher />
          <Button href="/register-programs" size="s" suffixIcon="arrowRight">
            Register
          </Button>
        </Row>
      </Row>
    </Row>
  );
}

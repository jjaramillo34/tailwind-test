import { Column, Grid, Line, Row, SmartLink, Text } from '@once-ui-system/core';

const CONTACTS = [
  { name: 'Nyesha Green', email: 'NGreene4@schools.nyc.gov' },
  { name: 'Javier Jaramillo', email: 'jjaramillo7@schools.nyc.gov' },
];

export function SiteFooter() {
  return (
    <Row
      as="footer"
      fillWidth
      horizontal="center"
      paddingX="24"
      paddingY="48"
      borderTop
      background="surface"
      className="print-hidden"
    >
      <Column maxWidth="l" gap="32">
        <Grid columns="3" gap="32" m={{ columns: 1 }}>
          <Column gap="12">
            <Text variant="heading-strong-s">District 79</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Providing exceptional educational experiences through arts and cultural programs in
              New York City.
            </Text>
          </Column>
          <Column gap="12">
            <Text variant="heading-strong-s">Questions?</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              For questions about events and registration, contact:
            </Text>
            {CONTACTS.map((contact) => (
              <Column key={contact.email} gap="2">
                <Text variant="label-default-s">{contact.name}</Text>
                <SmartLink href={`mailto:${contact.email}`} prefixIcon="mail">
                  {contact.email}
                </SmartLink>
              </Column>
            ))}
          </Column>
          <Column gap="12">
            <Text variant="heading-strong-s">Quick links</Text>
            <SmartLink href="/register-programs" suffixIcon="arrowRight">
              Register for Programs
            </SmartLink>
          </Column>
        </Grid>
        <Line />
        <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
          © {new Date().getFullYear()} District 79 Arts Grant Events. All rights reserved.
        </Text>
      </Column>
    </Row>
  );
}

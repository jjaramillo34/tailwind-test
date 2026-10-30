'use client';

import { Button, Dialog, Row } from '@once-ui-system/core';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  /** `danger` for destructive actions (delete), `primary` otherwise. */
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** In-app replacement for window.confirm(). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = 'primary',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <Row fillWidth horizontal="end" gap="8">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Row>
      }
    />
  );
}

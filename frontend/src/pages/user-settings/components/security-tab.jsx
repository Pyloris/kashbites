import React, { useState } from 'react';
import { Card, Input, Button, Alert } from '../../../components/ui/index.js';
import { Lock, Key } from 'lucide-react';

export const SecurityTab = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'danger', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Password has been successfully updated!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
  };

  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
        Change Account Password
      </h3>

      {passwordMsg.text && (
        <Alert variant={passwordMsg.type}>{passwordMsg.text}</Alert>
      )}

      <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
        <Input
          label="Current Password"
          type="password"
          required
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-brand-text-subtle" />}
        />

        <Input
          label="New Password"
          type="password"
          required
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          leftIcon={<Key className="w-4 h-4 text-brand-text-subtle" />}
          helperText="Minimum 6 characters with mixed characters recommended."
        />

        <Input
          label="Confirm New Password"
          type="password"
          required
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Key className="w-4 h-4 text-brand-text-subtle" />}
        />

        <Button type="submit" variant="primary" size="md">
          Update Password
        </Button>
      </form>
    </Card>
  );
};

export default SecurityTab;

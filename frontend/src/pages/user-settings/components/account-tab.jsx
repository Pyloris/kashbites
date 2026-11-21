import React from 'react';
import { Card, Input, Button, Alert } from '../../../components/ui/index.js';

export const AccountTab = ({
  name,
  setName,
  phone,
  setPhone,
  email,
  profileSuccessMsg,
  onSubmit,
}) => {
  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
        Personal Information
      </h3>

      {profileSuccessMsg && (
        <Alert variant="success">{profileSuccessMsg}</Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <Input
          label="Full Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email Address (Permanent Account ID)"
          type="email"
          disabled
          value={email}
          helperText="Email cannot be modified directly as it is linked to your order history."
        />

        <Input
          label="Primary Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          helperText="Used by air couriers to coordinate doorstep delivery in your city."
        />

        <Button type="submit" variant="primary" size="md">
          Save Profile Changes
        </Button>
      </form>
    </Card>
  );
};

export default AccountTab;

import React, { useState } from 'react';
import { Card, Input, Button, Alert } from '../../../components/ui/index.js';
import { Send } from 'lucide-react';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Harvest Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Harvest Inquiry',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 600);
  };

  return (
    <Card className="lg:col-span-7 p-6 sm:p-8 space-y-6">
      <h3 className="font-serif-brand text-xl font-bold text-brand-text-display">
        Send Us a Message
      </h3>

      {submitted && (
        <Alert variant="success">
          Thank you! Your message has been routed to our Srinagar support team. We will get back to you shortly.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Full Name *"
            type="text"
            required
            placeholder="Mohammad Owais"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <Input
          label="Email Address *"
          type="email"
          required
          placeholder="owais@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <div>
          <label className="text-[11px] font-bold text-brand-text-muted block mb-1">
            Inquiry Topic
          </label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full text-xs p-2.5 rounded-xl border border-brand-sand bg-brand-canvas focus:outline-none focus:border-brand-emerald"
          >
            <option value="General Harvest Inquiry">General Harvest Inquiry</option>
            <option value="Order Tracking / Air Courier Help">Order Tracking / Air Courier Help</option>
            <option value="Royal Festive Box & Corporate Gifting">Royal Festive Box & Corporate Gifting</option>
            <option value="Wholesale & Cooperative Sourcing">Wholesale & Cooperative Sourcing</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-brand-text-muted block mb-1">
            Your Message *
          </label>
          <textarea
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="How can our Srinagar team help you today?"
            className="w-full text-xs p-3 rounded-xl border border-brand-sand bg-brand-canvas focus:outline-none focus:border-brand-emerald"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          loading={isSubmitting}
          rightIcon={<Send className="w-4 h-4 text-brand-gold" />}
        >
          Send Inquiry to Srinagar Hub
        </Button>
      </form>
    </Card>
  );
};

export default ContactForm;

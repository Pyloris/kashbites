import mongoose, { Schema } from 'mongoose';

const ShippingConfigSchema = new Schema({
    providerName: { type: String, required: true },
    outboundWebhookUrl: { type: String, required: true },
    secretToken: { type: String, required: true },
    isEnabled: { type: Boolean, default: true },
    autoPushOnNewOrder: { type: Boolean, default: true },
}, { timestamps: true });

const WebhookLogSchema = new Schema({
    id: { type: String, required: true },
    direction: { type: String, enum: ['OUTBOUND', 'INBOUND'], required: true },
    event: { type: String, required: true },
    orderNumber: { type: String, required: true },
    targetUrl: { type: String, required: true },
    statusCode: { type: Number, required: true },
    payload: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed },
    timestamp: { type: String, required: true },
}, { timestamps: true });

export const ShippingConfig = mongoose.models.ShippingConfig ||
    mongoose.model('ShippingConfig', ShippingConfigSchema);

export const WebhookLog = mongoose.models.WebhookLog ||
    mongoose.model('WebhookLog', WebhookLogSchema);

export default { ShippingConfig, WebhookLog };

import { randomUUID } from 'node:crypto';

// Third-party vendor stubs — simulate external service calls.
// No real HTTP requests are made; each function logs what would be transmitted
// and returns a plausible success response.
//
// These stubs exist so the DPDP compliance graph agent can trace exactly which
// personal data fields leave the system and to which third party.

// Simulates a downstream DSAR intake webhook. Real processors (Razorpay, Segment,
// Delhivery, etc.) expose a ticket API for erasure / access / rectification.
// The app cannot force deletion downstream — it can only submit the request
// and return the receipt to the data principal.
const makeReceipt = (vendorName, userId, right) => {
  const ticketId = `DSAR-${right.toUpperCase()}-${randomUUID()}`;
  console.log(
    `[VENDOR:${vendorName}] DSAR ${right} request accepted for user ${userId}, ticket=${ticketId}`
  );
  return {
    vendor: vendorName,
    right,
    ticketId,
    submittedAt: new Date().toISOString(),
    note: 'downstream processor will complete asynchronously per data-processing agreement',
  };
};

// Simulates Razorpay / Stripe payment gateway
export const paymentGateway = {
  charge: async ({ orderId, amount, name, email, phone, card, locationLat, locationLng }) => {
    console.log('[VENDOR:paymentGateway] charge', { orderId, amount, name, email, phone, locationLat, locationLng });
    return { gatewayRef: 'PG_' + orderId, status: 'captured' };
  },
  dsarRequest: async (userId, right) => makeReceipt('paymentGateway', userId, right),
};

// Simulates Delhivery / Shiprocket logistics partner
export const logisticsPartner = {
  schedulePickup: async ({ orderId, name, phone, addrLine1, city, pincode, locationLat, locationLng }) => {
    console.log('[VENDOR:logisticsPartner] schedulePickup', { orderId, name, phone, addrLine1, city, pincode, locationLat, locationLng });
    return { awb: 'AWB_' + orderId };
  },
  dsarRequest: async (userId, right) => makeReceipt('logisticsPartner', userId, right),
};

// Simulates Segment / Klaviyo CRM
export const crmService = {
  enroll: async ({ name, email, phone }) => {
    console.log('[VENDOR:crmService] enroll', { name, email, phone });
    return { contactId: 'CRM_' + email };
  },
  track: async (userId, event, properties) => {
    console.log('[VENDOR:crmService] track', { userId, event, properties });
  },
  dsarRequest: async (userId, right) => makeReceipt('crmService', userId, right),
};

// Simulates Mixpanel / Amplitude analytics forwarder
export const analyticsForwarder = {
  track: async (event) => {
    console.log('[VENDOR:analyticsForwarder] track', event);
  },
  dsarRequest: async (userId, right) => makeReceipt('analyticsForwarder', userId, right),
};

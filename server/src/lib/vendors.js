// Third-party vendor stubs — simulate external service calls.
// No real HTTP requests are made; each function logs what would be transmitted
// and returns a plausible success response.
//
// These stubs exist so the DPDP compliance graph agent can trace exactly which
// personal data fields leave the system and to which third party.

// Simulates Razorpay / Stripe payment gateway
export const paymentGateway = {
  charge: async ({ orderId, amount, name, email, phone, card, locationLat, locationLng }) => {
    console.log('[VENDOR:paymentGateway] charge', { orderId, amount, name, email, phone, locationLat, locationLng });
    return { gatewayRef: 'PG_' + orderId, status: 'captured' };
  },
};

// Simulates Delhivery / Shiprocket logistics partner
export const logisticsPartner = {
  schedulePickup: async ({ orderId, name, phone, addrLine1, city, pincode, locationLat, locationLng }) => {
    console.log('[VENDOR:logisticsPartner] schedulePickup', { orderId, name, phone, addrLine1, city, pincode, locationLat, locationLng });
    return { awb: 'AWB_' + orderId };
  },
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
};

// Simulates Mixpanel / Amplitude analytics forwarder
export const analyticsForwarder = {
  track: async (event) => {
    console.log('[VENDOR:analyticsForwarder] track', event);
  },
};

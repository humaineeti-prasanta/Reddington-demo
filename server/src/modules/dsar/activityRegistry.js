

export const ACTIVITY_REGISTRY = {
  'profile-management': {
    mandatory: true,
    stores: ['User', 'Address'],
    vendors: ['crmService', 'logisticsPartner', 'paymentGateway'],
    rights: { access: true, rectify: true, erase: false },
    rectifyFields: ['name', 'phone', 'addresses'],
    vendorDisclosures: [
      { vendor: 'crmService', fields: ['name', 'email', 'phone'] },
      { vendor: 'logisticsPartner', fields: ['name', 'phone', 'address', 'locationLat', 'locationLng'] },
      { vendor: 'paymentGateway', fields: ['name', 'email', 'phone', 'orderAmount', 'locationLat', 'locationLng'] },
    ],
  },
  'notification-transactional': {
    mandatory: false,
    stores: ['EmailLog'],
    vendors: ['crmService'],
    rights: { access: true, rectify: false, erase: true },
    vendorDisclosures: [
      { vendor: 'crmService', fields: ['userId', 'event', 'properties'] },
    ],
    unrecoverable: [
      { store: 'console.log', reason: 'process stdout — no retrieval or purge API' },
    ],
  },
};

export const getActivity = (activityId) => ACTIVITY_REGISTRY[activityId] || null;

export const listActivities = () =>
  Object.entries(ACTIVITY_REGISTRY).map(([id, cfg]) => ({
    activityId: id,
    mandatory: cfg.mandatory,
    rights: cfg.rights,
    stores: cfg.stores,
    vendors: cfg.vendors,
  }));

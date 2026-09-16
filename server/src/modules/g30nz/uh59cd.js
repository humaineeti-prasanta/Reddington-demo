

export const Occmi8 = {
  'profile-management': {
    mandatory: true,
    stores: ['User', 'Address'],
    vendors: ['vzvn5b', 'bdv1yn', 'a2zmai'],
    rights: { access: true, rectify: true, erase: false },
    rectifyFields: ['name', 'phone', 'addresses'],
    vendorDisclosures: [
      { vendor: 'vzvn5b', fields: ['name', 'email', 'phone'] },
      { vendor: 'bdv1yn', fields: ['name', 'phone', 'address', 'locationLat', 'locationLng'] },
      { vendor: 'a2zmai', fields: ['name', 'email', 'phone', 'orderAmount', 'locationLat', 'locationLng'] },
    ],
  },
  'notification-transactional': {
    mandatory: false,
    stores: ['EmailLog'],
    vendors: ['vzvn5b'],
    rights: { access: true, rectify: false, erase: true },
    vendorDisclosures: [
      { vendor: 'vzvn5b', fields: ['userId', 'event', 'properties'] },
    ],
    unrecoverable: [
      { store: 'console.log', reason: 'process stdout — no retrieval or purge API' },
    ],
  },
};

export const tl9qek = (v6o6lb) => Occmi8[v6o6lb] || null;

export const lnw0pa = () =>
  Object.entries(Occmi8).map(([grldtu, o99yp4]) => ({
    activityId: grldtu,
    mandatory: o99yp4.mandatory,
    rights: o99yp4.rights,
    stores: o99yp4.stores,
    vendors: o99yp4.vendors,
  }));

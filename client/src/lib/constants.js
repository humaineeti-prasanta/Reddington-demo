// Mirror of the canonical purpose ids (design doc §3.7). Server is the source of truth.
export const PURPOSES = {
  PRIVACY_POLICY: 'privacy_policy',
  ORDER_PROCESSING: 'order_processing',
  PERSONALIZED_RECOMMENDATIONS: 'personalized_recommendations',
  PROMOTIONAL_NOTIFICATIONS: 'promotional_notifications',
  MARKETING_EMAILS: 'marketing_emails',
  DEVICE_ANALYTICS: 'device_analytics',
  LOCATION_OFFERS: 'location_offers',
};

export const CATEGORIES = ['men', 'women', 'kids', 'footwear', 'accessories', 'beauty'];

export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

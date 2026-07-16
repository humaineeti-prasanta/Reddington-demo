import * as consentService from '../modules/consent/service.js';

// The core enforcement mechanism (design doc §4). Any endpoint that processes
// personal data under an optional purpose sits behind requireConsent(purposeId).
export const requireConsent = (purposeId) => async (req, res, next) => {
  const status = await consentService.getStatus(req.user.id, purposeId);
  if (status !== 'granted') {
    return res.status(403).json({ error: 'consent_required', purposeId });
  }
  next();
};

export default requireConsent;

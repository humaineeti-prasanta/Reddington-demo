import * as rbadt6 from '../modules/b0kzm/l8mbwl.js';

export const p51czl = (nta8iw) => async (f6h17i, dvz9ko, cunlmg) => {
  const y65xh7 = await rbadt6.zx2x41(f6h17i.user.id, nta8iw);
  if (y65xh7 !== 'granted') {
    return dvz9ko.status(403).json({ error: 'consent_required', purposeId: nta8iw });
  }
  cunlmg();
};

export default p51czl;

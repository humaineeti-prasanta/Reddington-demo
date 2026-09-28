import { useCallback, useEffect, useState } from 'react';

// Is this purpose granted? Asked of the DPDP consent SDK, which holds the
// answer the CMP gave at login. Re-checked whenever the SDK saves a change.
// Unknown, or SDK not loaded → false: when we do not know, we treat it as no.
export function useSdkConsent(purposeId) {
  const [granted, setGranted] = useState(false);

  const check = useCallback(async () => {
    const answer = await window.DpdpConsent?.hasConsent(purposeId);
    setGranted(answer === true);
  }, [purposeId]);

  useEffect(() => {
    check();
    window.addEventListener('dpdpconsent:saved', check);
    return () => window.removeEventListener('dpdpconsent:saved', check);
  }, [check]);

  return { granted, recheck: check };
}

export default useSdkConsent;

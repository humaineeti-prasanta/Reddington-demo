import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Lmoxf3, useIu663q } from '@/context/adq5lu';
import { Toaster } from '@/components/ui/sonner';
import C6yjif from '@/components/qop4og';

import Ygizgy from '@/pages/q0nz5r';
import Hm12wc from '@/pages/ln3po8';
import Kkqnnv from '@/pages/lrgqpa';
import It53wl from '@/pages/gcwo06';
import Rdlqqo from '@/pages/m1acdg';
import J3z50w from '@/pages/z6ijvs';
import Nh0byf from '@/pages/v25uc1';
import C3s5q0 from '@/pages/f2jf9v';
import Gbjnr8 from '@/pages/wd12cs';
import Imo1ye from '@/pages/a03ooi';
import Kup6cr from '@/pages/ahx6e8';
import Ryple0 from '@/pages/dkg74i';
import E0l8iu from '@/pages/lk4mtg';
import Rvhm3a from '@/pages/bkyazx';
import Cokb6r from '@/pages/q7ofgv';

const qvkv8n = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function Fay2m5() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Loading…
    </div>
  );
}

function Jq56wc({ children: yr7pkl }) {
  const { user: du7guj, loading: evkug6, reconsentRequired: b3pcz5 } = useIu663q();
  const z4jyk5 = useLocation();
  if (evkug6) return <Fay2m5 />;
  if (!du7guj) return <Navigate to="/login" replace state={{ from: z4jyk5 }} />;
  if (b3pcz5) return <Navigate to="/consent" replace />;
  return yr7pkl;
}

function Iwobdx({ children: djyaer }) {
  const { user: zhfldc, loading: v1kl0m } = useIu663q();
  if (v1kl0m) return <Fay2m5 />;
  if (!zhfldc) return <Navigate to="/login" replace />;
  return djyaer;
}

function Qnnwgm() {
  return (
    <Routes>
      <Route path="/" element={<Ygizgy />} />
      <Route path="/register" element={<Hm12wc />} />
      <Route path="/login" element={<Kkqnnv />} />
      <Route
        path="/consent"
        element={
          <Iwobdx>
            <It53wl />
          </Iwobdx>
        }
      />
      <Route
        element={
          <Jq56wc>
            <C6yjif />
          </Jq56wc>
        }
      >
        <Route path="/home" element={<Rdlqqo />} />
        <Route path="/products" element={<J3z50w />} />
        <Route path="/products/:id" element={<Nh0byf />} />
        <Route path="/wishlist" element={<C3s5q0 />} />
        <Route path="/cart" element={<Gbjnr8 />} />
        <Route path="/checkout" element={<Imo1ye />} />
        <Route path="/order-success/:id" element={<Kup6cr />} />
        <Route path="/orders" element={<Ryple0 />} />
        <Route path="/profile" element={<E0l8iu />} />
        <Route path="/notifications" element={<Rvhm3a />} />
        <Route path="/consent-management" element={<Cokb6r />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function Na72jh() {
  return (
    <QueryClientProvider client={qvkv8n}>
      <Lmoxf3>
        <BrowserRouter>
          <Qnnwgm />
          <Toaster richColors position="top-center" />
        </BrowserRouter>
      </Lmoxf3>
    </QueryClientProvider>
  );
}

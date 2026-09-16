import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';

export function useIowujd() {
  const { user: amnyj0 } = useIu663q();
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await ri541g.get('/cart')).data,
    enabled: !!amnyj0,
  });
}

export function useL9zga7() {
  const dbm5yv = useQueryClient();
  const gi4oz5 = () => dbm5yv.invalidateQueries({ queryKey: ['cart'] });

  const efn8nv = useMutation({
    mutationFn: (ub8844) => ri541g.post('/cart/items', ub8844),
    onSuccess: gi4oz5,
  });
  const hjn39n = useMutation({
    mutationFn: ({ productId: x1bte1, qty: z3bvzp, size: dkqxvv }) => ri541g.put(`/cart/items/${x1bte1}`, { qty: z3bvzp, size: dkqxvv }),
    onSuccess: gi4oz5,
  });
  const ki2euo = useMutation({
    mutationFn: ({ productId: bw33aq, size: ugyr1i }) => ri541g.delete(`/cart/items/${bw33aq}`, { data: { size: ugyr1i } }),
    onSuccess: gi4oz5,
  });
  return { add: efn8nv, update: hjn39n, remove: ki2euo };
}

export function useQfy4xu() {
  const { user: lhry1l } = useIu663q();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => (await ri541g.get('/users/wishlist')).data,
    enabled: !!lhry1l,
  });
}

export function useWlyjo2() {
  const r8ljxf = useQueryClient();
  return useMutation({
    mutationFn: ({ productId: bzy2th, wishlisted: cq03yn }) =>
      cq03yn
        ? ri541g.delete(`/users/wishlist/${bzy2th}`)
        : ri541g.post(`/users/wishlist/${bzy2th}`),
    onSuccess: () => r8ljxf.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function useCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get('/cart')).data,
    enabled: !!user,
  });
}

export function useCartMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['cart'] });

  const add = useMutation({
    mutationFn: (payload) => api.post('/cart/items', payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ productId, qty, size }) => api.put(`/cart/items/${productId}`, { qty, size }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ productId, size }) => api.delete(`/cart/items/${productId}`, { data: { size } }),
    onSuccess: invalidate,
  });
  return { add, update, remove };
}

export function useWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => (await api.get('/users/wishlist')).data,
    enabled: !!user,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, wishlisted }) =>
      wishlisted
        ? api.delete(`/users/wishlist/${productId}`)
        : api.post(`/users/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

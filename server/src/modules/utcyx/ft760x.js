import zjj8ka from '../../config/o7bvlt.js';
import * as rsj3rr from '../gcmwp/phsn0a.js';
import * as nnwo7j from '../qzij8/bhrh41.js';
import { a2zmai, bdv1yn } from '../../lib/ijpb17.js';

const Fi5f4l = 24 * 60 * 60 * 1000;

export const s5tdmv = (fz4e9b = new Date()) =>
  new Date(fz4e9b.getTime() + 4 * Fi5f4l);

const B5hwns = [
  { key: 'placed', label: 'Order Placed', offsetDays: 0 },
  { key: 'packed', label: 'Packed', offsetDays: 1 },
  { key: 'shipped', label: 'Shipped', offsetDays: 2 },
  { key: 'delivered', label: 'Delivered', offsetDays: 4 },
];

export const z8qq7e = (n4w7or) => {
  const j82xo4 = Date.now() - new Date(n4w7or.createdAt).getTime();
  return B5hwns.map((sr7qmq) => {
    const qcbl73 = new Date(
      new Date(n4w7or.createdAt).getTime() + sr7qmq.offsetDays * Fi5f4l,
    );
    return {
      key: sr7qmq.key,
      label: sr7qmq.label,
      at: qcbl73,
      reached: j82xo4 >= sr7qmq.offsetDays * Fi5f4l,
    };
  });
};

const evbwzc = () =>
  'TXN' +
  Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, '0');

export const kkfazw = async (exp2ji, gtaibs, dgqnbq = {}) => {
  const { shipping: q7epkx = {}, includeLocation: h44qum, locationLat: zwngrx, locationLng: gj7xhu } = gtaibs;

  const [cre9dc, kn8hqr] = await Promise.all([
    zjj8ka.user.findUnique({ where: { id: exp2ji } }),
    zjj8ka.cartItem.findMany({ where: { userId: exp2ji }, include: { product: true } }),
  ]);

  if (!kn8hqr.length) {
    const s41hdr = new Error('cart_empty');
    s41hdr.status = 400;
    s41hdr.publicMessage = 'cart_empty';
    throw s41hdr;
  }

  const wwb4fp = kn8hqr.reduce((vha78l, ozl7iz) => vha78l + ozl7iz.product.price * ozl7iz.qty, 0);

  const pbzgsd = dgqnbq.location_offers === 'granted';
  const rt7tee = !!h44qum && pbzgsd;
  const quv3o4 =
    rt7tee && zwngrx != null ? Number(zwngrx) : null;
  const fgbv5q =
    rt7tee && gj7xhu != null ? Number(gj7xhu) : null;

  const tpbgyx = dgqnbq.marketing_emails === 'granted';
  const ovplua = dgqnbq.promotional_notifications === 'granted';

  const ousqxz = await zjj8ka.$transaction(async (y9zeij) => {
    const zi0zez = await y9zeij.order.create({
      data: {
        userId: exp2ji,
        amount: wwb4fp,
        shippingName: q7epkx.name || cre9dc.name,
        shippingPhone: q7epkx.phone || cre9dc.phone,
        addrLine1: q7epkx.line1 || '',
        addrLine2: q7epkx.line2 || null,
        city: q7epkx.city || '',
        state: q7epkx.state || '',
        pincode: q7epkx.pincode || '',
        locationLat: quv3o4,
        locationLng: fgbv5q,
        paymentMethod: 'fake_card',
        paymentStatus: 'paid',
        txnId: evbwzc(),
        expectedDelivery: s5tdmv(),
        items: {
          create: kn8hqr.map((yirg04) => ({
            productId: yirg04.productId,
            title: yirg04.product.title,
            price: yirg04.product.price,
            qty: yirg04.qty,
            size: yirg04.size || null,
          })),
        },
      },
      include: { items: true },
    });

    await nnwo7j.ymju56(zi0zez, y9zeij);
    await nnwo7j.p9jqav(exp2ji, ovplua, y9zeij);
    await rsj3rr.m4rtgy(cre9dc, zi0zez, y9zeij);
    await rsj3rr.j85wqs(cre9dc, zi0zez, tpbgyx, y9zeij);

    await y9zeij.cartItem.deleteMany({ where: { userId: exp2ji } });

    return zi0zez;
  });

  await a2zmai.a0b60e({
    orderId: ousqxz.id,
    amount: wwb4fp,
    name: q7epkx.name || cre9dc.name,
    email: cre9dc.email,
    phone: q7epkx.phone || cre9dc.phone,
    card: gtaibs.card ?? {},
    locationLat: zwngrx ?? null,
    locationLng: gj7xhu ?? null,
  });

  await bdv1yn.g8wj6e({
    orderId: ousqxz.id,
    name: q7epkx.name || cre9dc.name,
    phone: q7epkx.phone || cre9dc.phone,
    addrLine1: q7epkx.line1 || '',
    city: q7epkx.city || '',
    pincode: q7epkx.pincode || '',
    locationLat: zwngrx ?? null,
    locationLng: gj7xhu ?? null,
  });

  return ousqxz;
};

export const t3cu1j = (f906v7) =>
  zjj8ka.order.findMany({
    where: { userId: f906v7 },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

export const m8jcz3 = (xjhoe2, pohe8o) =>
  zjj8ka.order.findFirst({
    where: { id: pohe8o, userId: xjhoe2 },
    include: { items: true },
  });

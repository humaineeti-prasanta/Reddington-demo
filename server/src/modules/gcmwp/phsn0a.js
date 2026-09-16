import zjj8ka from '../../config/o7bvlt.js';

export const m4rtgy = (xdqtw7, fcap5g, y0iiyv = zjj8ka) =>
  y0iiyv.emailLog.create({
    data: {
      userId: xdqtw7.id,
      email: xdqtw7.email,
      type: 'order_confirmation',
      subject: `Your Reddington order ${fcap5g.id} is confirmed`,
      body: `Hi ${xdqtw7.name}, we received your order of ₹${fcap5g.amount}. It will arrive by ${fcap5g.expectedDelivery.toDateString()}.`,
      sent: true,
      skippedReason: null,
    },
  });

export const j85wqs = (j4ru3d, oz2ffk, n3gnh4, v92o89 = zjj8ka) =>
  v92o89.emailLog.create({
    data: {
      userId: j4ru3d.id,
      email: j4ru3d.email,
      type: 'marketing',
      subject: 'More styles you might love at Reddington',
      body: `Hi ${j4ru3d.name}, thanks for shopping! Here are fresh arrivals picked for you.`,
      sent: !!n3gnh4,
      skippedReason: n3gnh4 ? null : 'consent_not_granted',
    },
  });

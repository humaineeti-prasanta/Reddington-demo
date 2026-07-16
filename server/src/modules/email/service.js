import prisma from '../../config/prisma.js';

// EmailLog is the evidence trail that consent was honored. No real emails are sent.

export const orderConfirmation = (user, order, tx = prisma) =>
  tx.emailLog.create({
    data: {
      userId: user.id,
      email: user.email,
      type: 'order_confirmation',
      subject: `Your Reddington order ${order.id} is confirmed`,
      body: `Hi ${user.name}, we received your order of ₹${order.amount}. It will arrive by ${order.expectedDelivery.toDateString()}.`,
      sent: true, // covered by mandatory order_processing
      skippedReason: null,
    },
  });

// Marketing email is logged either way; only actually "sent" when consent is granted.
export const marketing = (user, order, granted, tx = prisma) =>
  tx.emailLog.create({
    data: {
      userId: user.id,
      email: user.email,
      type: 'marketing',
      subject: 'More styles you might love at Reddington',
      body: `Hi ${user.name}, thanks for shopping! Here are fresh arrivals picked for you.`,
      sent: !!granted,
      skippedReason: granted ? null : 'consent_not_granted',
    },
  });

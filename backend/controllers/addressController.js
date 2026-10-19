import asyncHandler from 'express-async-handler';
import { Order, SavedAddress } from '../models/index.js';

export const getSavedAddresses = asyncHandler(async (req, res) => {
  const previousOrders = await Order.findAll({
    attributes: ['deliveryAddress'],
    where: { consumerRef: req.user.id },
    group: ['deliveryAddress'],
    raw: true
  });

  for (const { deliveryAddress } of previousOrders) {
    if (deliveryAddress?.trim()) {
      await SavedAddress.findOrCreate({
        where: { userRef: req.user.id, address: deliveryAddress.trim() },
        defaults: { label: 'Previously used', userRef: req.user.id, address: deliveryAddress.trim() }
      });
    }
  }

  const addresses = await SavedAddress.findAll({
    where: { userRef: req.user.id },
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: addresses });
});

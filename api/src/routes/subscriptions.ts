import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const subscriptionSchema = z.object({
  telegramId: z.string().optional(),
  email: z.string().email().optional(),
  preferences: z.object({
    minAmount: z.number().default(500),
    categories: z.array(z.string()).default([]),
    parties: z.array(z.string()).default([]),
    politicians: z.array(z.string()).default([])
  }).default({})
}).refine(data => data.telegramId || data.email, {
  message: 'Either telegramId or email must be provided'
});

// POST /api/subscriptions - Subscribe to notifications
router.post('/', async (req, res) => {
  try {
    const result = subscriptionSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: result.error.errors 
      });
    }
    
    const { telegramId, email, preferences } = result.data;
    
    // Check if subscription already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          telegramId ? { telegramId } : {},
          email ? { email } : {}
        ]
      }
    });
    
    if (existing) {
      // Update existing subscription
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          notificationPrefs: preferences
        }
      });
      
      return res.json({
        message: 'Subscription updated',
        data: updated
      });
    }
    
    // Create new subscription
    const subscription = await prisma.user.create({
      data: {
        telegramId: telegramId || null,
        email: email || null,
        notificationPrefs: preferences
      }
    });
    
    res.status(201).json({
      message: 'Subscription created',
      data: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// DELETE /api/subscriptions/:id - Unsubscribe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// GET /api/subscriptions/:id - Get subscription details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json({ data: subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export { router as subscriptionsRouter };
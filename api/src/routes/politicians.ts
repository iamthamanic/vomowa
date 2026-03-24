import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/politicians - List all politicians with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const party = req.query.party as string;
    const search = req.query.search as string;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (party) {
      where.party = party;
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    const [politicians, total] = await Promise.all([
      prisma.politician.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { spending: true }
          }
        }
      }),
      prisma.politician.count({ where })
    ]);
    
    res.json({
      data: politicians,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching politicians:', error);
    res.status(500).json({ error: 'Failed to fetch politicians' });
  }
});

// GET /api/politicians/:id - Get single politician with spending history
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const politician = await prisma.politician.findUnique({
      where: { id },
      include: {
        spending: {
          orderBy: { date: 'desc' },
          take: 50
        }
      }
    });
    
    if (!politician) {
      return res.status(404).json({ error: 'Politician not found' });
    }
    
    // Calculate total spending
    const totalSpending = await prisma.spending.aggregate({
      where: { politicianId: id },
      _sum: { amount: true },
      _count: true
    });
    
    res.json({
      ...politician,
      stats: {
        totalAmount: totalSpending._sum.amount || 0,
        totalTransactions: totalSpending._count
      }
    });
  } catch (error) {
    console.error('Error fetching politician:', error);
    res.status(500).json({ error: 'Failed to fetch politician' });
  }
});

// GET /api/politicians/:id/spending - Get spending for specific politician
router.get('/:id/spending', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    
    const skip = (page - 1) * limit;
    
    const where: any = { politicianId: id };
    
    if (category) {
      where.category = category;
    }
    
    const [spending, total] = await Promise.all([
      prisma.spending.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      prisma.spending.count({ where })
    ]);
    
    res.json({
      data: spending,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching spending:', error);
    res.status(500).json({ error: 'Failed to fetch spending' });
  }
});

export { router as politiciansRouter };
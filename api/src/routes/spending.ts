import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/spending - List all spending with filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const politicianId = req.query.politicianId as string;
    const category = req.query.category as string;
    const minAmount = parseFloat(req.query.minAmount as string);
    const maxAmount = parseFloat(req.query.maxAmount as string);
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (politicianId) {
      where.politicianId = politicianId;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (!isNaN(minAmount) || !isNaN(maxAmount)) {
      where.amount = {};
      if (!isNaN(minAmount)) where.amount.gte = minAmount;
      if (!isNaN(maxAmount)) where.amount.lte = maxAmount;
    }
    
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate);
      if (toDate) where.date.lte = new Date(toDate);
    }
    
    const [spending, total] = await Promise.all([
      prisma.spending.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          politician: {
            select: {
              id: true,
              name: true,
              party: true
            }
          }
        }
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

// GET /api/spending/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    
    const dateFilter: any = {};
    if (fromDate || toDate) {
      dateFilter.date = {};
      if (fromDate) dateFilter.date.gte = new Date(fromDate);
      if (toDate) dateFilter.date.lte = new Date(toDate);
    }
    
    // Total spending
    const totalSpending = await prisma.spending.aggregate({
      where: dateFilter,
      _sum: { amount: true },
      _count: true
    });
    
    // Spending by category
    const byCategory = await prisma.spending.groupBy({
      by: ['category'],
      where: dateFilter,
      _sum: { amount: true },
      _count: true
    });
    
    // Spending by party (via politician)
    const byParty = await prisma.spending.groupBy({
      by: ['politician.party'],
      where: dateFilter,
      _sum: { amount: true },
      _count: true
    });
    
    // Top spenders
    const topSpenders = await prisma.spending.groupBy({
      by: ['politicianId'],
      where: dateFilter,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });
    
    // Get politician details for top spenders
    const topSpendersWithDetails = await Promise.all(
      topSpenders.map(async (s) => {
        const politician = await prisma.politician.findUnique({
          where: { id: s.politicianId },
          select: { name: true, party: true }
        });
        return {
          ...s,
          politician
        };
      })
    );
    
    // Recent trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyTrend = await prisma.spending.groupBy({
      by: ['date'],
      where: {
        date: { gte: twelveMonthsAgo }
      },
      _sum: { amount: true }
    });
    
    res.json({
      summary: {
        totalAmount: totalSpending._sum.amount || 0,
        totalTransactions: totalSpending._count
      },
      byCategory,
      byParty,
      topSpenders: topSpendersWithDetails,
      monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/spending/trends - Get trends over time
router.get('/trends', async (req, res) => {
  try {
    const period = req.query.period as string || 'monthly'; // monthly, yearly
    
    let groupByFormat: any;
    
    if (period === 'yearly') {
      // Group by year
      const trend = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('year', date) as period,
          SUM(amount) as total,
          COUNT(*) as count
        FROM "Spending"
        GROUP BY DATE_TRUNC('year', date)
        ORDER BY period ASC
      `;
      return res.json({ period, data: trend });
    } else {
      // Group by month
      const trend = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', date) as period,
          SUM(amount) as total,
          COUNT(*) as count
        FROM "Spending"
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY period ASC
      `;
      return res.json({ period, data: trend });
    }
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

export { router as spendingRouter };
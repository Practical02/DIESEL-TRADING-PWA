import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Fetch monthly sales data
    const monthlySales = await prisma.sale.groupBy({
      by: ['sale_date'],
      _sum: {
        quantity: true,
        total_amount: true,
        purchase_cost: true,
      },
      where: {
        sale_date: {
          gte: startOfYear,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      orderBy: {
        sale_date: 'asc',
      },
    });

    // Calculate profits from the raw data
    const monthlyProfits = monthlySales.map(sale => {
      const totalCost = sale._sum.quantity! * sale._sum.purchase_cost!;
      const profit = sale._sum.total_amount! - totalCost;
      return {
        sale_date: sale.sale_date,
        profit,
      };
    });

    // Get individual sales to calculate total cost properly
    const yearlySales = await prisma.sale.findMany({
      select: {
        quantity: true,
        total_amount: true,
        purchase_cost: true,
      },
      where: {
        sale_date: {
          gte: startOfYear,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });

    // Calculate yearly stats
    const yearlyStats = yearlySales.reduce((acc, sale) => {
      acc.totalQuantity += sale.quantity;
      acc.totalAmount += sale.total_amount;
      acc.totalCost += sale.quantity * sale.purchase_cost;
      return acc;
    }, {
      totalQuantity: 0,
      totalAmount: 0,
      totalCost: 0,
    });

    // Get pending LPOs count
    const pendingLPOCount = await prisma.sale.count({
      where: {
        status: 'PENDING_LPO',
      },
    });

    // Get pending invoices count
    const pendingInvoiceCount = await prisma.lPO.count({
      where: {
        status: 'INVOICE_PENDING',
      },
    });

    // Get recent sales
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: {
        sale_date: 'desc',
      },
      include: {
        client: true,
        project: true,
      },
    });

    // Get stock summary
    const stockSummary = await prisma.stock.aggregate({
      _sum: {
        quantity: true,
      },
    });

    return NextResponse.json({
      monthlyProfits,
      yearlyStats: {
        totalQuantity: yearlyStats.totalQuantity,
        totalAmount: yearlyStats.totalAmount,
        totalCost: yearlyStats.totalCost,
        totalProfit: yearlyStats.totalAmount - yearlyStats.totalCost,
        profitMargin: yearlyStats.totalAmount > 0 ? ((yearlyStats.totalAmount - yearlyStats.totalCost) / yearlyStats.totalAmount) * 100 : 0,
      },
      pendingLPOCount,
      pendingInvoiceCount,
      recentSales,
      stockSummary: {
        totalQuantity: stockSummary._sum.quantity || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 
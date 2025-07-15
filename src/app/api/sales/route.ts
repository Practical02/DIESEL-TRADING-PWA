import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const include = searchParams.get('include')?.split(',') || [];
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  try {
    // Build where clause
    const where: {
      status?: string;
      sale_date?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};
    
    if (status) {
      where.status = status;
    }
    
    if (start || end) {
      where.sale_date = {};
      if (start) {
        where.sale_date.gte = new Date(start);
      }
      if (end) {
        where.sale_date.lte = new Date(end);
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        client: true,
        project: true,
        payments: include.includes('payments'),
        lpo: include.includes('lpo') ? {
          include: {
            invoice: include.includes('invoice')
          }
        } : false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate that we have enough stock
    const availableStock = await prisma.stock.aggregate({
      _sum: {
        quantity: true,
      },
    });

    const totalStockQuantity = availableStock._sum.quantity || 0;
    
    if (totalStockQuantity < body.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${totalStockQuantity} gallons, Required: ${body.quantity} gallons` },
        { status: 400 }
      );
    }

    // Create sale and reduce stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.sale.create({
        data: {
          clientId: body.clientId,
          projectId: body.projectId,
          quantity: body.quantity,
          unit_price: body.unit_price,
          purchase_cost: body.purchase_cost,
          total_amount: body.total_amount,
          status: 'PENDING_LPO',
          sale_date: new Date(body.sale_date),
          remarks: body.remarks,
        },
        include: {
          client: true,
          project: true,
        },
      });

      // Reduce stock using FIFO (First In, First Out) method
      let remainingQuantity = body.quantity;
      
      const stockEntries = await tx.stock.findMany({
        where: {
          quantity: {
            gt: 0,
          },
        },
        orderBy: {
          purchase_date: 'asc', // FIFO - oldest first
        },
      });

      for (const stockEntry of stockEntries) {
        if (remainingQuantity <= 0) break;

        const quantityToDeduct = Math.min(remainingQuantity, stockEntry.quantity);
        
        await tx.stock.update({
          where: { id: stockEntry.id },
          data: {
            quantity: stockEntry.quantity - quantityToDeduct,
          },
        });

        remainingQuantity -= quantityToDeduct;
      }

      return sale;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        ...data,
        sale_date: data.sale_date ? new Date(data.sale_date) : undefined,
      },
      include: {
        client: true,
        project: true,
        lpo: {
          include: {
            invoice: true
          }
        },
      },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'Failed to update sale' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Sale ID is required' },
      { status: 400 }
    );
  }

  try {
    await prisma.sale.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: 'Failed to delete sale' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  try {
    // Build where clause
    const where: {
      purchase_date?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};
    
    if (start || end) {
      where.purchase_date = {};
      if (start) {
        where.purchase_date.gte = new Date(start);
      }
      if (end) {
        where.purchase_date.lte = new Date(end);
      }
    }

    const stock = await prisma.stock.findMany({
      where,
      orderBy: {
        purchase_date: 'desc',
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const stock = await prisma.stock.create({
      data: {
        supplier: body.supplier,
        quantity: parseFloat(body.quantity),
        purchase_cost: parseFloat(body.purchase_cost),
        purchase_date: new Date(body.purchase_date),
        remarks: body.remarks,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Error creating stock:', error);
    return NextResponse.json(
      { error: 'Failed to create stock' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const stock = await prisma.stock.update({
      where: { id },
      data: {
        ...data,
        quantity: parseFloat(data.quantity),
        purchase_cost: parseFloat(data.purchase_cost),
        purchase_date: new Date(data.purchase_date),
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Stock ID is required' },
      { status: 400 }
    );
  }

  try {
    await prisma.stock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      { error: 'Failed to delete stock' },
      { status: 500 }
    );
  }
} 
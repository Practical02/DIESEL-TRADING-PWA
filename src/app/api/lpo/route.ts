import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const include = searchParams.get('include')?.split(',') || [];

  try {
    const lpos = await prisma.lPO.findMany({
      where: status ? { status } : undefined,
      include: {
        sale: {
          include: {
            client: true,
            project: true,
          }
        },
        invoice: include.includes('invoice')
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(lpos);
  } catch (error) {
    console.error('Error fetching LPOs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LPOs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.saleId) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      );
    }

    if (!body.lpo_no) {
      return NextResponse.json(
        { error: 'LPO number is required' },
        { status: 400 }
      );
    }

    if (!body.lpo_date) {
      return NextResponse.json(
        { error: 'LPO date is required' },
        { status: 400 }
      );
    }

    // Check if LPO number is unique
    const existingLPO = await prisma.lPO.findFirst({
      where: { lpo_no: body.lpo_no }
    });

    if (existingLPO) {
      return NextResponse.json(
        { error: 'LPO number already exists' },
        { status: 400 }
      );
    }

    // Check if sale exists and is in correct state
    const sale = await prisma.sale.findUnique({
      where: { id: body.saleId },
      include: { lpo: true }
    });

    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    if (sale.status !== 'PENDING_LPO') {
      return NextResponse.json(
        { error: 'Sale is not in the correct state for LPO creation' },
        { status: 400 }
      );
    }

    if (sale.lpo) {
      return NextResponse.json(
        { error: 'LPO already exists for this sale' },
        { status: 400 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the LPO
      const lpo = await tx.lPO.create({
        data: {
          saleId: body.saleId,
          lpo_no: body.lpo_no,
          lpo_date: new Date(body.lpo_date),
          status: 'INVOICE_PENDING',
          remarks: body.remarks,
        },
        include: {
          sale: {
            include: {
              client: true,
              project: true,
            }
          }
        }
      });

      // Update the sale status
      await tx.sale.update({
        where: { id: body.saleId },
        data: { status: 'LPO_RECEIVED' },
      });

      return lpo;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating LPO:', error);
    return NextResponse.json(
      { error: 'Failed to create LPO' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const lpo = await prisma.lPO.update({
      where: { id },
      data: {
        ...data,
        lpo_date: data.lpo_date ? new Date(data.lpo_date) : undefined,
      },
      include: {
        sale: {
          include: {
            client: true,
            project: true,
          }
        },
        invoice: true
      },
    });

    return NextResponse.json(lpo);
  } catch (error) {
    console.error('Error updating LPO:', error);
    return NextResponse.json(
      { error: 'Failed to update LPO' },
      { status: 500 }
    );
  }
} 
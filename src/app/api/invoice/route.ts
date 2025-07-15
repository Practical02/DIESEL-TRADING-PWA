import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const invoices = await prisma.invoice.findMany({
      where: status ? { status } : undefined,
      include: {
        lpo: {
          include: {
            sale: {
              include: {
                client: true,
                project: true,
                payments: {
                  orderBy: {
                    payment_date: 'desc',
                  },
                },
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received invoice creation request:', body);

    if (!body.lpoId) {
      console.error('Missing lpoId in request body');
      return NextResponse.json(
        { error: 'LPO ID is required' },
        { status: 400 }
      );
    }

    if (!body.invoice_no) {
      console.error('Missing invoice_no in request body');
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      );
    }

    if (!body.invoice_date) {
      console.error('Missing invoice_date in request body');
      return NextResponse.json(
        { error: 'Invoice date is required' },
        { status: 400 }
      );
    }

    // First check if the LPO exists and is in the correct state
    console.log('Fetching LPO:', body.lpoId);
    const existingLPO = await prisma.lPO.findUnique({
      where: { id: body.lpoId },
      include: {
        invoice: true,
        sale: true,
      }
    });

    if (!existingLPO) {
      console.error('LPO not found:', body.lpoId);
      return NextResponse.json(
        { error: 'LPO not found' },
        { status: 404 }
      );
    }

    console.log('Found LPO:', {
      id: existingLPO.id,
      status: existingLPO.status,
      hasInvoice: !!existingLPO.invoice
    });

    if (existingLPO.status !== 'INVOICE_PENDING') {
      console.error('Invalid LPO status:', existingLPO.status);
      return NextResponse.json(
        { error: 'LPO is not in the correct state for invoice generation' },
        { status: 400 }
      );
    }

    if (existingLPO.invoice) {
      console.error('Invoice already exists for LPO:', existingLPO.id);
      return NextResponse.json(
        { error: 'Invoice already exists for this LPO' },
        { status: 400 }
      );
    }

    // Check if invoice number is unique
    console.log('Checking for duplicate invoice number:', body.invoice_no);
    const existingInvoice = await prisma.invoice.findFirst({
      where: { invoice_no: body.invoice_no }
    });

    if (existingInvoice) {
      console.error('Duplicate invoice number:', body.invoice_no);
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      );
    }

    console.log('Starting transaction for invoice creation');
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the invoice
      console.log('Creating invoice');
      const invoice = await tx.invoice.create({
        data: {
          lpoId: body.lpoId,
          invoice_no: body.invoice_no,
          invoice_date: new Date(body.invoice_date),
          status: 'PENDING_PAYMENT',
          remarks: body.remarks,
        },
      });
      console.log('Invoice created:', invoice.id);

      // Update the LPO status
      console.log('Updating LPO status');
      await tx.lPO.update({
        where: { id: body.lpoId },
        data: { status: 'COMPLETED' },
      });

      // Update the sale status
      console.log('Updating sale status');
      await tx.sale.update({
        where: { id: existingLPO.saleId },
        data: { status: 'INVOICE_GENERATED' },
      });

      return invoice;
    });

    console.log('Transaction completed successfully');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating invoice:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        invoice_date: new Date(data.invoice_date),
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
} 
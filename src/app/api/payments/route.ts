import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const saleId = searchParams.get('saleId');

    if (id) {
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          sale: {
            select: {
              id: true,
              quantity: true,
              unit_price: true,
              total_amount: true,
              status: true,
              lpo: {
                select: {
                  lpo_no: true,
                  invoice: {
                    select: {
                      invoice_no: true
                    }
                  }
                }
              },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(payment);
    }

    if (saleId) {
      const payments = await prisma.payment.findMany({
        where: { saleId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          sale: {
            select: {
              id: true,
              quantity: true,
              unit_price: true,
              total_amount: true,
              status: true,
              lpo: {
                select: {
                  lpo_no: true,
                  invoice: {
                    select: {
                      invoice_no: true
                    }
                  }
                }
              },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          payment_date: 'desc',
        },
      });

      return NextResponse.json(payments);
    }

    const payments = await prisma.payment.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        sale: {
          select: {
            id: true,
            quantity: true,
            unit_price: true,
            total_amount: true,
            status: true,
            lpo: {
              select: {
                lpo_no: true,
                invoice: {
                  select: {
                    invoice_no: true
                  }
                }
              }
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        payment_date: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      saleId,
      payment_date,
      payment_method,
      reference_no,
      amount,
      remarks,
    } = body;

    // Get the sale to validate payment amount
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        payments: true,
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    // Check if sale is in a valid status for payment
    if (!['INVOICE_GENERATED', 'PARTIALLY_PAID'].includes(sale.status)) {
      return NextResponse.json(
        { error: 'Sale must be invoiced before accepting payments' },
        { status: 400 }
      );
    }

    // Calculate total paid amount including this payment
    const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0) + amount;

    // Check if payment would exceed total amount
    if (totalPaid > sale.total_amount) {
      return NextResponse.json(
        { error: 'Payment amount exceeds remaining balance' },
        { status: 400 }
      );
    }

    // Create payment and update sale status in a transaction
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          clientId,
          saleId,
          payment_date: new Date(payment_date),
          payment_method,
          reference_no,
          amount,
          remarks,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          sale: {
            select: {
              id: true,
              quantity: true,
              unit_price: true,
              total_amount: true,
              status: true,
              lpo: {
                select: {
                  lpo_no: true,
                  invoice: {
                    select: {
                      invoice_no: true
                    }
                  }
                }
              },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Update sale status based on payment amount
      await tx.sale.update({
        where: { id: saleId },
        data: {
          status: totalPaid === sale.total_amount ? 'FULLY_PAID' : 'PARTIALLY_PAID',
        },
      });

      return newPayment;
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      payment_date,
      payment_method,
      reference_no,
      amount,
      remarks,
    } = body;

    // Get current payment and sale data
    const currentPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        sale: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!currentPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Calculate total paid amount with updated payment
    const totalPaid = currentPayment.sale.payments.reduce(
      (sum, p) => sum + (p.id === id ? amount : p.amount),
      0
    );

    // Check if updated payment would exceed total amount
    if (totalPaid > currentPayment.sale.total_amount) {
      return NextResponse.json(
        { error: 'Payment amount exceeds remaining balance' },
        { status: 400 }
      );
    }

    // Update payment and sale status in a transaction
    const payment = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          payment_date: new Date(payment_date),
          payment_method,
          reference_no,
          amount,
          remarks,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          sale: {
            select: {
              id: true,
              quantity: true,
              unit_price: true,
              total_amount: true,
              status: true,
              lpo: {
                select: {
                  lpo_no: true,
                  invoice: {
                    select: {
                      invoice_no: true
                    }
                  }
                }
              },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Update sale status based on total paid amount
      await tx.sale.update({
        where: { id: currentPayment.sale.id },
        data: {
          status: totalPaid === currentPayment.sale.total_amount ? 'FULLY_PAID' : 'PARTIALLY_PAID',
        },
      });

      return updatedPayment;
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get current payment and sale data
    const currentPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        sale: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!currentPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Delete payment and update sale status in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({
        where: { id },
      });

      // Calculate remaining total paid amount
      const remainingPayments = currentPayment.sale.payments.filter(p => p.id !== id);
      const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);

      // Update sale status based on remaining payments
      await tx.sale.update({
        where: { id: currentPayment.sale.id },
        data: {
          status: totalPaid === 0 ? 'INVOICE_GENERATED' : 
                 totalPaid === currentPayment.sale.total_amount ? 'FULLY_PAID' : 
                 'PARTIALLY_PAID',
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
} 
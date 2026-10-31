import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client";

const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Full name is required"),
  shippingAddress: z.string().min(5, "Shipping address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(6, "Valid 6-digit postal code required"),
  phone: z.string().min(10, "Valid phone number required"),
  paymentMethod: z.enum(["UPI", "CARD", "COD"]),
  simulationOutcome: z.enum(["SUCCESS", "FAIL", "CANCEL"]).default("SUCCESS"),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ).min(1, "Cart cannot be empty"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Please log in to complete checkout" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const {
      shippingName,
      shippingAddress,
      city,
      state,
      postalCode,
      phone,
      paymentMethod,
      simulationOutcome,
      items,
    } = parsed.data;

    // Handle Mock Payment Simulation Outcomes
    if (simulationOutcome === "FAIL") {
      return NextResponse.json(
        { error: "Payment was declined by simulated banking authority. (Simulation Error 1002)" },
        { status: 400 }
      );
    }

    if (simulationOutcome === "CANCEL") {
      return NextResponse.json(
        { error: "Payment was cancelled by user. (Simulation User Abort)" },
        { status: 400 }
      );
    }

    // Atomic Database Transaction for Stock Verification, Reduction and Order Creation
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
        }

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        const effectivePrice = product.discountPrice || product.price;
        const lineTotal = effectivePrice * item.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          productPrice: effectivePrice,
          quantity: item.quantity,
          total: lineTotal,
        });
      }

      const shipping = subtotal > 1999 ? 0 : 149;
      const grandTotal = subtotal + shipping;

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;
      const txnRef = `TXN-${paymentMethod}-${Date.now().toString().slice(-8)}`;

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: session.user.id,
          subtotal,
          discount: 0,
          shipping,
          total: grandTotal,
          orderStatus: paymentMethod === "COD" ? OrderStatus.CONFIRMED : OrderStatus.PROCESSING,
          paymentStatus: paymentMethod === "COD" ? PaymentStatus.PENDING : PaymentStatus.PAID,
          shippingName,
          shippingAddress,
          city,
          state,
          postalCode,
          phone,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              transactionRef: txnRef,
              method: paymentMethod as PaymentMethod,
              status: paymentMethod === "COD" ? PaymentStatus.PENDING : PaymentStatus.PAID,
              amount: grandTotal,
              paidAt: paymentMethod === "COD" ? null : new Date(),
              gatewayResponse: {
                simulationMode: true,
                environment: "LOCAL_SANDBOX",
                gateway: "CarCraft Simulated Multi-Gateway",
                authorizedAt: new Date().toISOString(),
              },
            },
          },
        },
      });

      // Clear customer's server cart if exists
      const userCart = await tx.cart.findUnique({
        where: { customerId: session.user.id },
      });
      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }

      // Record Activity Log
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "ORDER_PLACED",
          entityType: "ORDER",
          entityId: order.id,
          details: {
            orderNumber: order.orderNumber,
            total: grandTotal,
            paymentMethod,
          },
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      orderId: result.id,
      message: "Order placed successfully!",
    });
  } catch (error: any) {
    console.error("Checkout order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order checkout" },
      { status: 400 }
    );
  }
}

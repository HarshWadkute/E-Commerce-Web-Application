import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    let orders;
    if (session.user.role === "admin") {
      orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
    } else {
      orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 });
    }
    
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching orders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { items, shippingAddress } = await req.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Order must contain items" }, { status: 400 });
    }

    await connectToDatabase();
    
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return NextResponse.json({ message: `Product ${item.product} not found` }, { status: 404 });
      if (product.stock < item.quantity) return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });
      
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
      totalAmount += product.price * item.quantity;
      
      product.stock -= item.quantity;
      await product.save();
    }

    const newOrder = await Order.create({
      user: session.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'pending'
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}

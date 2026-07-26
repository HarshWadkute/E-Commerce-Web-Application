import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await req.json();

    await connectToDatabase();
    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!updatedOrder) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating order" }, { status: 500 });
  }
}

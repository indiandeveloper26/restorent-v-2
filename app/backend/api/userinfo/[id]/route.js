import { NextResponse } from "next/server";
import Restaurant from "../../../../modals/user";
import Order from "../../../../modals/order"; // 1. YE LINE ZAROOR ADD KARO (Path check kar lena)
import dbConnect from "../../../../lib/db";

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // User ka data nikalna aur uske orders ko populate karna
        const user = await Restaurant.findById(id).populate({
            path: 'orders',
            model: 'Order', // 2. Explicitly batao ki 'Order' model use karna hai
            options: { sort: { createdAt: -1 } }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Check karne ke liye ki populate hua ya nahi
        console.log("Populated User Orders:", user.orders);

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error("Populate Error:", error);
        return NextResponse.json({ success: false, message: "Server Error", error: error.message }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Restaurant from "../../../../../modals/user";

// --- SABSE ZAROORI LINE (Isse error solve hoga) ---
// Ensure karo ki path bilkul sahi ho jahan MenuItem model define hai
import MenuItem from "../../../../../modals/menulist";
// --------------------------------------------------

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!id) return NextResponse.json({ message: "userId required" }, { status: 400 });

        // Ab Mongoose ko 'MenuItem' mil jayega kyunki humne upar import kar liya hai
        const user = await Restaurant.findById(id).populate({
            path: "cart.product",
            model: "MenuItem"
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            cart: user.cart || [],
        });
    } catch (error) {
        console.error("Cart Fetch Error:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
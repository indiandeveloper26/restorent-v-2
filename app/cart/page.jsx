"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/contextthem";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import axios from "axios";

export default function CartPage() {
    const router = useRouter();
    const { theme, userdataaa } = useTheme();
    const isDark = theme === "dark";
    const userId = userdataaa?._id;

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔄 Fetch Cart Data
    const fetchCart = async () => {
        console.log('userid', userId)

        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(`http://localhost:3000/backend/api/cart/get/${userId}`);
            console.log('cartdatat', res)
            setCart(res.data.cart || []);
        } catch (err) {
            console.error("Cart fetch error:", err);
            // toast.error("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [userId]);

    // ➕➖ Update Quantity Logic
    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) return;
        try {
            // Optimistic Update: Pehle UI badal do taaki fast lage
            setCart(prev => prev.map(item =>
                item.product._id === productId ? { ...item, quantity: newQty } : item
            ));

            await axios.post("/backend/api/cart/add", { userId, productId, quantity: newQty, updateType: 'set' });
        } catch (err) {
            toast.error("Update failed");
            fetchCart(); // Rollback if error
        }
    };

    // 🗑️ Delete Logic
    const handleDelete = async (productId) => {
        try {
            const res = await axios.delete(`/backend/api/cart/delete`, { data: { userId, productId } });
            if (res.status === 200) {
                setCart(cart.filter((item) => item.product._id !== productId));
                toast.success("Removed from bag");
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    // 💰 Calculations
    const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const subTotal = cart.reduce((sum, i) => sum + ((i.product?.price || 0) * (i.quantity || 0)), 0);
    const tax = subTotal * 0.05; // 5% GST
    const grandTotal = subTotal + tax;

    if (loading) return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${isDark ? "bg-[#0f1115]" : "bg-white"}`}>
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
            <p className="font-black uppercase tracking-[0.3em] opacity-20">Syncing Bag</p>
        </div>
    );

    if (!userId) return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? "bg-[#0f1115]" : "bg-gray-50"}`}>
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart size={40} className="text-yellow-500 opacity-40" />
            </div>
            <p className="text-xl font-black uppercase tracking-widest mb-6">Identify Yourself</p>
            <button onClick={() => router.push('/login')} className="px-10 py-4 bg-yellow-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-yellow-500/20">Login to Order</button>
        </div>
    );

    return (
        <section className={`min-h-screen py-24 px-6 ${isDark ? "bg-[#0f1115] text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="mb-16">
                    <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-6xl font-black italic tracking-tighter uppercase">
                        My Bag<span className="text-yellow-500">.</span>
                    </motion.h1>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.5em] mt-2">Check your items before checkout</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* LEFT: CART ITEMS */}
                    <div className="lg:col-span-8 space-y-8">
                        {cart.length === 0 ? (
                            <div className={`p-20 rounded-[3rem] text-center border-2 border-dashed ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
                                <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Nothing here yet</p>
                                <button onClick={() => router.push('/')} className="mt-6 px-8 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl font-bold uppercase text-[10px]">Browse Menu</button>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.product?._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`group relative rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-8 items-center border ${isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100 shadow-sm"}`}
                                    >
                                        <div onClick={() => router.push(`pizza/${item.product.slug}`)} className="relative w-40 h-40 rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                                            <Image
                                                src={item.product?.images?.[0] || "/placeholder.png"}
                                                alt="food" fill className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col gap-2 w-full">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">{item.product?.category}</span>
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{item.product?.name}</h2>
                                            <p className="text-sm font-bold opacity-40 mb-4 truncate max-w-[250px]">{item.product?.description || "Fresh and hot delivery."}</p>

                                            <div className="flex items-center gap-6">
                                                <div className={`flex items-center gap-5 px-5 py-2.5 rounded-2xl border ${isDark ? "border-zinc-700" : "border-gray-200"}`}>
                                                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="hover:text-yellow-500 transition-colors"><Minus size={16} /></button>
                                                    <span className="font-black text-lg w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="hover:text-yellow-500 transition-colors"><Plus size={16} /></button>
                                                </div>
                                                <button onClick={() => handleDelete(item.product._id)} className="text-red-500/40 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>

                                        <div className="text-right w-full md:w-auto">
                                            <p className="text-xs font-bold opacity-30 uppercase">Subtotal</p>
                                            <p className="text-3xl font-black italic text-yellow-500">₹{(item.product?.price || 0) * item.quantity}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* RIGHT: SUMMARY */}
                    <div className="lg:col-span-4">
                        <div className={`sticky top-28 p-10 rounded-[3rem] border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100 shadow-2xl shadow-gray-200"}`}>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-10 border-b border-dashed border-zinc-700 pb-4">Bill Details</h3>

                            <div className="space-y-5 mb-10">
                                <div className="flex justify-between text-sm font-bold opacity-60">
                                    <span>Item Total ({totalItems})</span>
                                    <span>₹{subTotal}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold opacity-60">
                                    <span>Taxes & Charges (5%)</span>
                                    <span>₹{tax.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-green-500 uppercase tracking-tighter">
                                    <span>Delivery Fee</span>
                                    <span>Free</span>
                                </div>
                                <div className="pt-5 border-t border-zinc-800 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase opacity-30">To Pay</p>
                                        <p className="text-5xl font-black italic tracking-tighter">₹{grandTotal.toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push("/checkout")}
                                disabled={cart.length === 0}
                                className="w-full py-6 rounded-[2rem] bg-yellow-500 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-20 shadow-xl shadow-yellow-500/20"
                            >
                                <ShoppingBag size={18} />
                                Confirm Order
                                <ArrowRight size={18} />
                            </button>

                            <div className="mt-8 flex items-center justify-center gap-2 opacity-20">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-[8px] font-black uppercase tracking-widest">Safe & Secure Checkout</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
"use client";
import { useEffect, useState } from "react";
import { Mail, ShoppingCart, Package, Loader2, ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/contextthem";

export default function UserProfile() {
    const [fullUserData, setFullUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { userdataaa, logout } = useTheme();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                router.push("/login");
                return;
            }
            try {
                const parsedUser = JSON.parse(storedUser);
                const userId = parsedUser._id || parsedUser.id;
                if (userId) {
                    // Yahan apna sahi backend URL check kar lena
                    const res = await fetch(`/backend/api/userinfo/${userId}`);
                    const data = await res.json();
                    if (data.success) setFullUserData(data.user);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-yellow-500" size={40} />
        </div>
    );

    const displayName = fullUserData?.name || userdataaa?.name || "Guest User";
    const displayEmail = fullUserData?.email || userdataaa?.email || "Email not available";

    return (
        <div className="min-h-screen bg-[#f3f4f6]">
            {/* --- HEADER BANNER (Fixed Height & Clear Content) --- */}
            <div className="relative bg-yellow-500 w-full pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Profile Picture / Initial */}
                        <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-yellow-500 text-5xl md:text-6xl font-black border-4 border-white/50 transform hover:scale-105 transition-transform">
                            {displayName.charAt(0).toUpperCase()}
                        </div>

                        {/* Name and Email - NO HIDING HERE */}
                        <div className="text-center md:text-left pb-2">
                            <h1 className="text-3xl md:text-5xl font-black uppercase italic text-white tracking-tighter drop-shadow-sm">
                                {displayName}
                            </h1>
                            <div className="flex flex-col md:flex-row items-center gap-3 mt-3">
                                <span className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-bold border border-white/20">
                                    <Mail size={16} /> {displayEmail}
                                </span>
                                <span className="flex items-center gap-1 bg-white text-yellow-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                    <ShieldCheck size={12} /> Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA (Clean Grid) --- */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-10 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Side: Stats & Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-white">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-4 h-[2px] bg-yellow-500"></span> Account Summary
                            </p>

                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-orange-400 uppercase">Orders</p>
                                        <p className="text-2xl font-black text-orange-600">{fullUserData?.orders?.length || 0}</p>
                                    </div>
                                    <Package className="text-orange-200" size={32} />
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-yellow-500 uppercase">Cart</p>
                                        <p className="text-2xl font-black text-yellow-700">{fullUserData?.cart?.length || 0}</p>
                                    </div>
                                    <ShoppingCart className="text-yellow-200" size={32} />
                                </div>
                            </div>

                            <button onClick={handleLogout} className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                                <LogOut size={16} /> Logout Now
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Activity List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl border border-white h-full">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                                <h2 className="text-xl md:text-2xl font-black text-gray-800 italic uppercase tracking-tight">Recent Orders</h2>
                                <div className="hidden md:block h-1 w-16 bg-yellow-500 rounded-full"></div>
                            </div>

                            <div className="space-y-4">
                                {fullUserData?.orders?.length > 0 ? (
                                    fullUserData.orders.map((order) => (
                                        <div key={order._id} className="group flex items-center gap-4 p-4 bg-gray-50 hover:bg-white hover:shadow-md hover:border-yellow-200 border border-transparent rounded-[1.5rem] transition-all cursor-pointer">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:rotate-6 transition-transform">
                                                🍕
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black text-gray-800 text-sm md:text-base">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-[10px] font-bold text-gray-400">{new Date(order.createdAt).toDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-black text-yellow-600">₹{order.totalPrice}</p>
                                                        <span className={`text-[8px] md:text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-gray-300 group-hover:text-yellow-500" size={18} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Package className="text-gray-200" size={30} />
                                        </div>
                                        <p className="text-gray-400 font-black italic uppercase text-xs tracking-widest">No Recent Orders</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
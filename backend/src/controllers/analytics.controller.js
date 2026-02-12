import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// @desc    Get artisan analytics (sales, ratings, popular products)
// @route   GET /api/analytics/artisan
// @access  Private (Artisan)
export const getArtisanAnalytics = async (req, res, next) => {
    try {
        const artisanId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Total Sales and Revenue
        const salesData = await Order.aggregate([
            {
                $match: {
                    artisan: artisanId,
                    status: { $in: ["PAID", "SHIPPED", "DELIVERED", "FINISHED"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $count: {} }
                }
            }
        ]);

        const stats = {
            totalRevenue: salesData[0]?.totalRevenue || 0,
            totalOrders: salesData[0]?.totalOrders || 0,
            averageRating: 0,
            totalReviews: 0
        };

        // 2. Average Rating across all artisan products
        const products = await Product.find({ artisan: artisanId });
        const productIds = products.map(p => p._id);

        const ratingsData = await Review.aggregate([
            { $match: { product: { $in: productIds } } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    count: { $count: {} }
                }
            }
        ]);

        stats.averageRating = ratingsData[0]?.avgRating ? parseFloat(ratingsData[0].avgRating.toFixed(1)) : 0;
        stats.totalReviews = ratingsData[0]?.count || 0;

        // 3. Most Popular Products (Top 5 by quantity sold)
        const popularProducts = await Order.aggregate([
            {
                $match: {
                    artisan: artisanId,
                    status: { $in: ["PAID", "SHIPPED", "DELIVERED", "FINISHED"] }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    soldCount: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { soldCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: 1,
                    soldCount: 1,
                    revenue: 1,
                    title: "$productDetails.title"
                }
            }
        ]);

        // 4. Sales over time (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    artisan: artisanId,
                    status: { $in: ["PAID", "SHIPPED", "DELIVERED", "FINISHED"] },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    monthlyRevenue: { $sum: "$totalAmount" },
                    count: { $count: {} }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format monthly sales for the chart
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthlySales = [];

        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const monthData = monthlySales.find(m => m._id.year === year && m._id.month === month);
            formattedMonthlySales.push({
                name: `${monthNames[month - 1]} ${year}`,
                revenue: monthData ? monthData.monthlyRevenue : 0,
                orders: monthData ? monthData.count : 0
            });
        }

        res.json({
            stats,
            popularProducts,
            monthlySales: formattedMonthlySales
        });

    } catch (error) {
        next(error);
    }
};

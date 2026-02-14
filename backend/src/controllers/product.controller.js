import Product from "../models/Product.js";

// CREATE PRODUCT (ARTISAN)
export const createProduct = async (req, res, next) => {
    try {
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const product = await Product.create({
            ...req.body,
            images: images,
            artisan: req.user.id,
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// GET ALL PRODUCTS (PUBLIC)
export const getProducts = async (req, res, next) => {
    try {
        const { category, keyword, artisan, minPrice, maxPrice, material, sortBy, isCustomizable, region } = req.query;

        // Pagination logic
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        let query = {};

        if (category) {
            query.category = category;
        }

        if (material) {
            query.material = material;
        }

        if (region) {
            query.region = region;
        }

        if (isCustomizable === "true") {
            query.isCustomizable = true;
        }

        if (artisan) {
            query.artisan = artisan;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } }
            ];
        }

        // Sorting logic
        let sortOptions = { createdAt: -1 }; // Default: newest first
        if (sortBy === "price-asc") sortOptions = { price: 1 };
        else if (sortBy === "price-desc") sortOptions = { price: -1 };
        else if (sortBy === "rating") sortOptions = { averageRating: -1 };
        else if (sortBy === "newest") sortOptions = { createdAt: -1 };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate("artisan", "name email artisanProfile")
            .sort(sortOptions)
            .limit(limit)
            .skip(skip);

        res.json({
            products,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        next(error);
    }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("artisan", "name email artisanProfile");

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

// UPDATE PRODUCT (OWNER ONLY)
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (product.artisan.toString() !== req.user.id && !req.user.role.includes("ADMIN")) {
            res.status(403);
            throw new Error("Not authorized");
        }

        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const updateData = { ...req.body };
        if (images.length > 0) {
            updateData.images = [...(product.images || []), ...images];
        }

        Object.assign(product, updateData);
        await product.save();

        res.json(product);
    } catch (error) {
        next(error);
    }
};

// DELETE PRODUCT (OWNER ONLY)
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (product.artisan.toString() !== req.user.id && !req.user.role.includes("ADMIN")) {
            res.status(403);
            throw new Error("Not authorized");
        }

        await product.deleteOne();
        res.json({ message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};

// GET UNIQUE FILTERS (CATEGORIES & MATERIALS)
export const getProductFilters = async (req, res, next) => {
    try {
        const categories = await Product.distinct("category");
        const materials = await Product.distinct("material");

        // Filter out null/undefined materials
        const filteredMaterials = materials.filter(m => m != null);

        res.json({
            categories,
            materials: filteredMaterials
        });
    } catch (error) {
        next(error);
    }
};

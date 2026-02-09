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
        const { category } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query)
            .populate("artisan", "name email artisanProfile")
            .sort({ createdAt: -1 });

        res.json(products);
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

        if (product.artisan.toString() !== req.user.id) {
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

        if (product.artisan.toString() !== req.user.id) {
            res.status(403);
            throw new Error("Not authorized");
        }

        await product.deleteOne();
        res.json({ message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};

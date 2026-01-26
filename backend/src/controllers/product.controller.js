import Product from "../models/Product.js";

// CREATE PRODUCT (ARTISAN)
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            artisan: req.user.id,
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL PRODUCTS (PUBLIC)
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("artisan", "name email")
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("artisan", "name email");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE PRODUCT (OWNER ONLY)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.artisan.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        Object.assign(product, req.body);
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE PRODUCT (OWNER ONLY)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.artisan.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await product.deleteOne();
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

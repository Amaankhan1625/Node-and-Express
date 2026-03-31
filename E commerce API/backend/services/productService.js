const mongoose = require('mongoose');
const { Product } = require('../model/product');
const { Category } = require('../model/category');

class ProductService {
    validateObjectId(id, fieldName) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid ${fieldName}`);
        }
    }

    async ensureCategoryExists(categoryId) {
        this.validateObjectId(categoryId, 'category ID');

        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }

        return category;
    }

    async getProducts(query = {}) {
        let filter = {};

        if (query.categories) {
            filter = {
                category: { $in: query.categories.split(',').map((id) => id.trim()) }
            };
        }

        // Pagination parameters
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10)); // Max 100 items per page
        const skip = (page - 1) * limit;

        // Sorting parameters
        const allowedSortFields = ['name', 'price', 'rating', 'dateCreated'];
        const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy) ? query.sortBy : 'dateCreated';
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

        // Execute count and find in parallel for better performance
        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .select('name images price rating numReviews Instock dateCreated')
                .populate('category')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
        ]);

        return {
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            },
            sortBy,
            sortOrder: sortOrder === 1 ? 'asc' : 'desc'
        };
    }

    async getFeaturedProducts(countParam) {
        const count = countParam ? parseInt(countParam, 10) : 0;

        if (Number.isNaN(count) || count < 0) {
            throw new Error('Invalid count value');
        }

        return Product.find({ isFeatured: true }).limit(count);
    }

    async getProductCount() {
        return Product.countDocuments();
    }

    async getProductById(productId) {
        this.validateObjectId(productId, 'product ID');

        const product = await Product.findById(productId).populate('category');

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }

    buildProductPayload(body, imageUrl) {
        return {
            name: body.name,
            description: body.description,
            richdescription: body.richdescription,
            image: imageUrl || body.image || '',
            brand: body.brand,
            Instock: body.Instock,
            price: body.price,
            category: body.category,
            numReviews: body.numReviews,
            rating: body.rating,
            isFeatured: body.isFeatured,
            dateCreated: body.dateCreated
        };
    }

    async createProduct(body, file, requestMeta) {
        if (!body.category) {
            throw new Error('Category ID is required');
        }

        await this.ensureCategoryExists(body.category);

        const imageUrl = file
            ? `${requestMeta.protocol}://${requestMeta.host}/public/uploads/${file.filename}`
            : '';

        let product = new Product(this.buildProductPayload(body, imageUrl));
        product = await product.save();

        if (!product) {
            throw new Error('The product cannot be created');
        }

        return product;
    }

    async updateProduct(productId, body) {
        this.validateObjectId(productId, 'product ID');

        if (!body.category) {
            throw new Error('Category ID is required');
        }

        await this.ensureCategoryExists(body.category);

        const product = await Product.findByIdAndUpdate(
            productId,
            this.buildProductPayload(body),
            { new: true }
        );

        if (!product) {
            throw new Error('The product cannot be updated');
        }

        return product;
    }

    async deleteProduct(productId) {
        this.validateObjectId(productId, 'product ID');

        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return true;
    }
}

module.exports = new ProductService();

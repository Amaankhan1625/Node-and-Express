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

        return Product.find(filter).select('name images').populate('category');
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

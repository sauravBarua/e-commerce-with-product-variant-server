import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { productSearchableFields } from "./product.constants";
import {
  ICreateProductPayload,
  ICreateVariantInput,
  IUpdateProductPayload,
  IUpdateVariantPayload,
} from "./product.interface";

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const createProduct = async (payload: ICreateProductPayload) => {
  const { name, description, brandId, categoryId, isActive, specifications, variants } =
    payload;

  const slug = generateSlug(name);

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      brandId,
      categoryId,
      isActive: isActive ?? true,
      specifications: specifications?.length
        ? { create: specifications }
        : undefined,
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
          price: v.price,
          attributes: { create: v.attributes },
          inventory: { create: { quantity: 0, reservedQuantity: 0 } },
        })),
      },
    },
    include: {
      brand: true,
      category: true,
      specifications: true,
      variants: {
        include: {
          attributes: true,
          images: true,
          inventory: true,
        },
      },
    },
  });

  return product;
};

const getAllProducts = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.product, queryParams, {
    searchableFields: productSearchableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute({
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: { where: { isPrimary: true }, take: 1 },
            inventory: { select: { quantity: true, reservedQuantity: true } },
          },
        },
      },
    });

  return result;
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      specifications: true,
      variants: {
        include: {
          attributes: true,
          images: { orderBy: { sortOrder: "asc" } },
          inventory: true,
        },
      },
      reviews: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  return product;
};

const updateProduct = async (id: string, payload: IUpdateProductPayload) => {
  const isExists = await prisma.product.findUnique({ where: { id } });

  if (!isExists) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  const updateData: IUpdateProductPayload & { slug?: string } = { ...payload };

  if (payload.name) {
    updateData.slug = generateSlug(payload.name);
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { brand: true, category: true },
  });

  return product;
};

const deleteProduct = async (id: string) => {
  const isExists = await prisma.product.findUnique({ where: { id } });

  if (!isExists) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  await prisma.product.delete({ where: { id } });
};

const addVariant = async (productId: string, payload: ICreateVariantInput) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku: payload.sku,
      price: payload.price,
      attributes: { create: payload.attributes },
      inventory: { create: { quantity: 0, reservedQuantity: 0 } },
    },
    include: {
      attributes: true,
      images: true,
      inventory: true,
    },
  });

  return variant;
};

const updateVariant = async (
  productId: string,
  variantId: string,
  payload: IUpdateVariantPayload,
) => {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });

  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  const { attributes, ...variantData } = payload;

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...variantData,
      ...(attributes && {
        attributes: {
          deleteMany: {},
          create: attributes,
        },
      }),
    },
    include: {
      attributes: true,
      images: true,
      inventory: true,
    },
  });

  return updated;
};

const deleteVariant = async (productId: string, variantId: string) => {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });

  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  const variantCount = await prisma.productVariant.count({ where: { productId } });

  if (variantCount <= 1) {
    throw new AppError(
      status.BAD_REQUEST,
      "A product must have at least one variant",
    );
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
};

const uploadVariantImages = async (
  productId: string,
  variantId: string,
  imageUrls: string[],
) => {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    include: { images: true },
  });

  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  const hasNoPrimary = variant.images.length === 0;

  await prisma.productImage.createMany({
    data: imageUrls.map((url, index) => ({
      url,
      variantId,
      isPrimary: hasNoPrimary && index === 0,
      sortOrder: variant.images.length + index,
    })),
  });

  return prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
};

const deleteVariantImage = async (
  productId: string,
  variantId: string,
  imageId: string,
) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, variantId, variant: { productId } },
  });

  if (!image) {
    throw new AppError(status.NOT_FOUND, "Image not found");
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  // If deleted image was primary, promote the next one
  if (image.isPrimary) {
    const nextImage = await prisma.productImage.findFirst({
      where: { variantId },
      orderBy: { sortOrder: "asc" },
    });

    if (nextImage) {
      await prisma.productImage.update({
        where: { id: nextImage.id },
        data: { isPrimary: true },
      });
    }
  }
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadVariantImages,
  deleteVariantImage,
};


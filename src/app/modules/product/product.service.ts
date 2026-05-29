import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { productSearchableFields } from "./product.constants";
import {
  ICreateColorGroupInput,
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
  const { name, description, brandId, categoryId, isActive, specifications, colorGroups } =
    payload;

  const slug = generateSlug(name);

  const product = await prisma.$transaction(async (tx) => {
    // Step 1: create the product (and specifications)
    const created = await tx.product.create({
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
      },
    });

    // Step 2: create all color groups in parallel
    const createdColorGroups = await Promise.all(
      colorGroups.map((cg) =>
        tx.productColorGroup.create({
          data: { productId: created.id, colorValue: cg.colorValue },
        }),
      ),
    );

    // Step 3: create all variants in parallel across all color groups
    await Promise.all(
      colorGroups.flatMap((cg, i) =>
        cg.variants.map((v) =>
          tx.productVariant.create({
            data: {
              productId: created.id,
              colorGroupId: createdColorGroups[i].id,
              sku: v.sku,
              price: v.price,
              attributes: { create: v.attributes },
              inventory: { create: { quantity: 0, reservedQuantity: 0 } },
            },
          }),
        ),
      ),
    );

    // Step 4: return the fully populated product
    return tx.product.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        brand: true,
        category: true,
        specifications: true,
        colorGroups: {
          include: {
            images: true,
            variants: {
              include: {
                attributes: true,
                inventory: true,
              },
            },
          },
        },
      },
    });
  }, { timeout: 15000 });

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
        colorGroups: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            variants: {
              include: {
                attributes: true,
                inventory: { select: { quantity: true, reservedQuantity: true } },
              },
            },
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
      colorGroups: {
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: {
            include: {
              attributes: true,
              inventory: true,
            },
          },
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

const addColorGroup = async (productId: string, payload: ICreateColorGroupInput) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  const colorGroup = await prisma.productColorGroup.create({
    data: {
      productId,
      colorValue: payload.colorValue,
      variants: {
        create: payload.variants.map((v) => ({
          productId,
          sku: v.sku,
          price: v.price,
          attributes: { create: v.attributes },
          inventory: { create: { quantity: 0, reservedQuantity: 0 } },
        })),
      },
    },
    include: {
      images: true,
      variants: {
        include: {
          attributes: true,
          inventory: true,
        },
      },
    },
  });

  return colorGroup;
};

const deleteColorGroup = async (productId: string, colorGroupId: string) => {
  const colorGroup = await prisma.productColorGroup.findFirst({
    where: { id: colorGroupId, productId },
  });

  if (!colorGroup) {
    throw new AppError(status.NOT_FOUND, "Color group not found");
  }

  const colorGroupCount = await prisma.productColorGroup.count({ where: { productId } });

  if (colorGroupCount <= 1) {
    throw new AppError(status.BAD_REQUEST, "A product must have at least one color group");
  }

  await prisma.productColorGroup.delete({ where: { id: colorGroupId } });
};

const addVariant = async (
  productId: string,
  colorGroupId: string,
  payload: ICreateVariantInput,
) => {
  const colorGroup = await prisma.productColorGroup.findFirst({
    where: { id: colorGroupId, productId },
  });

  if (!colorGroup) {
    throw new AppError(status.NOT_FOUND, "Color group not found");
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      colorGroupId,
      sku: payload.sku,
      price: payload.price,
      attributes: { create: payload.attributes },
      inventory: { create: { quantity: 0, reservedQuantity: 0 } },
    },
    include: {
      attributes: true,
      inventory: true,
    },
  });

  return variant;
};

const updateVariant = async (
  productId: string,
  colorGroupId: string,
  variantId: string,
  payload: IUpdateVariantPayload,
) => {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, colorGroup: { id: colorGroupId, productId } },
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
      inventory: true,
    },
  });

  return updated;
};

const deleteVariant = async (productId: string, colorGroupId: string, variantId: string) => {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, colorGroup: { id: colorGroupId, productId } },
  });

  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  const variantCount = await prisma.productVariant.count({ where: { colorGroupId } });

  if (variantCount <= 1) {
    throw new AppError(status.BAD_REQUEST, "A color group must have at least one variant");
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
};

const uploadColorGroupImages = async (
  productId: string,
  colorGroupId: string,
  imageUrls: string[],
) => {
  const colorGroup = await prisma.productColorGroup.findFirst({
    where: { id: colorGroupId, productId },
    include: { images: true },
  });

  if (!colorGroup) {
    throw new AppError(status.NOT_FOUND, "Color group not found");
  }

  const hasNoPrimary = colorGroup.images.length === 0;

  await prisma.productImage.createMany({
    data: imageUrls.map((url, index) => ({
      url,
      colorGroupId,
      isPrimary: hasNoPrimary && index === 0,
      sortOrder: colorGroup.images.length + index,
    })),
  });

  return prisma.productColorGroup.findUnique({
    where: { id: colorGroupId },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
};

const deleteColorGroupImage = async (
  productId: string,
  colorGroupId: string,
  imageId: string,
) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, colorGroupId, colorGroup: { productId } },
  });

  if (!image) {
    throw new AppError(status.NOT_FOUND, "Image not found");
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const nextImage = await prisma.productImage.findFirst({
      where: { colorGroupId },
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
  addColorGroup,
  deleteColorGroup,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadColorGroupImages,
  deleteColorGroupImage,
};


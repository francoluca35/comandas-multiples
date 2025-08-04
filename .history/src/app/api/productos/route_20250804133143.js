import { NextResponse } from "next/server";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener todos los productos o productos por categoría
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const restaurantId = searchParams.get("restaurantId") || "francomputer";

    if (categoryId) {
      // Obtener productos de una categoría específica
      const productsRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId,
        "items"
      );
      const productsSnapshot = await getDocs(productsRef);

      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        categoryId,
        ...doc.data(),
      }));

      return NextResponse.json({
        success: true,
        data: products,
        count: products.length,
      });
    } else {
      // Obtener todas las categorías y sus productos
      const categoriesRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus"
      );
      const categoriesSnapshot = await getDocs(categoriesRef);

      const allProducts = [];

      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        const productsRef = collection(
          db,
          "restaurantes",
          restaurantId,
          "menus",
          categoryId,
          "items"
        );
        const productsSnapshot = await getDocs(productsRef);

        const categoryProducts = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          categoryId,
          ...doc.data(),
        }));

        allProducts.push(...categoryProducts);
      }

      return NextResponse.json({
        success: true,
        data: allProducts,
        count: allProducts.length,
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener productos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      categoryId,
      name,
      price,
      discount = 0,
      description = "",
      restaurantId = "francomputer",
    } = body;

    // Validaciones
    if (!categoryId || !name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre, categoría y precio son obligatorios",
        },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser mayor a 0",
        },
        { status: 400 }
      );
    }

    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "El descuento debe estar entre 0 y 100",
        },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const categoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      categoryId
    );
    const categoryDoc = await getDoc(categoryRef);

    if (!categoryDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "La categoría especificada no existe",
        },
        { status: 404 }
      );
    }

    // Crear el producto
    const productRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      categoryId,
      "items"
    );
    const newProduct = await addDoc(productRef, {
      nombre: name,
      precio: parseFloat(price),
      descuento: parseFloat(discount),
      descripcion: description,
      activo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const createdProduct = {
      id: newProduct.id,
      categoryId,
      nombre: name,
      precio: parseFloat(price),
      descuento: parseFloat(discount),
      descripcion: description,
      activo: true,
    };

    return NextResponse.json(
      {
        success: true,
        data: createdProduct,
        message: "Producto creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear producto",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      productId,
      categoryId,
      name,
      price,
      discount = 0,
      description = "",
      activo = true,
      restaurantId = "francomputer",
    } = body;

    // Validaciones
    if (!productId || !categoryId || !name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del producto, categoría, nombre y precio son obligatorios",
        },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser mayor a 0",
        },
        { status: 400 }
      );
    }

    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "El descuento debe estar entre 0 y 100",
        },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const productRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      categoryId,
      "items",
      productId
    );
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "El producto especificado no existe",
        },
        { status: 404 }
      );
    }

    // Actualizar el producto
    await updateDoc(productRef, {
      nombre: name,
      precio: parseFloat(price),
      descuento: parseFloat(discount),
      descripcion: description,
      activo,
      updatedAt: serverTimestamp(),
    });

    const updatedProduct = {
      id: productId,
      categoryId,
      nombre: name,
      precio: parseFloat(price),
      descuento: parseFloat(discount),
      descripcion: description,
      activo,
    };

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Producto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar producto",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const restaurantId = searchParams.get("restaurantId") || "francomputer";

    if (!productId || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del producto y categoría son obligatorios",
        },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const productRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      categoryId,
      "items",
      productId
    );
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "El producto especificado no existe",
        },
        { status: 404 }
      );
    }

    // Eliminar el producto
    await deleteDoc(productRef);

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar producto",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

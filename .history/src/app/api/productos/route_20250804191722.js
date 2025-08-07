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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const mainCategoryId = searchParams.get("mainCategoryId");
    const subCategoryId = searchParams.get("subCategoryId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId es requerido" },
        { status: 400 }
      );
    }

    console.log(
      "🔍 API Productos - Obteniendo productos para restaurante:",
      restaurantId
    );

    if (mainCategoryId && subCategoryId) {
      const productsRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryId,
        "items"
      );
      const productsSnapshot = await getDocs(productsRef);

      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        mainCategoryId,
        subCategoryId,
        ...doc.data(),
      }));

      return NextResponse.json({
        success: true,
        data: products,
        count: products.length,
      });
    } else {
      // Obtener todas las categorías principales, subcategorías y sus productos
      const mainCategoriesRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus"
      );
      const mainCategoriesSnapshot = await getDocs(mainCategoriesRef);

      const allProducts = [];

      for (const mainCategoryDoc of mainCategoriesSnapshot.docs) {
        const mainCategoryId = mainCategoryDoc.id;
        const subCategoriesRef = collection(
          db,
          "restaurantes",
          restaurantId,
          "menus",
          mainCategoryId,
          "subcategorias"
        );
        const subCategoriesSnapshot = await getDocs(subCategoriesRef);

        for (const subCategoryDoc of subCategoriesSnapshot.docs) {
          const subCategoryId = subCategoryDoc.id;
          const productsRef = collection(
            db,
            "restaurantes",
            restaurantId,
            "menus",
            mainCategoryId,
            "subcategorias",
            subCategoryId,
            "items"
          );
          const productsSnapshot = await getDocs(productsRef);

          const subCategoryProducts = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            mainCategoryId,
            subCategoryId,
            ...doc.data(),
          }));

          allProducts.push(...subCategoryProducts);
        }
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
      mainCategoryId,
      subCategoryId,
      name,
      price,
      discount = 0,
      description = "",
      restaurantId,
    } = body;

    // Validar restaurantId
    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId es requerido" },
        { status: 400 }
      );
    }

    console.log(
      "🔍 API Productos POST - Creando producto para restaurante:",
      restaurantId
    );

    // Validaciones
    if (!mainCategoryId || !subCategoryId || !name || !price) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Categoría principal, subcategoría, nombre y precio son obligatorios",
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

    // Verificar que la categoría principal existe
    const mainCategoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId
    );
    const mainCategoryDoc = await getDoc(mainCategoryRef);

    if (!mainCategoryDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "La categoría principal especificada no existe",
        },
        { status: 404 }
      );
    }

    // Verificar que la subcategoría existe
    const subCategoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias",
      subCategoryId
    );
    const subCategoryDoc = await getDoc(subCategoryRef);

    if (!subCategoryDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "La subcategoría especificada no existe",
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
      mainCategoryId,
      "subcategorias",
      subCategoryId,
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
      mainCategoryId,
      subCategoryId,
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
      mainCategoryId,
      subCategoryId,
      name,
      price,
      discount = 0,
      description = "",
      activo = true,
      restaurantId = "francomputer",
    } = body;

    // Validaciones
    if (!productId || !mainCategoryId || !subCategoryId || !name || !price) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID del producto, categoría principal, subcategoría, nombre y precio son obligatorios",
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
      mainCategoryId,
      "subcategorias",
      subCategoryId,
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
      mainCategoryId,
      subCategoryId,
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
    const mainCategoryId = searchParams.get("mainCategoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const restaurantId = searchParams.get("restaurantId");

    if (!productId || !mainCategoryId || !subCategoryId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID del producto, categoría principal y subcategoría son obligatorios",
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
      mainCategoryId,
      "subcategorias",
      subCategoryId,
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

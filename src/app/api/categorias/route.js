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

// GET - Obtener todas las categorías
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId") || "francomputer";

    const categoriesRef = collection(db, "restaurantes", restaurantId, "menus");
    const categoriesSnapshot = await getDocs(categoriesRef);

    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener categorías",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, restaurantId = "francomputer" } = body;

    // Validaciones
    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "El nombre de la categoría es obligatorio",
        },
        { status: 400 }
      );
    }

    const categoryName = name.trim();

    // Verificar si la categoría ya existe
    const categoriesRef = collection(db, "restaurantes", restaurantId, "menus");
    const categoriesSnapshot = await getDocs(categoriesRef);

    const categoryExists = categoriesSnapshot.docs.some(
      (doc) => doc.id.toLowerCase() === categoryName.toLowerCase()
    );

    if (categoryExists) {
      return NextResponse.json(
        {
          success: false,
          error: "La categoría ya existe",
        },
        { status: 409 }
      );
    }

    // Crear la categoría como un documento con metadata
    const categoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      categoryName
    );
    await updateDoc(categoryRef, {
      name: categoryName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const createdCategory = {
      id: categoryName,
      name: categoryName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        data: createdCategory,
        message: "Categoría creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear categoría",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar categoría
export async function PUT(request) {
  try {
    const body = await request.json();
    const { oldName, newName, restaurantId = "francomputer" } = body;

    // Validaciones
    if (!oldName || !newName || newName.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre anterior y nuevo nombre son obligatorios",
        },
        { status: 400 }
      );
    }

    const newCategoryName = newName.trim();

    // Verificar que la categoría original existe
    const oldCategoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      oldName
    );
    const oldCategoryDoc = await getDoc(oldCategoryRef);

    if (!oldCategoryDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "La categoría especificada no existe",
        },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre ya existe
    const newCategoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      newCategoryName
    );
    const newCategoryDoc = await getDoc(newCategoryRef);

    if (newCategoryDoc.exists() && oldName !== newCategoryName) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe una categoría con ese nombre",
        },
        { status: 409 }
      );
    }

    // Obtener todos los productos de la categoría original
    const productsRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      oldName,
      "items"
    );
    const productsSnapshot = await getDocs(productsRef);

    // Crear la nueva categoría
    await updateDoc(newCategoryRef, {
      name: newCategoryName,
      createdAt: oldCategoryDoc.data().createdAt,
      updatedAt: serverTimestamp(),
    });

    // Mover todos los productos a la nueva categoría
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();

      // Crear el producto en la nueva categoría
      const newProductRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        newCategoryName,
        "items"
      );
      await addDoc(newProductRef, {
        ...productData,
        updatedAt: serverTimestamp(),
      });

      // Eliminar el producto de la categoría original
      const oldProductRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        oldName,
        "items",
        productDoc.id
      );
      await deleteDoc(oldProductRef);
    }

    // Eliminar la categoría original
    await deleteDoc(oldCategoryRef);

    const updatedCategory = {
      id: newCategoryName,
      name: newCategoryName,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Categoría actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar categoría",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get("name");
    const restaurantId = searchParams.get("restaurantId") || "francomputer";

    if (!categoryName) {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre de la categoría es obligatorio",
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
      categoryName
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

    // Obtener todos los productos de la categoría
    const productsRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      categoryName,
      "items"
    );
    const productsSnapshot = await getDocs(productsRef);

    // Eliminar todos los productos de la categoría
    for (const productDoc of productsSnapshot.docs) {
      const productRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryName,
        "items",
        productDoc.id
      );
      await deleteDoc(productRef);
    }

    // Eliminar la categoría
    await deleteDoc(categoryRef);

    return NextResponse.json({
      success: true,
      message: "Categoría eliminada exitosamente",
      deletedProducts: productsSnapshot.docs.length,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar categoría",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

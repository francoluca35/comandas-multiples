import { NextResponse } from "next/server";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener subcategorías de una categoría principal
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategoryId = searchParams.get("mainCategoryId");
    const restaurantId = searchParams.get("restaurantId") || "francomputer";

    if (!mainCategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de categoría principal es obligatorio",
        },
        { status: 400 }
      );
    }

    const subCategoriesRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias"
    );
    const subCategoriesSnapshot = await getDocs(subCategoriesRef);

    const subCategories = subCategoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      mainCategoryId,
      name: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: subCategories,
      count: subCategories.length,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener subcategorías",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva subcategoría
export async function POST(request) {
  try {
    const body = await request.json();
    const { mainCategoryId, name, restaurantId = "francomputer" } = body;

    // Validaciones
    if (!mainCategoryId || !name || name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID de categoría principal y nombre de subcategoría son obligatorios",
        },
        { status: 400 }
      );
    }

    const subCategoryName = name.trim();

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

    // Verificar si la subcategoría ya existe
    const subCategoriesRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias"
    );
    const subCategoriesSnapshot = await getDocs(subCategoriesRef);

    const subCategoryExists = subCategoriesSnapshot.docs.some(
      (doc) => doc.id.toLowerCase() === subCategoryName.toLowerCase()
    );

    if (subCategoryExists) {
      return NextResponse.json(
        {
          success: false,
          error: "La subcategoría ya existe",
        },
        { status: 409 }
      );
    }

    // Crear la subcategoría como un documento con metadata
    const subCategoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias",
      subCategoryName
    );
    await setDoc(subCategoryRef, {
      name: subCategoryName,
      mainCategoryId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const createdSubCategory = {
      id: subCategoryName,
      mainCategoryId,
      name: subCategoryName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        data: createdSubCategory,
        message: "Subcategoría creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear subcategoría",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar subcategoría
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      mainCategoryId,
      oldName,
      newName,
      restaurantId = "francomputer",
    } = body;

    // Validaciones
    if (!mainCategoryId || !oldName || !newName || newName.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID de categoría principal, nombre anterior y nuevo nombre son obligatorios",
        },
        { status: 400 }
      );
    }

    const newSubCategoryName = newName.trim();

    // Verificar que la subcategoría original existe
    const oldSubCategoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias",
      oldName
    );
    const oldSubCategoryDoc = await getDoc(oldSubCategoryRef);

    if (!oldSubCategoryDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "La subcategoría especificada no existe",
        },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre ya existe
    const newSubCategoryRef = doc(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias",
      newSubCategoryName
    );
    const newSubCategoryDoc = await getDoc(newSubCategoryRef);

    if (newSubCategoryDoc.exists() && oldName !== newSubCategoryName) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe una subcategoría con ese nombre",
        },
        { status: 409 }
      );
    }

    // Obtener todos los productos de la subcategoría original
    const productsRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias",
      oldName,
      "items"
    );
    const productsSnapshot = await getDocs(productsRef);

    // Crear la nueva subcategoría
    await updateDoc(newSubCategoryRef, {
      name: newSubCategoryName,
      mainCategoryId,
      createdAt: oldSubCategoryDoc.data().createdAt,
      updatedAt: serverTimestamp(),
    });

    // Mover todos los productos a la nueva subcategoría
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();

      // Crear el producto en la nueva subcategoría
      const newProductRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        newSubCategoryName,
        "items"
      );
      await addDoc(newProductRef, {
        ...productData,
        updatedAt: serverTimestamp(),
      });

      // Eliminar el producto de la subcategoría original
      const oldProductRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        oldName,
        "items",
        productDoc.id
      );
      await deleteDoc(oldProductRef);
    }

    // Eliminar la subcategoría original
    await deleteDoc(oldSubCategoryRef);

    const updatedSubCategory = {
      id: newSubCategoryName,
      mainCategoryId,
      name: newSubCategoryName,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: updatedSubCategory,
      message: "Subcategoría actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar subcategoría",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar subcategoría
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategoryId = searchParams.get("mainCategoryId");
    const subCategoryName = searchParams.get("name");
    const restaurantId = searchParams.get("restaurantId") || "francomputer";

    if (!mainCategoryId || !subCategoryName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID de categoría principal y nombre de subcategoría son obligatorios",
        },
        { status: 400 }
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
      subCategoryName
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

    // Obtener todos los productos de la subcategoría
    const productsRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "menus",
      mainCategoryId,
      "subcategorias",
      subCategoryName,
      "items"
    );
    const productsSnapshot = await getDocs(productsRef);

    // Eliminar todos los productos de la subcategoría
    for (const productDoc of productsSnapshot.docs) {
      const productRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryName,
        "items",
        productDoc.id
      );
      await deleteDoc(productRef);
    }

    // Eliminar la subcategoría
    await deleteDoc(subCategoryRef);

    return NextResponse.json({
      success: true,
      message: "Subcategoría eliminada exitosamente",
      deletedProducts: productsSnapshot.docs.length,
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar subcategoría",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

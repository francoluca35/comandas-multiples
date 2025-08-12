import { NextResponse } from "next/server";

export async function GET() {
  const indexes = [
    {
      collection: "payments",
      fields: [
        { fieldPath: "restaurantId", order: "ASCENDING" },
        { fieldPath: "externalReference", order: "ASCENDING" },
        { fieldPath: "date", order: "DESCENDING" },
      ],
      queryScope: "COLLECTION",
      description:
        "Índice para consultas de pagos por restaurante y external_reference",
    },
    {
      collection: "payments",
      fields: [
        { fieldPath: "restaurantId", order: "ASCENDING" },
        { fieldPath: "date", order: "DESCENDING" },
      ],
      queryScope: "COLLECTION",
      description:
        "Índice para consultas de pagos por restaurante ordenados por fecha",
    },
  ];

  const createIndexUrls = indexes.map((index) => {
    const fields = index.fields
      .map((f) => `${f.fieldPath}:${f.order}`)
      .join(",");
    return `https://console.firebase.google.com/v1/r/project/comandas-multiples/firestore/indexes?create_composite=ClNwcm9qZWN0cy9jb21hbmRhcy1tdWx0aXBsZXMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3BheW1lbnRzL2luZGV4ZXMvXxAB${fields}`;
  });

  return NextResponse.json({
    success: true,
    message: "Índices necesarios para Firestore",
    indexes: indexes,
    createUrls: createIndexUrls,
    instructions: [
      "1. Ve a la consola de Firebase",
      "2. Navega a Firestore Database > Índices",
      "3. Crea los índices compuestos listados arriba",
      "4. Espera a que los índices se construyan (puede tomar varios minutos)",
      "5. Una vez construidos, las consultas funcionarán correctamente",
    ],
  });
}

class Product {
  final String id;
  final String nombre;
  final double precio;
  final double costo;
  final int stock;
  final String categoria;
  final String? subcategoria;
  final String tipo;
  final String? imagen;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.nombre,
    required this.precio,
    required this.costo,
    required this.stock,
    required this.categoria,
    this.subcategoria,
    required this.tipo,
    this.imagen,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromMap(Map<String, dynamic> map) {
    return Product(
      id: map['id'] ?? '',
      nombre: map['nombre'] ?? '',
      precio: (map['precio'] ?? 0).toDouble(),
      costo: (map['costo'] ?? 0).toDouble(),
      stock: map['stock'] ?? 0,
      categoria: map['categoria'] ?? '',
      subcategoria: map['subcategoria'],
      tipo: map['tipo'] ?? '',
      imagen: map['imagen'],
      createdAt: map['createdAt']?.toDate() ?? DateTime.now(),
      updatedAt: map['updatedAt']?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'nombre': nombre,
      'precio': precio,
      'costo': costo,
      'stock': stock,
      'categoria': categoria,
      'subcategoria': subcategoria,
      'tipo': tipo,
      'imagen': imagen,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  Product copyWith({
    String? id,
    String? nombre,
    double? precio,
    double? costo,
    int? stock,
    String? categoria,
    String? subcategoria,
    String? tipo,
    String? imagen,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      precio: precio ?? this.precio,
      costo: costo ?? this.costo,
      stock: stock ?? this.stock,
      categoria: categoria ?? this.categoria,
      subcategoria: subcategoria ?? this.subcategoria,
      tipo: tipo ?? this.tipo,
      imagen: imagen ?? this.imagen,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Calcula el valor total del stock
  double get valorStock => stock * costo;

  // Calcula el margen de ganancia
  double get margenGanancia => precio - costo;

  // Calcula el porcentaje de ganancia
  double get porcentajeGanancia => precio > 0 ? ((precio - costo) / precio) * 100 : 0;

  // Verifica si el stock es bajo (menos de 10 unidades)
  bool get stockBajo => stock < 10;

  // Verifica si no hay stock
  bool get sinStock => stock <= 0;

  @override
  String toString() {
    return 'Product(id: $id, nombre: $nombre, precio: $precio, stock: $stock)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Product && other.id == id;
  }

  @override
  int get hashCode {
    return id.hashCode;
  }
}

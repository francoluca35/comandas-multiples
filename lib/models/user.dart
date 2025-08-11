class User {
  final String id;
  final String nombre;
  final String email;
  final String rol;
  final String? imagen;
  final String restauranteId;
  final String nombreResto;
  final String codActivacion;
  final DateTime createdAt;
  final DateTime? lastLogin;

  User({
    required this.id,
    required this.nombre,
    required this.email,
    required this.rol,
    this.imagen,
    required this.restauranteId,
    required this.nombreResto,
    required this.codActivacion,
    required this.createdAt,
    this.lastLogin,
  });

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map['id'] ?? '',
      nombre: map['nombre'] ?? '',
      email: map['email'] ?? '',
      rol: map['rol'] ?? '',
      imagen: map['imagen'],
      restauranteId: map['restauranteId'] ?? '',
      nombreResto: map['nombreResto'] ?? '',
      codActivacion: map['codActivacion'] ?? '',
      createdAt: map['createdAt']?.toDate() ?? DateTime.now(),
      lastLogin: map['lastLogin']?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'nombre': nombre,
      'email': email,
      'rol': rol,
      'imagen': imagen,
      'restauranteId': restauranteId,
      'nombreResto': nombreResto,
      'codActivacion': codActivacion,
      'createdAt': createdAt,
      'lastLogin': lastLogin,
    };
  }

  User copyWith({
    String? id,
    String? nombre,
    String? email,
    String? rol,
    String? imagen,
    String? restauranteId,
    String? nombreResto,
    String? codActivacion,
    DateTime? createdAt,
    DateTime? lastLogin,
  }) {
    return User(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      email: email ?? this.email,
      rol: rol ?? this.rol,
      imagen: imagen ?? this.imagen,
      restauranteId: restauranteId ?? this.restauranteId,
      nombreResto: nombreResto ?? this.nombreResto,
      codActivacion: codActivacion ?? this.codActivacion,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, nombre: $nombre, email: $email, rol: $rol, restauranteId: $restauranteId)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode {
    return id.hashCode;
  }
}

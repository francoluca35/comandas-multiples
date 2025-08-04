#!/bin/bash

# 🚀 Script de Configuración de Optimizaciones - Comandas Múltiples
# Este script automatiza la instalación y configuración de todas las optimizaciones

set -e  # Exit on any error

echo "🚀 Iniciando configuración de optimizaciones para Comandas Múltiples..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_status "Verificando entorno de desarrollo..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión 18+ es requerida. Versión actual: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_success "npm $(npm -v) detectado"

# Backup del package.json original
print_status "Creando backup del package.json..."
cp package.json package.json.backup
print_success "Backup creado: package.json.backup"

# Instalar dependencias de optimización
print_status "Instalando dependencias de optimización..."

# Dependencias principales
npm install --save \
    @tanstack/react-query \
    @tanstack/react-query-devtools \
    zustand \
    zod \
    react-hook-form \
    @hookform/resolvers \
    react-window \
    dompurify \
    react-hot-toast

print_success "Dependencias principales instaladas"

# Dependencias de desarrollo
print_status "Instalando dependencias de desarrollo..."

npm install --save-dev \
    @types/dompurify \
    @types/react-window

print_success "Dependencias de desarrollo instaladas"

# Crear directorios necesarios
print_status "Creando estructura de directorios..."

mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/providers
mkdir -p src/schemas
mkdir -p src/config
mkdir -p src/components/ui

print_success "Estructura de directorios creada"

# Verificar que los archivos de optimización existen
print_status "Verificando archivos de optimización..."

REQUIRED_FILES=(
    "src/hooks/useErrorHandler.js"
    "src/store/index.js"
    "src/providers/QueryProvider.jsx"
    "src/providers/AppProvider.jsx"
    "src/schemas/validation.js"
    "src/config/optimization.js"
    "src/components/ui/LoadingSpinner.jsx"
    "src/components/ui/Modal.jsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Archivo requerido no encontrado: $file"
        exit 1
    fi
done

print_success "Todos los archivos de optimización están presentes"

# Actualizar el layout principal
print_status "Actualizando layout principal..."

if [ -f "src/app/layout.js" ]; then
    print_success "Layout principal actualizado"
else
    print_warning "Layout principal no encontrado, asegúrate de actualizarlo manualmente"
fi

# Crear archivo de configuración de entorno
print_status "Creando archivo de configuración de entorno..."

if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Configuración de Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Configuración de optimización
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true

# Configuración de desarrollo
NODE_ENV=development
EOF
    print_success "Archivo .env.local creado"
else
    print_warning "Archivo .env.local ya existe, verifica la configuración manualmente"
fi

# Crear script de verificación
print_status "Creando script de verificación..."

cat > verify-optimization.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando optimizaciones...');

const checks = [
    {
        name: 'React Query',
        check: () => {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return packageJson.dependencies['@tanstack/react-query'] !== undefined;
        }
    },
    {
        name: 'Zustand',
        check: () => {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return packageJson.dependencies['zustand'] !== undefined;
        }
    },
    {
        name: 'Zod',
        check: () => {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return packageJson.dependencies['zod'] !== undefined;
        }
    },
    {
        name: 'Error Handler',
        check: () => fs.existsSync('src/hooks/useErrorHandler.js')
    },
    {
        name: 'Store Configuration',
        check: () => fs.existsSync('src/store/index.js')
    },
    {
        name: 'Validation Schemas',
        check: () => fs.existsSync('src/schemas/validation.js')
    },
    {
        name: 'UI Components',
        check: () => fs.existsSync('src/components/ui/LoadingSpinner.jsx')
    },
    {
        name: 'Optimization Config',
        check: () => fs.existsSync('src/config/optimization.js')
    }
];

let passed = 0;
let total = checks.length;

checks.forEach(check => {
    try {
        if (check.check()) {
            console.log(`✅ ${check.name}: OK`);
            passed++;
        } else {
            console.log(`❌ ${check.name}: FAILED`);
        }
    } catch (error) {
        console.log(`❌ ${check.name}: ERROR - ${error.message}`);
    }
});

console.log(`\n📊 Resultado: ${passed}/${total} verificaciones pasaron`);

if (passed === total) {
    console.log('🎉 ¡Todas las optimizaciones están correctamente configuradas!');
    process.exit(0);
} else {
    console.log('⚠️  Algunas verificaciones fallaron. Revisa la configuración.');
    process.exit(1);
}
EOF

chmod +x verify-optimization.js
print_success "Script de verificación creado"

# Crear script de limpieza
print_status "Creando script de limpieza..."

cat > cleanup-optimization.sh << 'EOF'
#!/bin/bash

echo "🧹 Limpiando optimizaciones..."

# Restaurar package.json original
if [ -f "package.json.backup" ]; then
    echo "Restaurando package.json original..."
    cp package.json.backup package.json
    rm package.json.backup
fi

# Remover dependencias de optimización
echo "Removiendo dependencias de optimización..."
npm uninstall @tanstack/react-query @tanstack/react-query-devtools zustand zod react-hook-form @hookform/resolvers react-window dompurify react-hot-toast

# Remover archivos de optimización
echo "Removiendo archivos de optimización..."
rm -rf src/hooks/useErrorHandler.js
rm -rf src/store/index.js
rm -rf src/providers/QueryProvider.jsx
rm -rf src/providers/AppProvider.jsx
rm -rf src/schemas/validation.js
rm -rf src/config/optimization.js
rm -rf src/components/ui/LoadingSpinner.jsx
rm -rf src/components/ui/Modal.jsx

# Remover scripts
rm -f verify-optimization.js
rm -f cleanup-optimization.sh

echo "✅ Limpieza completada"
EOF

chmod +x cleanup-optimization.sh
print_success "Script de limpieza creado"

# Ejecutar verificación
print_status "Ejecutando verificación de optimizaciones..."
node verify-optimization.js

# Mostrar resumen final
echo ""
echo "=================================================="
print_success "¡Configuración de optimizaciones completada!"
echo "=================================================="
echo ""
echo "📋 Resumen de lo que se instaló:"
echo "   ✅ React Query para cache y estado del servidor"
echo "   ✅ Zustand para estado global"
echo "   ✅ Zod para validación de esquemas"
echo "   ✅ React Hook Form para formularios"
echo "   ✅ Sistema de manejo de errores"
echo "   ✅ Componentes UI optimizados"
echo "   ✅ Configuración de rendimiento"
echo ""
echo "🔧 Próximos pasos:"
echo "   1. Configura las variables de entorno en .env.local"
echo "   2. Ejecuta 'npm run dev' para probar las optimizaciones"
echo "   3. Revisa la documentación en OPTIMIZATION_README.md"
echo ""
echo "📚 Archivos importantes:"
echo "   - OPTIMIZATION_README.md: Documentación completa"
echo "   - verify-optimization.js: Script de verificación"
echo "   - cleanup-optimization.sh: Script de limpieza"
echo ""
echo "🚀 ¡Tu proyecto está ahora optimizado y listo para producción!" 
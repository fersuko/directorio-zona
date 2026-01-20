export const CATEGORY_MAP: Record<string, { label: string; icon: string; keywords: string[] }> = {
    'Restaurante': {
        label: 'Restaurantes',
        icon: '🍽️',
        keywords: ['comida', 'hambre', 'cenar', 'comer', 'desayunar', 'restaurante', 'tacos', 'pizza', 'hamburguesa']
    },
    'Cafetería': {
        label: 'Cafeterías',
        icon: '☕',
        keywords: ['cafe', 'postre', 'merendar', 'cafeteria', 'pan', 'dulce']
    },
    'Gimnasio': {
        label: 'Gimnasio',
        icon: '💪',
        keywords: ['ejercicio', 'gym', 'entrenar', 'pesas', 'fitness', 'fuerte']
    },
    'Tienda': {
        label: 'Tiendas',
        icon: '🛒',
        keywords: ['comprar', 'tienda', 'abarrotes', 'super', 'despensa']
    },
    'Bar': {
        label: 'Bares',
        icon: '🍹',
        keywords: ['cheve', 'cerveza', 'alcohol', 'tragos', 'fiesta', 'bar', 'antro', 'copas']
    },
    'Belleza': {
        label: 'Belleza',
        icon: '✂️',
        keywords: ['pelo', 'corte', 'barberia', 'estetica', 'uñas', 'maquillaje', 'guapo', 'guapa']
    },
    'Salud': {
        label: 'Salud',
        icon: '🏥',
        keywords: ['doctor', 'medico', 'enfermo', 'medicina', 'farmacia', 'hospital', 'dentista', 'clinica', 'salud', 'emergencia']
    },
    'Car repair': {
        label: 'Talleres',
        icon: '🚗',
        keywords: ['carro', 'taller', 'mecanico', 'llanta', 'aceite', 'falla', 'auto', 'reparacion']
    },
    'Laundry': {
        label: 'Lavandería y Tintorería',
        icon: '🧺',
        keywords: ['ropa', 'lavar', 'planchar', 'lavanderia', 'tintoreria', 'sucio', 'limpio']
    },
    'Point of interest': {
        label: 'Interés',
        icon: '📍',
        keywords: ['turismo', 'visitar', 'museo', 'plaza', 'parque', 'monumento']
    },
    'Lodging': {
        label: 'Hospedaje',
        icon: '🏨',
        keywords: ['hotel', 'dormir', 'quedar', 'noche', 'hospedaje', 'motel', 'airbnb']
    },
    'Real estate agency': {
        label: 'Bienes Raíces',
        icon: '🏠',
        keywords: ['casa', 'renta', 'venta', 'departamento', 'inmobiliaria', 'comprar casa']
    },
    'Veterinary care': {
        label: 'Veterinaria',
        icon: '🐾',
        keywords: ['perro', 'gato', 'mascota', 'veterinario', 'animal', 'vacuna']
    },
    'Default': {
        label: 'Otros',
        icon: '🏪',
        keywords: []
    }
};

export const getCategoryInfo = (category: string) => {
    return CATEGORY_MAP[category] || { label: category, icon: CATEGORY_MAP['Default'].icon, keywords: [] };
};

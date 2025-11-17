import { FurnitureItem, Category, Order, OrderStatus, PlacedItem, ColorOption, Material, FurnitureComponent } from '../types';

// Data simulation
let COLORS: ColorOption[] = [
  { name: 'White', hex: '#FFFFFF', additionalCostPerSqMeter: 0 },
  { name: 'Black Ash', hex: '#343434', additionalCostPerSqMeter: 10 },
  { name: 'Oak', hex: '#b99564', additionalCostPerSqMeter: 25 },
  { name: 'Walnut', hex: '#634832', additionalCostPerSqMeter: 40 },
  { name: 'Graphite', hex: '#555555', additionalCostPerSqMeter: 15 },
  { name: 'Navy Blue (Gloss)', hex: '#000080', additionalCostPerSqMeter: 50 },
];

let MATERIALS: Material[] = [
  { id: 'm1', name: 'MDF', pricePerSqMeter: 50 },
  { id: 'm2', name: 'Plywood', pricePerSqMeter: 75 },
  { id: 'm3', name: 'Solid Oak', pricePerSqMeter: 250 },
  { id: 'm4', name: 'Solid Walnut', pricePerSqMeter: 320 },
];

let WORK_PRICE_PERCENTAGE = 0.30; // 30% markup for labor/work

let FURNITURE_DATA: FurnitureItem[] = [
    {
        id: 'lv-sofa-1', name: 'Modern Sofa', category: 'Living Room',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        components: [
            { name: 'Base Frame', width: 220, length: 90 },
            { name: 'Back Panel', width: 220, length: 50 },
            { name: 'Side Panel', width: 90, length: 50 },
            { name: 'Side Panel', width: 90, length: 50 },
        ],
        minWidth: 180, maxWidth: 300, defaultWidth: 220,
        minLength: 80, maxLength: 110, defaultLength: 90,
        minHeight: 70, maxHeight: 90, defaultHeight: 80,
        availableColors: [COLORS[0], COLORS[4], COLORS[5]],
        availableMaterials: [MATERIALS[0], MATERIALS[1]],
        canBeCorner: true,
        minCornerLength: 150, maxCornerLength: 250, defaultCornerLength: 180,
        cornerComponents: [
            { name: 'Corner Base Frame', width: 180, length: 90 },
            { name: 'Corner Back Panel', width: 180, length: 50 },
        ]
    },
    {
        id: 'br-wardrobe-1', name: '3-Door Wardrobe', category: 'Bedroom',
        imageUrl: 'https://images.unsplash.com/photo-1558993583-1a7102224419?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        components: [
            { name: 'Top Panel', width: 180, length: 65 },
            { name: 'Bottom Panel', width: 180, length: 65 },
            { name: 'Left Panel', width: 220, length: 65 },
            { name: 'Right Panel', width: 220, length: 65 },
            { name: 'Back Panel', width: 180, length: 220 },
            { name: 'Door', width: 60, length: 215 },
            { name: 'Door', width: 60, length: 215 },
            { name: 'Door', width: 60, length: 215 },
            { name: 'Shelf', width: 178, length: 60 },
            { name: 'Shelf', width: 178, length: 60 },
        ],
        minWidth: 150, maxWidth: 250, defaultWidth: 180,
        minLength: 60, maxLength: 70, defaultLength: 65,
        minHeight: 200, maxHeight: 240, defaultHeight: 220,
        availableColors: [COLORS[0], COLORS[1]],
        availableMaterials: [MATERIALS[0], MATERIALS[1]],
        canBeCorner: true,
        minCornerLength: 120, maxCornerLength: 200, defaultCornerLength: 150,
        cornerComponents: [
            { name: 'Corner Top Panel', width: 150, length: 65 },
            { name: 'Corner Bottom Panel', width: 150, length: 65 },
            { name: 'Corner Back Panel', width: 150, length: 220 },
            { name: 'Corner Shelf', width: 148, length: 60 },
        ]
    },
    {
        id: 'ki-cabinet-1', name: 'Kitchen Island', category: 'Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1600585152225-3579fe9d7ae2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        components: [
            { name: 'Countertop', width: 150, length: 90 },
            { name: 'Side Panel', width: 90, length: 90 },
            { name: 'Side Panel', width: 90, length: 90 },
            { name: 'Front Panel', width: 150, length: 90 },
            { name: 'Back Panel', width: 150, length: 90 },
        ],
        minWidth: 120, maxWidth: 200, defaultWidth: 150,
        minLength: 80, maxLength: 100, defaultLength: 90,
        minHeight: 90, maxHeight: 95, defaultHeight: 92,
        availableColors: [COLORS[0], COLORS[4]],
        availableMaterials: [MATERIALS[2], MATERIALS[3]],
        canBeCorner: true,
        minCornerLength: 120, maxCornerLength: 180, defaultCornerLength: 140,
        cornerComponents: [
            { name: 'Corner Countertop', width: 140, length: 90 },
            { name: 'Corner Front Panel', width: 140, length: 90 },
        ]
    },
];

let MOCK_ORDERS: Order[] = [];


// --- API Functions ---
const simulateDelay = <T>(data: T, errorRate = 0): Promise<T> => {
    return new Promise((resolve, reject) => {
        const delay = Math.random() * 400 + 100; // 100-500ms delay
        setTimeout(() => {
            if (Math.random() < errorRate) {
                reject(new Error("A simulated network error occurred."));
            } else {
                resolve(JSON.parse(JSON.stringify(data)));
            }
        }, delay);
    });
};

export const getCategories = (): Category[] => {
    return ['Living Room', 'Dining Room', 'Bedroom', 'Kitchen', 'Kids', 'Library', 'Hallway'];
};

// --- Price Calculation Logic ---
export const calculatePanelPrice = (width: number, length: number, material: Material, color?: ColorOption): number => {
    if (width <= 0 || length <= 0) return 0;
    const areaSqMeters = (width / 100) * (length / 100);
    const materialCost = areaSqMeters * material.pricePerSqMeter;
    const colorCost = areaSqMeters * (color?.additionalCostPerSqMeter || 0);
    return materialCost + colorCost;
};

export const calculateItemPrice = (item: PlacedItem | FurnitureItem): number => {
    const isPlaced = 'instanceId' in item;
    const width = isPlaced ? item.customWidth : item.defaultWidth;
    const length = isPlaced ? item.customLength : item.defaultLength;
    const material = isPlaced ? item.customMaterial : item.availableMaterials[0];
    const color = isPlaced ? item.customColor : item.availableColors[0];
    const isCorner = isPlaced ? item.isCorner : false;
    const cornerLength = isPlaced ? item.customCornerLength : item.defaultCornerLength || 0;
    
    if (!item.components || item.components.length === 0) return 0;

    const widthScale = width / item.defaultWidth;
    const lengthScale = length / item.defaultLength;

    let totalMaterialCost = 0;
    for (const component of item.components) {
        const scaledWidth = component.width * widthScale;
        const scaledLength = component.length * lengthScale;
        totalMaterialCost += calculatePanelPrice(scaledWidth, scaledLength, material, color);
    }
    
    if (isCorner && item.cornerComponents && item.defaultCornerLength) {
        const cornerLengthScale = cornerLength / item.defaultCornerLength;
        for (const component of item.cornerComponents) {
            const scaledWidth = component.width * cornerLengthScale;
            const scaledLength = component.length * lengthScale;
            totalMaterialCost += calculatePanelPrice(scaledWidth, scaledLength, material, color);
        }
    }
    
    const finalPrice = totalMaterialCost * (1 + WORK_PRICE_PERCENTAGE);
    return Math.round(finalPrice);
};


const addCalculatedPrice = (item: FurnitureItem) => ({
    ...item,
    basePrice: calculateItemPrice(item)
});

export const getFurnitureForCategory = (category: Category): Promise<(FurnitureItem & { basePrice: number })[]> => {
    const items = FURNITURE_DATA.filter(item => item.category === category).map(addCalculatedPrice);
    return simulateDelay(items);
};

export const getAllFurniture = (): Promise<(FurnitureItem & { basePrice: number })[]> => {
    return simulateDelay(FURNITURE_DATA.map(addCalculatedPrice));
};

const calculateTotalPrice = (items: PlacedItem[]): number => {
    return items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
};

export const submitOrder = (items: PlacedItem[], clientTotalPrice: number): Promise<Order> => {
    const serverCalculatedPrice = calculateTotalPrice(items);
    if (Math.abs(serverCalculatedPrice - clientTotalPrice) > 1) {
        console.warn(`Price discrepancy! Client: ${clientTotalPrice}, Server: ${serverCalculatedPrice}. Using server price.`);
    }
    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        totalPrice: serverCalculatedPrice,
        status: OrderStatus.New,
        items: items,
    };
    MOCK_ORDERS.unshift(newOrder);
    return simulateDelay(newOrder);
};

export const getOrders = (): Promise<Order[]> => {
    return simulateDelay(MOCK_ORDERS);
};

// --- ADMIN FUNCTIONS ---
export const addFurniture = (newItemData: Omit<FurnitureItem, 'id'>): Promise<FurnitureItem> => {
    const newFurniture: FurnitureItem = {
        ...newItemData,
        id: `${newItemData.category.slice(0, 2).toLowerCase()}-${newItemData.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    };
    FURNITURE_DATA.push(newFurniture);
    return simulateDelay(newFurniture);
}

export const updateFurniture = (updatedItem: FurnitureItem): Promise<FurnitureItem> => {
    const index = FURNITURE_DATA.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
        return Promise.reject(new Error("Item not found"));
    }
    FURNITURE_DATA[index] = updatedItem;
    return simulateDelay(updatedItem);
};

export const deleteFurniture = (itemId: string): Promise<void> => {
    const initialLength = FURNITURE_DATA.length;
    FURNITURE_DATA = FURNITURE_DATA.filter(item => item.id !== itemId);
    if (FURNITURE_DATA.length < initialLength) {
        return simulateDelay(undefined);
    }
    return Promise.reject(new Error("Item not found"));
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): Promise<Order> => {
    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        MOCK_ORDERS[orderIndex].status = status;
        return simulateDelay(MOCK_ORDERS[orderIndex]);
    }
    return Promise.reject(new Error("Order not found"));
}

// Pricing Management
export const getMaterials = (): Promise<Material[]> => simulateDelay(MATERIALS);
export const updateMaterial = (material: Material): Promise<Material> => {
    const index = MATERIALS.findIndex(m => m.id === material.id);
    if (index > -1) {
        MATERIALS[index] = material;
    } else {
        MATERIALS.push({...material, id: `m-${Date.now()}`});
    }
    return simulateDelay(material);
};
export const deleteMaterial = (id: string): Promise<void> => {
    MATERIALS = MATERIALS.filter(m => m.id !== id);
    return simulateDelay(undefined);
};


export const getColors = (): Promise<ColorOption[]> => simulateDelay(COLORS);
export const updateColor = (color: ColorOption): Promise<ColorOption> => {
     const index = COLORS.findIndex(c => c.name === color.name);
    if (index > -1) {
        COLORS[index] = color;
    } else {
        COLORS.push(color);
    }
    return simulateDelay(color);
}
export const deleteColor = (name: string): Promise<void> => {
    COLORS = COLORS.filter(c => c.name !== name);
    return simulateDelay(undefined);
};


export const getWorkPricePercentage = (): Promise<number> => simulateDelay(WORK_PRICE_PERCENTAGE);
export const setWorkPricePercentage = (percentage: number): Promise<number> => {
    WORK_PRICE_PERCENTAGE = percentage;
    return simulateDelay(WORK_PRICE_PERCENTAGE);
}

// These are now for the admin panel to get the master list.
export const getAvailableColors = (): ColorOption[] => COLORS;
export const getAvailableMaterials = (): Material[] => MATERIALS;
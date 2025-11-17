
export type Category = 'Kitchen' | 'Dining Room' | 'Living Room' | 'Bedroom' | 'Kids' | 'Library' | 'Hallway';

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

export interface ColorOption {
  name: string;
  hex: string;
  additionalCostPerSqMeter: number; // e.g., 0 for standard, 20 for premium gloss
}

export interface Material {
  id: string;
  name: string;
  pricePerSqMeter: number; // Price per square meter for panel calculations
}

export interface FurnitureComponent {
    name: string; // e.g., 'Door', 'Shelf', 'Side Panel'
    width: number; // cm
    length: number; // cm
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  components: FurnitureComponent[];
  
  // Overall dimension constraints remain
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  minLength: number;
  maxLength: number;
  defaultLength: number;
  minHeight: number;
  maxHeight: number;
  defaultHeight: number;
  
  availableColors: ColorOption[];
  availableMaterials: Material[];

  // Corner functionality properties
  canBeCorner?: boolean;
  minCornerLength?: number;
  maxCornerLength?: number;
  defaultCornerLength?: number;
  cornerComponents?: FurnitureComponent[];
}

export interface PlacedItem extends Omit<FurnitureItem, 'id'> {
  instanceId: string;
  id: string; // The ID of the base furniture item
  position: { x: number; y: number; z: number }; // 3D position in meters from room center
  customWidth: number;
  customLength: number; // This will now represent "Depth"
  customHeight: number;
  customColor: ColorOption;
  customMaterial: Material;
  rotation: number; // in degrees
  
  // Corner state
  isCorner: boolean;
  customCornerLength: number;
}


export enum OrderStatus {
  New = 'New',
  InProduction = 'In Production',
  ReadyForDelivery = 'Ready for Delivery',
  OnTheWay = 'On the Way',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface Order {
  id: string;
  date: string;
  totalPrice: number;
  status: OrderStatus;
  items: PlacedItem[];
}
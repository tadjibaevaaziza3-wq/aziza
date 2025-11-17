
import { useState, useCallback, useMemo } from 'react';
import { PlacedItem, FurnitureItem } from '../types';
import { submitOrder, calculateItemPrice as apiCalculateItemPrice } from '../services/mockApi';

export const useRoomBuilder = () => {
    const [roomDimensions, setRoomDimensions] = useState({ width: 5, length: 4, height: 2.5 }); // in meters
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSetRoomDimension = useCallback(<K extends keyof typeof roomDimensions,>(dim: K, value: number) => {
        setRoomDimensions(prev => ({ ...prev, [dim]: value }));
    }, []);

    const addItemToRoom = useCallback((item: FurnitureItem) => {
        const newItem: PlacedItem = {
            ...item,
            instanceId: `${item.id}-${Date.now()}`,
            id: item.id,
            position: { x: 0, y: (item.defaultHeight / 100) / 2, z: 0 }, // Center of the room, on the floor
            customWidth: item.defaultWidth,
            customLength: item.defaultLength,
            customHeight: item.defaultHeight,
            customColor: item.availableColors[0],
            customMaterial: item.availableMaterials[0],
            rotation: 0,
            isCorner: false,
            customCornerLength: item.defaultCornerLength || item.minLength,
        };
        setPlacedItems(prev => [...prev, newItem]);
        setSelectedItemId(newItem.instanceId);
    }, []);

    const selectItem = useCallback((instanceId: string | null) => {
        setSelectedItemId(instanceId);
    }, []);
    
    const updateItemPosition = useCallback((instanceId: string, position: {x: number, y: number, z: number}) => {
        setPlacedItems(prev => prev.map(item => item.instanceId === instanceId ? { ...item, position } : item));
    }, []);
    
    const updateItemProperty = useCallback(<K extends keyof PlacedItem,>(instanceId: string, property: K, value: PlacedItem[K]) => {
        setPlacedItems(prev => prev.map(item => item.instanceId === instanceId ? { ...item, [property]: value } : item));
    }, []);

    const removeItem = useCallback((instanceId: string) => {
        setPlacedItems(prev => prev.filter(item => item.instanceId !== instanceId));
        if (selectedItemId === instanceId) {
            setSelectedItemId(null);
        }
    }, [selectedItemId]);

    const selectedItem = useMemo(() => {
        return placedItems.find(item => item.instanceId === selectedItemId) || null;
    }, [placedItems, selectedItemId]);
    
    const calculateItemPrice = useCallback((item: PlacedItem): number => {
        return apiCalculateItemPrice(item);
    }, []);

    const totalPrice = useMemo(() => {
        return placedItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
    }, [placedItems, calculateItemPrice]);

    const handleOrderSubmit = useCallback(async () => {
        if (placedItems.length === 0) {
            alert('Your room is empty. Add some furniture before ordering.');
            return;
        }
        setIsSubmitting(true);
        try {
            const order = await submitOrder(placedItems, totalPrice);
            alert(`Order #${order.id} submitted successfully!`);
            setPlacedItems([]);
            setSelectedItemId(null);
        } catch (error) {
            console.error("Order submission error:", error);
            alert('There was an error submitting your order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [placedItems, totalPrice]);

    return {
        roomDimensions,
        handleSetRoomDimension,
        placedItems,
        addItemToRoom,
        selectItem,
        selectedItemId,
        selectedItem,
        updateItemPosition,
        updateItemProperty,
        removeItem,
        calculateItemPrice,
        totalPrice,
        handleOrderSubmit,
        isSubmitting,
    };
};

import React, { useState, useEffect, useCallback } from 'react';
import { Order, FurnitureItem, OrderStatus, Category, ColorOption, Material, FurnitureComponent } from '../types';
import * as api from '../services/mockApi';
import { PlusCircleIcon, TrashIcon, PencilSquareIcon } from '../components/icons';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'furniture' | 'pricing' | 'calculator'>('orders');

    return (
        <div>
            <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>
            <div className="flex border-b-2 border-brand-secondary mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 whitespace-nowrap ${activeTab === 'orders' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-text'}`}
                >
                    Order Management
                </button>
                <button
                    onClick={() => setActiveTab('furniture')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 whitespace-nowrap ${activeTab === 'furniture' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-text'}`}
                >
                    Furniture Management
                </button>
                 <button
                    onClick={() => setActiveTab('pricing')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 whitespace-nowrap ${activeTab === 'pricing' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-text'}`}
                >
                    Pricing
                </button>
                 <button
                    onClick={() => setActiveTab('calculator')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 whitespace-nowrap ${activeTab === 'calculator' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-text'}`}
                >
                    Price Calculator
                </button>
            </div>

            {activeTab === 'orders' && <OrderManager />}
            {activeTab === 'furniture' && <FurnitureManager />}
            {activeTab === 'pricing' && <PricingManager />}
            {activeTab === 'calculator' && <PriceCalculator />}
        </div>
    );
};


const PricingManager: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [colors, setColors] = useState<ColorOption[]>([]);
    const [workPrice, setWorkPrice] = useState(0);

    const fetchData = useCallback(async () => {
        const [mats, cols, work] = await Promise.all([
            api.getMaterials(),
            api.getColors(),
            api.getWorkPricePercentage()
        ]);
        setMaterials(mats);
        setColors(cols);
        setWorkPrice(work * 100);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleWorkPriceSave = async () => {
        try {
            await api.setWorkPricePercentage(workPrice / 100);
            alert("Work price updated successfully!");
        } catch {
            alert("Failed to update work price.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-brand-secondary p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Work Price Markup</h2>
                <div className="flex items-center gap-4 max-w-sm">
                    <input
                        type="number"
                        value={workPrice}
                        onChange={e => setWorkPrice(parseFloat(e.target.value))}
                        className="input-style w-24 text-center"
                    />
                    <span className="text-xl font-semibold">%</span>
                    <button onClick={handleWorkPriceSave} className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg">Save</button>
                </div>
                 <p className="text-sm text-brand-text mt-2">This percentage is added to the total material cost of an order.</p>
            </div>
            <MaterialManager materials={materials} onUpdate={fetchData} />
            <ColorManager colors={colors} onUpdate={fetchData} />
            <style>{`.input-style { background-color: #1a202c; border: 1px solid #2d3748; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; color: white; }`}</style>
        </div>
    );
};

const MaterialManager: React.FC<{materials: Material[], onUpdate: () => void}> = ({materials, onUpdate}) => {
    const handleSave = async (mat: Material) => {
        await api.updateMaterial(mat);
        onUpdate();
    }
    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this material?')) {
            await api.deleteMaterial(id);
            onUpdate();
        }
    }
    return (
        <div className="bg-brand-secondary p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Materials</h2>
            <div className="space-y-2">
                {materials.map(mat => (
                    <div key={mat.id} className="flex items-center gap-4">
                        <input value={mat.name} onChange={e => handleSave({...mat, name: e.target.value})} className="input-style flex-grow"/>
                        <input type="number" value={mat.pricePerSqMeter} onChange={e => handleSave({...mat, pricePerSqMeter: parseFloat(e.target.value)})} className="input-style w-32"/>
                        <span>$/m²</span>
                        <button onClick={() => handleDelete(mat.id)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
            <button onClick={() => handleSave({id: '', name: 'New Material', pricePerSqMeter: 100})} className="mt-4 text-brand-accent flex items-center text-sm font-semibold"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Material</button>
        </div>
    )
};

const ColorManager: React.FC<{colors: ColorOption[], onUpdate: () => void}> = ({colors, onUpdate}) => {
     const handleSave = async (col: ColorOption) => {
        await api.updateColor(col);
        onUpdate();
    }
    const handleDelete = async (name: string) => {
        if (window.confirm('Delete this color?')) {
            await api.deleteColor(name);
            onUpdate();
        }
    }
    return (
        <div className="bg-brand-secondary p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Colors & Finishes</h2>
             <div className="space-y-2">
                {colors.map(col => (
                    <div key={col.name} className="flex items-center gap-4">
                        <input value={col.name} readOnly className="input-style flex-grow bg-brand-primary cursor-not-allowed"/>
                        <input type="color" value={col.hex} onChange={e => handleSave({...col, hex: e.target.value})} className="h-10 w-10 p-1 bg-brand-primary rounded"/>
                        <input type="number" value={col.additionalCostPerSqMeter} onChange={e => handleSave({...col, additionalCostPerSqMeter: parseFloat(e.target.value)})} className="input-style w-32"/>
                         <span>$/m² (Upcharge)</span>
                        <button onClick={() => handleDelete(col.name)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
            <button onClick={() => handleSave({name: `New Color ${colors.length+1}`, hex: '#ff0000', additionalCostPerSqMeter: 0})} className="mt-4 text-brand-accent flex items-center text-sm font-semibold"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Color</button>
        </div>
    )
}

const PriceCalculator: React.FC = () => {
    const [width, setWidth] = useState(100);
    const [length, setLength] = useState(50);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [material, setMaterial] = useState<Material | undefined>();
    const [price, setPrice] = useState(0);

    useEffect(() => {
        api.getMaterials().then(mats => {
            setMaterials(mats);
            if(mats.length > 0) setMaterial(mats[0]);
        });
    }, []);

    useEffect(() => {
        if (material) {
            const calculatedPrice = api.calculatePanelPrice(width, length, material);
            setPrice(calculatedPrice);
        }
    }, [width, length, material]);
    
    if (!material) {
        return <div className="bg-brand-secondary p-6 rounded-lg max-w-md mx-auto text-brand-text">Loading or no materials available...</div>;
    }

    return (
        <div className="bg-brand-secondary p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Panel Material Cost Calculator</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1">Width (cm)</label>
                    <input type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value))} className="input-style"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1">Length (cm)</label>
                    <input type="number" value={length} onChange={e => setLength(parseFloat(e.target.value))} className="input-style"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1">Material</label>
                    <select value={material.id} onChange={e => setMaterial(materials.find(m => m.id === e.target.value)!)} className="input-style">
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div className="pt-4 border-t border-brand-primary">
                    <p className="text-brand-text">Calculated Material Cost:</p>
                    <p className="text-3xl font-bold text-brand-accent">${price.toFixed(2)}</p>
                    <p className="text-xs text-brand-text">Note: Does not include color upcharges or work price markup.</p>
                </div>
            </div>
             <style>{`.input-style { background-color: #1a202c; border: 1px solid #2d3748; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; color: white; }`}</style>
        </div>
    )
}

const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedOrders = await api.getOrders();
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            const updatedOrder = await api.updateOrderStatus(orderId, status);
            setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? updatedOrder : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(updatedOrder);
            }
        } catch(error) {
            console.error("Failed to update order status", error);
            alert("Failed to update order status.");
        }
    };

    if (loading) return <div className="text-brand-text text-center p-8">Loading orders...</div>;
    
    if (selectedOrder) {
        return <OrderDetailView order={selectedOrder} onBack={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />
    }

    return (
        <div className="bg-brand-secondary shadow-xl rounded-lg overflow-hidden">
             <ul className="divide-y divide-brand-primary">
                {orders.map((order) => (
                    <li key={order.id} onClick={() => setSelectedOrder(order)} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center hover:bg-brand-primary/50 cursor-pointer transition-colors">
                        <div>
                            <p className="font-bold text-lg text-white">Order #{order.id}</p>
                            <p className="text-sm text-brand-text">Date: {order.date}</p>
                        </div>
                        <div className="text-lg font-semibold text-white">
                            ${order.totalPrice.toFixed(2)}
                        </div>
                         <div>
                            <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full`}>
                                {order.status}
                            </span>
                        </div>
                        <div>
                            <select
                                value={order.status}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(order.id, e.target.value as OrderStatus)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-brand-primary border border-brand-secondary rounded-md p-2 text-white"
                            >
                                {Object.values(OrderStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const OrderDetailView: React.FC<{order: Order, onBack: () => void, onStatusChange: (orderId: string, status: OrderStatus) => void}> = ({ order, onBack, onStatusChange }) => {
    return (
        <div className="bg-brand-secondary p-6 rounded-lg">
            <button onClick={onBack} className="text-brand-accent mb-4">&larr; Back to all orders</button>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Order #{order.id}</h2>
                    <p className="text-brand-text">Date: {order.date}</p>
                </div>
                <div className="text-right">
                    <p className="text-brand-text">Total Price</p>
                    <p className="text-3xl font-bold text-brand-accent">${order.totalPrice.toFixed(2)}</p>
                </div>
            </div>
            
             <div className="mb-6">
                 <label className="text-sm text-brand-text">Status</label>
                 <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                    className="w-full max-w-xs bg-brand-primary border border-brand-secondary rounded-md p-2 text-white"
                 >
                     {Object.values(OrderStatus).map(status => (
                         <option key={status} value={status}>{status}</option>
                     ))}
                 </select>
            </div>


            <h3 className="text-xl font-bold text-white mb-4">Items in Order</h3>
            <div className="space-y-4">
                {order.items.map(item => (
                    <div key={item.instanceId} className="bg-brand-primary p-4 rounded-lg flex gap-4">
                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md"/>
                        <div className="flex-grow">
                            <div className="flex justify-between">
                                 <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                 <p className="font-semibold text-lg text-brand-accent">${api.calculateItemPrice(item).toFixed(2)}</p>
                            </div>
                           
                            <p className="text-sm text-brand-text">
                                {item.customWidth}cm x {item.customLength}cm x {item.customHeight}cm
                            </p>
                             {item.isCorner && <p className="text-sm text-brand-text">Corner Length: {item.customCornerLength}cm</p>}
                            <p className="text-sm text-brand-text">Material: {item.customMaterial.name}</p>
                            <div className="flex items-center gap-2 text-sm text-brand-text">
                                Color: {item.customColor.name} 
                                <span className="w-4 h-4 rounded-full" style={{backgroundColor: item.customColor.hex}}></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const FurnitureManager: React.FC = () => {
    const [furniture, setFurniture] = useState<(FurnitureItem & {basePrice: number})[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<FurnitureItem | 'new' | null>(null);

    const fetchFurniture = useCallback(async () => {
        setLoading(true);
        try {
            const items = await api.getAllFurniture();
            setFurniture(items);
        } catch(error) {
             console.error("Failed to fetch furniture", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFurniture();
    }, [fetchFurniture]);

    const handleSaveFurniture = async (itemData: FurnitureItem) => {
        try {
            if (itemData.id) {
                await api.updateFurniture(itemData);
            } else {
                await api.addFurniture(itemData);
            }
            setEditingItem(null);
            fetchFurniture();
        } catch (error) {
            console.error("Failed to save furniture", error);
            alert('Failed to save furniture.');
        }
    };
    
    const handleDelete = async (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.deleteFurniture(itemId);
                fetchFurniture();
            } catch (error) {
                console.error("Failed to delete furniture", error);
                alert('Failed to delete furniture.');
            }
        }
    }

    if (loading) return <div className="text-brand-text text-center p-8">Loading furniture...</div>;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setEditingItem('new')}
                    className="flex items-center bg-brand-accent text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-orange-400"
                >
                    <PlusCircleIcon className="w-6 h-6 mr-2" />
                    Add New Furniture
                </button>
            </div>

            {editingItem && <FurnitureFormModal item={editingItem} onSave={handleSaveFurniture} onCancel={() => setEditingItem(null)} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {furniture.map(item => (
                    <div key={item.id} className="bg-brand-secondary rounded-lg p-4 flex flex-col justify-between">
                        <div>
                           <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-md mb-4"/>
                            <h3 className="text-lg font-bold text-white">{item.name}</h3>
                            <p className="text-brand-text">{item.category}</p>
                            <p className="text-brand-accent font-semibold text-xl">${item.basePrice.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                             <button onClick={() => setEditingItem(item)} className="p-2 text-brand-text hover:text-white transition-colors" aria-label={`Edit ${item.name}`}>
                                <PencilSquareIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-brand-text hover:text-red-500 transition-colors" aria-label={`Delete ${item.name}`}>
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EMPTY_FURNITURE_ITEM: Omit<FurnitureItem, 'id'> = {
    name: '', category: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80',
    components: [{ name: 'Main Panel', width: 100, length: 50 }],
    defaultWidth: 100, minWidth: 50, maxWidth: 150,
    defaultLength: 50, minLength: 30, maxLength: 80,
    defaultHeight: 80, minHeight: 40, maxHeight: 120,
    availableColors: api.getAvailableColors(),
    availableMaterials: api.getAvailableMaterials(),
    canBeCorner: false,
    cornerComponents: [],
    defaultCornerLength: 100, minCornerLength: 80, maxCornerLength: 150,
};

const FurnitureFormModal: React.FC<{
    item: FurnitureItem | 'new',
    onSave: (data: FurnitureItem) => void,
    onCancel: () => void,
}> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<FurnitureItem, 'id'> & {id?: string}>(
        item === 'new' ? EMPTY_FURNITURE_ITEM : item
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as FurnitureItem);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    };

    const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }

    const handleComponentChange = (index: number, field: keyof FurnitureComponent, value: string | number, isCorner: boolean) => {
        const componentList = isCorner ? formData.cornerComponents || [] : formData.components;
        const newComponents = [...componentList];
        (newComponents[index] as any)[field] = value;
        const keyToUpdate = isCorner ? 'cornerComponents' : 'components';
        setFormData(prev => ({ ...prev, [keyToUpdate]: newComponents }));
    }
    
    const addComponent = (isCorner: boolean) => {
        const newComponent = {name: 'New Panel', width: 50, length: 30};
        const keyToUpdate = isCorner ? 'cornerComponents' : 'components';
        const existingComponents = (formData as any)[keyToUpdate] || [];
        setFormData(prev => ({ ...prev, [keyToUpdate]: [...existingComponents, newComponent]}));
    }

    const removeComponent = (index: number, isCorner: boolean) => {
        const componentList = isCorner ? formData.cornerComponents || [] : formData.components;
        const keyToUpdate = isCorner ? 'cornerComponents' : 'components';
        setFormData(prev => ({ ...prev, [keyToUpdate]: componentList.filter((_, i) => i !== index)}));
    }

    const ComponentEditor: React.FC<{isCorner: boolean}> = ({isCorner}) => {
        const components = (isCorner ? formData.cornerComponents : formData.components) || [];
        const title = isCorner ? 'Corner Components' : 'Main Components';
        return (
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <div className="space-y-2">
                {components.map((comp, index) => (
                    <div key={index} className="flex items-center gap-2 bg-brand-primary p-2 rounded">
                        <input value={comp.name} onChange={e => handleComponentChange(index, 'name', e.target.value, isCorner)} placeholder="Name" className="input-style flex-grow"/>
                        <input type="number" value={comp.width} onChange={e => handleComponentChange(index, 'width', parseFloat(e.target.value), isCorner)} placeholder="Width" className="input-style w-24"/>
                        <input type="number" value={comp.length} onChange={e => handleComponentChange(index, 'length', parseFloat(e.target.value), isCorner)} placeholder="Length" className="input-style w-24"/>
                        <button type="button" onClick={() => removeComponent(index, isCorner)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
                </div>
                <button type="button" onClick={() => addComponent(isCorner)} className="mt-2 text-brand-accent flex items-center text-sm font-semibold"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Component</button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-brand-secondary p-6 rounded-lg space-y-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                 <h2 className="text-2xl font-bold text-white mb-4">{item === 'new' ? 'Add New Furniture' : 'Edit Furniture'}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="input-style" />
                    <select name="category" value={formData.category} onChange={handleChange} className="input-style">
                        {api.getCategories().map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} required className="input-style md:col-span-2" />
                </div>
                
                <ComponentEditor isCorner={false} />
                
                 <p className="text-sm text-brand-text pt-2">Default Dimensions (cm)</p>
                <div className="grid grid-cols-3 gap-4">
                     <input name="defaultWidth" type="number" placeholder="Width" value={formData.defaultWidth} onChange={handleDimensionChange} required className="input-style" />
                     <input name="defaultLength" type="number" placeholder="Length" value={formData.defaultLength} onChange={handleDimensionChange} required className="input-style" />
                     <input name="defaultHeight" type="number" placeholder="Height" value={formData.defaultHeight} onChange={handleDimensionChange} required className="input-style" />
                </div>
                 <p className="text-sm text-brand-text pt-2">Min/Max Dimensions (cm)</p>
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex gap-2"><input name="minWidth" type="number" placeholder="Min W" value={formData.minWidth} onChange={handleDimensionChange} required className="input-style" /><input name="maxWidth" type="number" placeholder="Max W" value={formData.maxWidth} onChange={handleDimensionChange} required className="input-style" /></div>
                    <div className="flex gap-2"><input name="minLength" type="number" placeholder="Min L" value={formData.minLength} onChange={handleDimensionChange} required className="input-style" /><input name="maxLength" type="number" placeholder="Max L" value={formData.maxLength} onChange={handleDimensionChange} required className="input-style" /></div>
                    <div className="flex gap-2"><input name="minHeight" type="number" placeholder="Min H" value={formData.minHeight} onChange={handleDimensionChange} required className="input-style" /><input name="maxHeight" type="number" placeholder="Max H" value={formData.maxHeight} onChange={handleDimensionChange} required className="input-style" /></div>
                </div>

                <div className="pt-4 border-t border-brand-primary">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="canBeCorner" checked={!!formData.canBeCorner} onChange={handleChange} className="accent-brand-accent"/>
                        <span>This item can be a corner unit</span>
                    </label>
                    {formData.canBeCorner && (
                        <div className="mt-4 space-y-4">
                            <p className="text-sm text-brand-text pt-2">Corner Wing Dimensions (cm)</p>
                            <div className="grid grid-cols-3 gap-4">
                                <input name="defaultCornerLength" type="number" placeholder="Default Length" value={formData.defaultCornerLength} onChange={handleDimensionChange} className="input-style" />
                                <input name="minCornerLength" type="number" placeholder="Min Length" value={formData.minCornerLength} onChange={handleDimensionChange} className="input-style" />
                                <input name="maxCornerLength" type="number" placeholder="Max Length" value={formData.maxCornerLength} onChange={handleDimensionChange} className="input-style" />
                            </div>
                            <ComponentEditor isCorner={true}/>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onCancel} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg">Save Furniture</button>
                </div>
                <style>{`.input-style { background-color: #1a202c; border: 1px solid #2d3748; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; color: white; }`}</style>
            </form>
        </div>
    );
}

export default AdminPage;
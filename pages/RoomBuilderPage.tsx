
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useRoomBuilder } from '../hooks/useRoomBuilder';
import { getAllFurniture } from '../services/mockApi';
import { FurnitureItem, PlacedItem, ColorOption, Material } from '../types';
import { TrashIcon, CubeTransparentIcon } from '../components/icons';

const RoomBuilderPage: React.FC = () => {
    const {
        roomDimensions, handleSetRoomDimension, placedItems,
        addItemToRoom, selectItem, selectedItemId, selectedItem, updateItemPosition,
        updateItemProperty, removeItem, calculateItemPrice, totalPrice, handleOrderSubmit, isSubmitting
    } = useRoomBuilder();

    const [furniturePalette, setFurniturePalette] = useState<(FurnitureItem & {basePrice: number})[]>([]);
    const [loadingPalette, setLoadingPalette] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);

    useEffect(() => {
        const fetchPalette = async () => {
            setLoadingPalette(true);
            try {
                const items = await getAllFurniture();
                setFurniturePalette(items);
            } catch (error) {
                console.error("Failed to fetch furniture palette:", error);
            } finally {
                setLoadingPalette(false);
            }
        };
        fetchPalette();
    }, []);
    

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]">
            {/* Left Panel: Palette & Settings */}
            <div className="w-full lg:w-1/4 bg-brand-secondary rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
                <DimensionControls roomDimensions={roomDimensions} onDimensionChange={handleSetRoomDimension} />
                <SettingsControls snapToGrid={snapToGrid} onSnapChange={setSnapToGrid} />
                <FurniturePalette items={furniturePalette} onAddItem={addItemToRoom} loading={loadingPalette} />
            </div>

            {/* Center Panel: 3D Room */}
            <div className="flex-grow bg-brand-secondary rounded-lg overflow-hidden relative">
                 <ThreeCanvas 
                    roomDimensions={roomDimensions}
                    placedItems={placedItems}
                    selectedItemId={selectedItemId}
                    onSelectItem={selectItem}
                    onUpdateItemPosition={updateItemPosition}
                    snapToGrid={snapToGrid}
                 />
            </div>

            {/* Right Panel: Inspector */}
            <div className="w-full lg:w-1/4 bg-brand-secondary rounded-lg p-4 overflow-y-auto">
                {selectedItem ? (
                     <InspectorPanel 
                        item={selectedItem} 
                        onUpdate={updateItemProperty} 
                        onRemove={removeItem}
                        calculatedPrice={calculateItemPrice(selectedItem)}
                     />
                ) : (
                    <div className="text-center text-brand-text flex flex-col items-center justify-center h-full">
                        <CubeTransparentIcon className="w-16 h-16 mb-4"/>
                        <p className="font-semibold">Select an item to customize it</p>
                        <p className="text-sm">Click on an item in the 3D view.</p>
                    </div>
                )}
            </div>
            
            {/* Bottom Bar: Total & Order */}
             <div className="fixed bottom-0 left-0 right-0 bg-brand-secondary/80 backdrop-blur-sm border-t border-brand-primary p-4 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <span className="text-brand-text">Total Price (est.):</span>
                        <p className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</p>
                    </div>
                    <button 
                        onClick={handleOrderSubmit}
                        disabled={isSubmitting || placedItems.length === 0}
                        className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-orange-400 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSubmitting ? (
                           <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Submitting...
                           </>
                        ) : 'Order Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Child Components ---

const ThreeCanvas: React.FC<{
    roomDimensions: any,
    placedItems: PlacedItem[],
    selectedItemId: string | null,
    onSelectItem: (id: string | null) => void,
    onUpdateItemPosition: (id: string, pos: {x: number, y: number, z: number}) => void,
    snapToGrid: boolean,
}> = ({ roomDimensions, placedItems, selectedItemId, onSelectItem, onUpdateItemPosition, snapToGrid }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef<THREE.PerspectiveCamera>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const controlsRef = useRef<OrbitControls>();
    const raycasterRef = useRef(new THREE.Raycaster());
    const pointerRef = useRef(new THREE.Vector2());
    const planeRef = useRef(new THREE.Plane());
    const dragObjectRef = useRef<THREE.Object3D | null>(null);
    const objectsRef = useRef<THREE.Object3D[]>([]);
    const textureLoaderRef = useRef(new THREE.TextureLoader());
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

    const stateRef = useRef({ onSelectItem, onUpdateItemPosition, roomDimensions, snapToGrid });
    stateRef.current = { onSelectItem, onUpdateItemPosition, roomDimensions, snapToGrid };

    const onPointerMove = useCallback((event: PointerEvent) => {
        if (!mountRef.current || !cameraRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (dragObjectRef.current) {
            raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
            const intersection = new THREE.Vector3();
            raycasterRef.current.ray.intersectPlane(planeRef.current, intersection);
            
            if (!intersection) return;

            const newPosition = new THREE.Vector3(intersection.x, dragObjectRef.current.position.y, intersection.z);
            
            const originalPosition = dragObjectRef.current.position.clone();
            dragObjectRef.current.position.copy(newPosition);
            
            const box = new THREE.Box3().setFromObject(dragObjectRef.current);

            const { width, length } = stateRef.current.roomDimensions;
            const halfWidth = width / 2;
            const halfLength = length / 2;

            const offsetX = (box.max.x > halfWidth) ? (halfWidth - box.max.x) : (box.min.x < -halfWidth) ? (-halfWidth - box.min.x) : 0;
            const offsetZ = (box.max.z > halfLength) ? (halfLength - box.max.z) : (box.min.z < -halfLength) ? (-halfLength - box.min.z) : 0;
            
            newPosition.x += offsetX;
            newPosition.z += offsetZ;
            
            dragObjectRef.current.position.copy(originalPosition); 
            
            if (stateRef.current.snapToGrid) {
                newPosition.x = Math.round(newPosition.x * 4) / 4; 
                newPosition.z = Math.round(newPosition.z * 4) / 4;
            }
            
            dragObjectRef.current.position.copy(newPosition);
            return;
        }

        // Hover logic
        raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(objectsRef.current, true);
        
        let newHoveredId: string | null = null;
        if (intersects.length > 0) {
            let topObject = intersects[0].object;
            while(topObject.parent && !topObject.userData.isFurniture) {
                topObject = topObject.parent;
            }

            if (topObject.userData.isFurniture) {
                newHoveredId = topObject.userData.instanceId;
            }
        }
        
        setHoveredItemId(prevId => prevId === newHoveredId ? prevId : newHoveredId);
        if(mountRef.current) {
            mountRef.current.style.cursor = newHoveredId ? 'pointer' : 'grab';
        }
    }, []);

    const onPointerUp = useCallback(() => {
        if (mountRef.current) mountRef.current.style.cursor = 'grab';
        if (dragObjectRef.current) {
            controlsRef.current!.enabled = true;
            stateRef.current.onUpdateItemPosition(dragObjectRef.current.userData.instanceId, dragObjectRef.current.position);
            dragObjectRef.current = null;
        }
    }, []);

    const onPointerDown = useCallback((event: PointerEvent) => {
        if (event.target !== rendererRef.current?.domElement) return;
        if (!cameraRef.current) return;
        raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(objectsRef.current, true);

        if (intersects.length > 0) {
            let currentObject = intersects[0].object;
            while(currentObject.parent && !currentObject.userData.isFurniture) {
                currentObject = currentObject.parent;
            }

            if (currentObject.userData.isFurniture) {
                stateRef.current.onSelectItem(currentObject.userData.instanceId);
                controlsRef.current!.enabled = false;
                dragObjectRef.current = currentObject;
                planeRef.current.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), intersects[0].point);
                if (mountRef.current) mountRef.current.style.cursor = 'grabbing';
            }
        } else {
            stateRef.current.onSelectItem(null);
        }
    }, []);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        sceneRef.current.background = new THREE.Color(0x2d3748);

        cameraRef.current = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100);
        cameraRef.current.position.set(roomDimensions.width, roomDimensions.height * 2, roomDimensions.length * 1.5);
        cameraRef.current.lookAt(0, 0, 0);

        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(rendererRef.current.domElement);
        
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        sceneRef.current.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 7.5);
        sceneRef.current.add(directionalLight);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controlsRef.current?.update();
            if (rendererRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        const handleResize = () => {
            if (!cameraRef.current || !rendererRef.current || !currentMount) return;
            cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };

        currentMount.addEventListener('pointerdown', onPointerDown);
        currentMount.addEventListener('pointermove', onPointerMove);
        currentMount.addEventListener('pointerup', onPointerUp);
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            currentMount.removeEventListener('pointerdown', onPointerDown);
            currentMount.removeEventListener('pointermove', onPointerMove);
            currentMount.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('resize', handleResize);
            
            controlsRef.current?.dispose();
            if (rendererRef.current) {
                if (rendererRef.current.domElement && currentMount.contains(rendererRef.current.domElement)) {
                    currentMount.removeChild(rendererRef.current.domElement);
                }
                rendererRef.current.dispose();
            }
             sceneRef.current.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }, [onPointerDown, onPointerMove, onPointerUp, roomDimensions]);
    
    // Update scene with room and items
    useEffect(() => {
        const scene = sceneRef.current;
        const textureLoader = textureLoaderRef.current;
        
        // Clean up old objects
        const objectsToRemove = scene.children.filter(c => c.userData.isRoom || c.userData.isFurniture);
        objectsToRemove.forEach(c => {
             if (c instanceof THREE.Group || c instanceof THREE.Mesh) {
                c.traverse(child => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if(child.material instanceof THREE.Material) {
                            child.material.dispose();
                        }
                    }
                });
            }
            scene.remove(c)
        });
        objectsRef.current = [];

        const floorGeo = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.length);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a202c });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.userData.isRoom = true;
        scene.add(floor);

        const gridHelper = new THREE.GridHelper(Math.max(roomDimensions.width, roomDimensions.length), Math.max(roomDimensions.width, roomDimensions.length) * 2, 0x555555, 0x555555);
        gridHelper.position.y = 0.01;
        gridHelper.userData.isRoom = true;
        scene.add(gridHelper);

        placedItems.forEach(item => {
            const texture = textureLoader.load(item.imageUrl);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            const material = new THREE.MeshStandardMaterial({ 
                map: texture,
                color: item.customColor.hex 
            });

            if (item.instanceId === hoveredItemId && item.instanceId !== selectedItemId) {
                material.emissive.setHex(0x444444);
            }

            const group = new THREE.Group();

            const w = item.customWidth / 100;
            const l = item.customLength / 100; 
            const h = item.customHeight / 100;
            
            if (item.isCorner && item.canBeCorner) {
                const cornerL = item.customCornerLength / 100;
                
                const mainWingGeo = new THREE.BoxGeometry(w, h, l);
                const mainWing = new THREE.Mesh(mainWingGeo, material);
                
                const cornerWingGeo = new THREE.BoxGeometry(l, h, cornerL);
                const cornerWing = new THREE.Mesh(cornerWingGeo, material);

                const mainWingOffset = (w - l) / 2;
                mainWing.position.x = mainWingOffset;

                const cornerWingOffset = (cornerL - l) / 2;
                cornerWing.position.z = -cornerWingOffset;

                const compoundGroup = new THREE.Group();
                compoundGroup.add(mainWing, cornerWing);

                const box = new THREE.Box3().setFromObject(compoundGroup);
                const center = new THREE.Vector3();
                box.getCenter(center);
                
                mainWing.position.sub(center);
                cornerWing.position.sub(center);

                group.add(compoundGroup);

            } else {
                const geometry = new THREE.BoxGeometry(w, h, l);
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            }

            group.position.set(item.position.x, h/2, item.position.z);
            group.rotation.y = THREE.MathUtils.degToRad(item.rotation);
            group.userData.instanceId = item.instanceId;
            group.userData.isFurniture = true;
            
            if (item.instanceId === selectedItemId) {
                const box = new THREE.Box3().setFromObject(group);
                const selectionOutline = new THREE.Box3Helper(box, 0xed8936);
                selectionOutline.userData.isRoom = true; // Use isRoom to ensure it's cleaned up
                scene.add(selectionOutline);
            }
            
            scene.add(group);
            objectsRef.current.push(group);
        });

    }, [roomDimensions, placedItems, selectedItemId, hoveredItemId]);


    return <div ref={mountRef} className="w-full h-full" />;
};


const DimensionControls: React.FC<{ roomDimensions: {width: number, length: number, height: number}, onDimensionChange: (dim: string, value: number) => void }> = ({ roomDimensions, onDimensionChange }) => {
    return (
      <div>
        <h2 className="text-lg font-bold text-white mb-2">Room Dimensions (m)</h2>
        <div className="grid grid-cols-3 gap-2">
            {['width', 'length', 'height'].map(dim => (
                <div key={dim}>
                    <label htmlFor={dim} className="text-xs text-brand-text capitalize">{dim}</label>
                    <input
                        type="number" id={dim} value={roomDimensions[dim as keyof typeof roomDimensions]}
                        min={1} max={20} step={0.1}
                        onChange={(e) => onDimensionChange(dim, parseFloat(e.target.value))}
                        className="w-full bg-brand-primary border border-brand-primary rounded-md p-1 text-center"
                    />
                </div>
            ))}
        </div>
    </div>
    )
}

const SettingsControls: React.FC<{ snapToGrid: boolean, onSnapChange: (val: boolean) => void }> = ({ snapToGrid, onSnapChange }) => {
    return (
        <div>
            <h2 className="text-lg font-bold text-white mb-2">Settings</h2>
            <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={snapToGrid} onChange={(e) => onSnapChange(e.target.checked)} className="accent-brand-accent" />
                <span className="text-sm">Snap to Grid (25cm)</span>
            </label>
        </div>
    );
};

const FurniturePalette: React.FC<{ items: (FurnitureItem & {basePrice: number})[], onAddItem: (item: FurnitureItem) => void, loading: boolean }> = ({ items, onAddItem, loading }) => {
    if(loading) return <div className="text-brand-text">Loading furniture...</div>;

    return (
        <div className="flex-grow overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-2">Furniture</h2>
            <div className="grid grid-cols-2 gap-2">
                {items.map(item => (
                    <div key={item.id} onClick={() => onAddItem(item)} className="bg-brand-primary p-2 rounded-md cursor-pointer hover:ring-2 ring-brand-accent transition-all">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-16 object-cover rounded-md mb-2"/>
                        <p className="text-xs text-center font-medium">{item.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

const InspectorPanel: React.FC<{item: PlacedItem, onUpdate: Function, onRemove: Function, calculatedPrice: number}> = ({ item, onUpdate, onRemove, calculatedPrice }) => {
    
    const DimensionSlider: React.FC<{label: string, value: number, min: number, max: number, prop: keyof PlacedItem}> = ({label, value, min, max, prop}) => (
         <div>
            <label className="text-sm flex justify-between"><span>{label}</span><span>{value}cm</span></label>
            <input
                type="range"
                min={min} max={max} value={value}
                onChange={e => onUpdate(item.instanceId, prop, parseInt(e.target.value))}
                className="w-full h-2 bg-brand-primary rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{item.name}</h2>
                <button onClick={() => onRemove(item.instanceId)} className="p-1 text-brand-text hover:text-red-500 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>

            {item.canBeCorner && (
                <label className="flex items-center justify-between bg-brand-primary p-2 rounded-md">
                    <span className="font-semibold">Make Corner Unit</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={item.isCorner} onChange={e => onUpdate(item.instanceId, 'isCorner', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                    </div>
                </label>
            )}
            
            <div className="space-y-2">
                 <h3 className="font-semibold text-brand-text">Dimensions (cm)</h3>
                 <DimensionSlider label={item.isCorner ? "Main Wing Length" : "Width"} prop="customWidth" value={item.customWidth} min={item.minWidth} max={item.maxWidth} />
                 {item.isCorner && item.canBeCorner && <DimensionSlider label="Corner Wing Length" prop="customCornerLength" value={item.customCornerLength} min={item.minCornerLength || 50} max={item.maxCornerLength || 200} />}
                 <DimensionSlider label="Depth" prop="customLength" value={item.customLength} min={item.minLength} max={item.maxLength} />
                 <DimensionSlider label="Height" prop="customHeight" value={item.customHeight} min={item.minHeight} max={item.maxHeight} />
            </div>

             <div>
                <label className="text-sm flex justify-between"><span>Rotation</span><span>{item.rotation}°</span></label>
                <input
                    type="range" min="0" max="359" value={item.rotation}
                    onChange={e => onUpdate(item.instanceId, 'rotation', parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-primary rounded-lg appearance-none cursor-pointer accent-brand-accent"
                />
            </div>

            <div>
                 <h3 className="font-semibold text-brand-text">Material</h3>
                 <select 
                    value={item.customMaterial.id} 
                    onChange={e => {
                        const newMat = item.availableMaterials.find(m => m.id === e.target.value);
                        if(newMat) onUpdate(item.instanceId, 'customMaterial', newMat);
                    }}
                    className="w-full bg-brand-primary border border-brand-primary rounded-md p-2"
                >
                    {item.availableMaterials.map(mat => <option key={mat.id} value={mat.id}>{mat.name}</option>)}
                </select>
            </div>

            <div>
                <h3 className="font-semibold text-brand-text">Color</h3>
                <div className="flex flex-wrap gap-2">
                    {item.availableColors.map(color => (
                        <button key={color.hex} onClick={() => onUpdate(item.instanceId, 'customColor', color)}
                            className={`w-8 h-8 rounded-full border-2 ${item.customColor.hex === color.hex ? 'border-brand-accent' : 'border-transparent'}`}
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-brand-primary">
                <p className="text-sm text-brand-text">Item Price (est.)</p>
                <p className="text-2xl font-bold text-brand-accent">${calculatedPrice.toFixed(2)}</p>
                <p className="text-xs text-brand-text">Based on size and material</p>
            </div>
        </div>
    )
}

export default RoomBuilderPage;

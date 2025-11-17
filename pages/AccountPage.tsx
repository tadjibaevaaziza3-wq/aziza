
import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/mockApi';
import { Order, OrderStatus } from '../types';

const AccountPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const userOrders = await getOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.New:
        return 'bg-blue-500';
      case OrderStatus.InProduction:
        return 'bg-yellow-500';
      case OrderStatus.ReadyForDelivery:
        return 'bg-purple-500';
      case OrderStatus.OnTheWay:
        return 'bg-orange-500';
      case OrderStatus.Delivered:
        return 'bg-green-500';
      case OrderStatus.Cancelled:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
        <div>
            <h1 className="text-4xl font-bold text-white mb-8">My Orders</h1>
            <div className="space-y-4">
                {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="bg-brand-secondary rounded-lg p-4 animate-pulse flex justify-between items-center">
                        <div className="h-6 w-1/4 bg-brand-primary rounded"></div>
                        <div className="h-6 w-1/4 bg-brand-primary rounded"></div>
                        <div className="h-6 w-1/4 bg-brand-primary rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">My Orders</h1>
      <div className="bg-brand-secondary shadow-xl rounded-lg overflow-hidden">
        <ul className="divide-y divide-brand-primary">
          {orders.length > 0 ? orders.map((order) => (
            <li key={order.id} className="p-4 md:p-6 hover:bg-brand-primary/50 transition-colors duration-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <p className="font-bold text-lg text-white">Order #{order.id}</p>
                  <p className="text-sm text-brand-text">Date: {order.date}</p>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-right md:text-left md:mr-8">
                        <p className="text-sm text-brand-text">Total</p>
                        <p className="font-bold text-white text-lg">${order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center">
                        <span
                            className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(order.status)}`}
                        >
                            {order.status}
                        </span>
                    </div>
                </div>
              </div>
            </li>
          )) : (
            <li className="p-6 text-center text-brand-text">You have no orders yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AccountPage;
"use client";
import React, { useState } from "react";
import DeliveryDeliveredNotification from "./DeliveryDeliveredNotification";

const MultipleDeliveryDeliveredNotifications = ({ notifications, onClose }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  React.useEffect(() => {
    if (notifications && notifications.length > 0) {
      setVisibleNotifications(notifications);
    }
  }, [notifications]);

  if (!notifications || notifications.length === 0) return null;

  const handleClose = (notificationId) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (onClose) {
      onClose(notificationId);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9998] space-y-2" style={{ maxWidth: "400px" }}>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id || index}
          style={{ 
            animationDelay: `${index * 100}ms`,
            transform: `translateY(${index * 70}px)`
          }}
        >
          <DeliveryDeliveredNotification
            notification={notification}
            onClose={() => handleClose(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default MultipleDeliveryDeliveredNotifications;


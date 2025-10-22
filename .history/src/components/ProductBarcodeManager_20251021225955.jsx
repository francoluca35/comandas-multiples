"use client";
import React from 'react';
import SimpleProductManager from './SimpleProductManager';

const ProductBarcodeManager = ({ 
  isOpen, 
  onClose, 
  product = null, 
  onProductUpdate 
}) => {
  return (
    <SimpleProductManager
      isOpen={isOpen}
      onClose={onClose}
      product={product}
      onProductUpdate={onProductUpdate}
    />
  );
};

export default ProductBarcodeManager;
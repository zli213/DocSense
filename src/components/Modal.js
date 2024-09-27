// src/components/Modal.js
'use client';

import React from 'react';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-primary-background dark:bg-dark-primary-background p-8 rounded-2xl shadow-lg relative w-2/3 max-w-md mx-auto">
        <button
          className="absolute top-4 right-5 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

type AddButtonProps = {
  here: string;
};

const AddButton: React.FC<AddButtonProps> = ({ here }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${here}`);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-red-600 text-white text-3xl w-14 h-14 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300"
    >
      +
    </button>
  );
};

export default AddButton;
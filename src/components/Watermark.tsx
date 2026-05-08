import React from 'react';

const Watermark: React.FC = () => {
  const text = 'Dưới Mái Hiên';
  
  // Create a grid of rotated text
  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden opacity-[0.03] select-none">
      <div className="flex flex-wrap w-[200vw] h-[200vh] -ml-[50vw] -mt-[50vw] rotate-[-25deg]">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="p-8 text-xl font-bold whitespace-nowrap">
            {text} • {text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watermark;

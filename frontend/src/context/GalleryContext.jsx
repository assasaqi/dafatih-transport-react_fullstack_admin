import React, { createContext, useContext, useState } from 'react';

const GalleryContext = createContext();

export const GalleryProvider = ({ children }) => {
  const [visibleCount, setVisibleCount] = useState(null);

  return (
    <GalleryContext.Provider value={{ visibleCount, setVisibleCount }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => useContext(GalleryContext);

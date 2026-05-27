'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';

interface S3Image {
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

const Life = () => {
  const [images, setImages] = useState<S3Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<S3Image | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images');
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        const shuffledImages = [...data.images].sort(() => Math.random() - 0.5);
        setImages(shuffledImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const breakpointColumns = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  const hasImages = !loading && !error && images.length > 0;
  const isEmpty = !loading && (error !== null || images.length === 0);

  return (
    <div className="stagger text-gray-900 dark:text-gray-50">
      <h1 className="font-display text-[length:var(--step-3)] mb-2 font-medium tracking-tight">
        Life
      </h1>
      <p className="text-[length:var(--step-0)] text-gray-500 dark:text-gray-400 mb-8 leading-[1.6]">
        Just a few photos from my everyday life.
      </p>

      {loading && (
        <p className="text-[length:var(--step--1)] text-gray-500 dark:text-gray-400">
          Loading photos&hellip;
        </p>
      )}

      {isEmpty && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-[length:var(--step-0)] text-gray-500 dark:text-gray-400 leading-[1.6]">
            Photos incoming soon.
          </p>
        </div>
      )}

      {hasImages && (
        <>
          {/* Mobile view (single column) */}
          <div className="md:hidden space-y-4">
            {images.map((image) => (
              <div key={image.key} className="w-full">
                <Image
                  src={image.url}
                  alt={image.key}
                  width={500}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>

          {/* Desktop view (masonry layout) */}
          <div className="hidden md:block">
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {images.map((image) => (
                <div
                  key={image.key}
                  className="mb-4 transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.key}
                    width={500}
                    height={500}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </Masonry>
          </div>
        </>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.url}
              alt={selectedImage.key}
              width={800}
              height={800}
              className="object-contain max-h-[90vh] max-w-[90vw]"
              quality={100}
              priority
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Life;

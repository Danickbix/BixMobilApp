'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const carouselData = [
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop&crop=faces',
    title: 'Connect with your community',
    subtitle: 'Join thousands of users building meaningful connections'
  },
  {
    image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&h=1000&fit=crop&crop=center',
    title: 'Achieve your goals together',
    subtitle: 'Collaborate and grow with like-minded individuals'
  },
  {
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1000&fit=crop&crop=faces',
    title: 'Start your journey today',
    subtitle: 'Everything you need to succeed is just a click away'
  }
];

interface ImageCarouselProps {
  currentStep: number;
}

export function ImageCarousel({ currentStep }: ImageCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Change slide based on current form step
  useEffect(() => {
    if (currentStep > 0 && currentStep <= carouselData.length) {
      setActiveSlide(currentStep - 1);
    }
  }, [currentStep]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src={carouselData[activeSlide].image}
            alt={carouselData[activeSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="mb-4">{carouselData[activeSlide].title}</h2>
            <p className="text-white/80 max-w-md">{carouselData[activeSlide].subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="flex space-x-2 mt-8">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeSlide ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
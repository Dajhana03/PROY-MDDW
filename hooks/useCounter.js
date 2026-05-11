'use client';

import { useEffect, useRef } from 'react';

export function useCounter() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const counters = entry.target.querySelectorAll(
            '.stat-item h2, .benefit-stat-card h2'
          );

          counters.forEach((counter) => {
            if (counter.dataset.animated) return;
            counter.dataset.animated = 'true';

            const original  = counter.innerText;
            const numeric   = parseInt(original.replace(/\D/g, ''), 10);
            if (!numeric) return;

            let current = 0;
            const increment = numeric / (1600 / 16);

            const tick = () => {
              current += increment;
              if (current < numeric) {
                counter.innerText = original.replace(
                  /\d[\d,]*/,
                  Math.floor(current)
                );
                requestAnimationFrame(tick);
              } else {
                counter.innerText = original;
              }
            };

            tick();
          });
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

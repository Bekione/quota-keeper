"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";

export interface PickerItemOption {
  value: string;
  label: string;
}

const CIRCLE_DEGREES = 360;
const WHEEL_ITEM_SIZE = 32;
const WHEEL_ITEM_COUNT = 18;
const WHEEL_ITEMS_IN_VIEW = 4;

const WHEEL_ITEM_RADIUS = CIRCLE_DEGREES / WHEEL_ITEM_COUNT;
const IN_VIEW_DEGREES = WHEEL_ITEM_RADIUS * WHEEL_ITEMS_IN_VIEW;
const WHEEL_RADIUS = Math.round(
  WHEEL_ITEM_SIZE / 2 / Math.tan(Math.PI / WHEEL_ITEM_COUNT)
);

const isInView = (wheelLocation: number, slidePosition: number): boolean =>
  Math.abs(wheelLocation - slidePosition) < IN_VIEW_DEGREES;

const setSlideStyles = (
  emblaApi: EmblaCarouselType,
  index: number,
  loop: boolean,
  slideCount: number,
  totalRadius: number
): void => {
  const slideNode = emblaApi.slideNodes()[index];
  if (!slideNode) return;

  const wheelLocation = emblaApi.scrollProgress() * totalRadius;
  const snapList = emblaApi.scrollSnapList();
  const positionDefault = (snapList[index] ?? 0) * totalRadius;
  const positionLoopStart = positionDefault + totalRadius;
  const positionLoopEnd = positionDefault - totalRadius;

  let inView = false;
  let angle = index * -WHEEL_ITEM_RADIUS;

  if (isInView(wheelLocation, positionDefault)) {
    inView = true;
  }

  if (loop && isInView(wheelLocation, positionLoopEnd)) {
    inView = true;
    angle = -CIRCLE_DEGREES + (slideCount - index) * WHEEL_ITEM_RADIUS;
  }

  if (loop && isInView(wheelLocation, positionLoopStart)) {
    inView = true;
    angle = -(totalRadius % CIRCLE_DEGREES) - index * WHEEL_ITEM_RADIUS;
  }

  if (inView) {
    slideNode.style.opacity = "1";
    slideNode.style.transform = `translateY(-${
      index * 100
    }%) rotateX(${angle}deg) translateZ(${WHEEL_RADIUS}px)`;
  } else {
    slideNode.style.opacity = "0";
    slideNode.style.transform = "none";
  }
};

const setContainerStyles = (
  emblaApi: EmblaCarouselType,
  wheelRotation: number
): void => {
  const container = emblaApi.containerNode();
  if (container) {
    container.style.transform = `translateZ(${WHEEL_RADIUS}px) rotateX(${wheelRotation}deg)`;
  }
};

interface IosWheelItemProps {
  items: PickerItemOption[];
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
  loop?: boolean;
  label?: string;
  perspective?: "left" | "right" | "center";
  flex?: string | number;
}

export function IosWheelItem({
  items,
  selectedIndex = 0,
  onSelectIndex,
  loop = false,
  label,
  perspective = "center",
  flex = 1,
}: IosWheelItemProps) {
  const slideCount = items.length;

  // Store initial index on mount so useEmblaCarousel options remain 100% stable
  // This prevents emblaApi.reInit() from being called on every parent state render
  const initialIndex = useRef(
    selectedIndex >= 0 && selectedIndex < slideCount ? selectedIndex : 0
  ).current;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    axis: "y",
    dragFree: true,
    containScroll: false,
    duration: 30,
    startIndex: initialIndex,
  });

  const rootNodeRef = useRef<HTMLDivElement>(null);
  const totalRadius = slideCount * WHEEL_ITEM_RADIUS;
  const rotationOffset = loop ? 0 : WHEEL_ITEM_RADIUS;

  // Prevents intermediate select events during programmatic scroll (e.g. preset pills)
  // from overriding the target date in parent state
  const isProgrammaticScroll = useRef(false);

  // Keep latest onSelectIndex in a ref so effects never re-bind and disrupt animations
  const onSelectRef = useRef(onSelectIndex);
  onSelectRef.current = onSelectIndex;

  const inactivateEmblaTransform = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    const { translate } = api.internalEngine();
    translate.clear();
    translate.toggleActive(false);
  }, []);

  const rotateWheel = useCallback(
    (api: EmblaCarouselType) => {
      const rotation = slideCount * WHEEL_ITEM_RADIUS - rotationOffset;
      const wheelRotation = rotation * api.scrollProgress();
      setContainerStyles(api, wheelRotation);
      api.slideNodes().forEach((_, index) => {
        setSlideStyles(api, index, loop, slideCount, totalRadius);
      });
    },
    [slideCount, rotationOffset, totalRadius, loop]
  );

  // Sync external selectedIndex changes (e.g. preset pills clicked)
  useEffect(() => {
    if (!emblaApi) return;
    if (selectedIndex < 0 || selectedIndex >= slideCount) return;

    if (emblaApi.selectedScrollSnap() !== selectedIndex) {
      isProgrammaticScroll.current = true;
      emblaApi.scrollTo(selectedIndex, false);
    }
  }, [emblaApi, selectedIndex, slideCount]);

  // Intercept mouse wheel events and apply smooth momentum physics
  useEffect(() => {
    const rootNode = rootNodeRef.current;
    if (!rootNode || !emblaApi) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const { scrollTo, scrollBody } = emblaApi.internalEngine();
      scrollBody.useBaseFriction().useBaseDuration();

      const steps = Math.min(4, Math.max(1, Math.round(Math.abs(e.deltaY) / 80)));
      const distance = -Math.sign(e.deltaY) * steps * WHEEL_ITEM_SIZE;
      scrollTo.distance(distance, true);
    };

    rootNode.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      rootNode.removeEventListener("wheel", onWheel);
    };
  }, [emblaApi]);

  // Embla event handlers (scroll, drag release, select, settle)
  useEffect(() => {
    if (!emblaApi) return;

    // Pointer up physics deceleration (matching official Embla iOS picker demo)
    const handlePointerUp = (api: EmblaCarouselType) => {
      const { scrollTo, target, location, scrollBody } = api.internalEngine();
      const displacement = target.get() - location.get();
      const factor = Math.abs(displacement) < WHEEL_ITEM_SIZE / 2.5 ? 10 : 0.1;
      const distance = displacement * factor;
      scrollBody.useBaseFriction().useBaseDuration();
      scrollTo.distance(distance, true);
    };

    const handleSelect = (api: EmblaCarouselType) => {
      if (isProgrammaticScroll.current) return;
      const snap = api.selectedScrollSnap();
      if (snap >= 0 && snap < slideCount) {
        onSelectRef.current?.(snap);
      }
    };

    const handleSettle = (api: EmblaCarouselType) => {
      isProgrammaticScroll.current = false;
      const snap = api.selectedScrollSnap();
      if (snap >= 0 && snap < slideCount) {
        onSelectRef.current?.(snap);
      }
    };

    emblaApi.on("pointerUp", handlePointerUp);
    emblaApi.on("scroll", rotateWheel);
    emblaApi.on("select", handleSelect);
    emblaApi.on("settle", handleSettle);

    emblaApi.on("reInit", (api) => {
      inactivateEmblaTransform(api);
      rotateWheel(api);
    });

    inactivateEmblaTransform(emblaApi);
    rotateWheel(emblaApi);

    return () => {
      emblaApi.off("pointerUp", handlePointerUp);
      emblaApi.off("scroll", rotateWheel);
      emblaApi.off("select", handleSelect);
      emblaApi.off("settle", handleSettle);
    };
  }, [emblaApi, inactivateEmblaTransform, rotateWheel, slideCount]);

  return (
    <div className="embla__ios-picker" style={{ flex }}>
      <div className="embla__ios-picker__scene" ref={rootNodeRef}>
        <div
          className={`embla__ios-picker__viewport embla__ios-picker__viewport--perspective-${perspective}`}
          ref={emblaRef}
        >
          <div className="embla__ios-picker__container">
            {items.map((item, index) => (
              <div
                className="embla__ios-picker__slide"
                key={index}
                onClick={() => {
                  if (emblaApi) {
                    isProgrammaticScroll.current = false;
                    emblaApi.scrollTo(index, false);
                  }
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {label && <div className="embla__ios-picker__label">{label}</div>}
    </div>
  );
}

declare namespace svelteHTML {
  interface HTMLAttributes<T extends EventTarget> {
    'on:pinch'?: (event: CustomEvent<{scale: number, center: {x: number, y: number}}>) => void;
    'on:pinchup'?: (event: CustomEvent<{event: PointerEvent, pointersCount: number}>) => void;
    'on:pinchdown'?: (event: CustomEvent<{event: PointerEvent, pointersCount: number}>) => void;
    'on:pinchmove'?: (event: CustomEvent<{event: PointerEvent, pointersCount: number}>) => void;
    'on:swipe'?: (event: CustomEvent<{direction: 'top' | 'right' | 'bottom' | 'left', target: T}>) => void;
    'on:tap'?: (event: CustomEvent<{x: number, y: number, target: T}>) => void;
    'on:tapup'?: (event: CustomEvent<{event: PointerEvent, pointersCount: number }>) => void;
    'on:tapdown'?: (event: CustomEvent<{event: PointerEvent, pointersCount: number}>) => void;
    'on:tapmove'?: (event: CustomEvent<{event: PointerEvent, pointersCount: number}>) => void;
    'on:everytap'?: (event: CustomEvent<{x: number, y: number, target: T}>) => void;
    'on:singletap'?: (event: CustomEvent<{x: number, y: number, target: T}>) => void;
    'on:multitap'?: (event: CustomEvent<{x: number, y: number, target: T}>) => void;
  }
}
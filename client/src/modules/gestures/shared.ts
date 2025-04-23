export const DEFAULT_DELAY: number = 300;
export const DEFAULT_MIN_SWIPE_DISTANCE: number = 60;
export const DEFAULT_TOLERANCE: number = 4;
export const DEFAULT_TOUCH_ACTION: TouchAction = 'none';

export type TouchAction =
  | 'auto'
  | 'none'
  | 'pan-x'
  | 'pan-left'
  | 'pan-right'
  | 'pan-y'
  | 'pan-up'
  | 'pan-down'
  | 'pinch-zoom'
  | 'manipulation'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type Composed = { composed: boolean };

export type BaseParams = Composed & {
  touchAction: TouchAction | TouchAction[],
};

export type SvelteAction = {
  update?: (parameters: any) => void,
  destroy?: () => void,
};

type ActionType = 'up' | 'down' | 'move';

export type PointerEventCallback<T> =
  | ((activeEvents: PointerEvent[], event: PointerEvent) => T)
  | null;

export type SubGestureFunctions = {
  onMove: PointerEventCallback<boolean>,
  onUp: PointerEventCallback<void>,
  onDown: PointerEventCallback<void>,
};

type PartialParameters<GestureParams> = Partial<GestureParams>;
type PartialParametersWithComposed<GestureParams> =
  PartialParameters<GestureParams> & Composed;

export type ParametersSwitch<GestureParams> =
  | PartialParameters<GestureParams>
  | PartialParametersWithComposed<GestureParams>
  | undefined;

export type GestureReturnType<GestureParams, R extends ParametersSwitch<GestureParams> | undefined> = R extends undefined
  ? SvelteAction
  : R extends PartialParametersWithComposed<GestureParams>
    ? SubGestureFunctions
    : R extends PartialParameters<GestureParams>
      ? SvelteAction
      : never;

export type Position = {x: number, y: number};

export function getCenterOfTwoPoints(element: HTMLElement, activeEvents: PointerEvent[]): Position {
  const {left, top}: DOMRect = element.getBoundingClientRect();

  return {
    x: Math.round((Math.min(activeEvents[0].clientX, activeEvents[1].clientX) + Math.abs(activeEvents[0].clientX - activeEvents[1].clientX) / 2) - left),
    y: Math.round((Math.min(activeEvents[0].clientY, activeEvents[1].clientY) + Math.abs(activeEvents[0].clientY - activeEvents[1].clientY) / 2) - top),
  };
}

export function setPointerControls(
  gestureName: string,
  element: HTMLElement,
  onMoveCallback: PointerEventCallback<boolean>,
  onDownCallback: PointerEventCallback<void>,
  onUpCallback: PointerEventCallback<void>,
  touchAction: TouchAction | TouchAction[] = DEFAULT_TOUCH_ACTION,
): {destroy: () => void} {
  element.style.touchAction = ensureArray(touchAction).join(' ');
  let activeEvents: PointerEvent[] = [];

  function handlePointerdown(event: PointerEvent): void {
    activeEvents.push(event);
    dispatch(element, gestureName, event, activeEvents, 'down');
    onDownCallback?.(activeEvents, event);

    const pointerId: number = event.pointerId;

    function onUp(e: PointerEvent): void {
      if (pointerId === e.pointerId) {
        activeEvents = removeEvent(e, activeEvents);

        if (!activeEvents.length) {
          removeEventHandlers();
        }

        dispatch(element, gestureName, e, activeEvents, 'up');
        onUpCallback?.(activeEvents, e);
      }
    }

    function removeEventHandlers(): void {
      removePointermoveHandler();
      removeLostpointercaptureHandler();
      removepointerupHandler();
      removepointerleaveHandler();
    }

    const removePointermoveHandler: () => void = addEventListener(
      element,
      'pointermove',
      (e: PointerEvent) => {
        activeEvents = activeEvents.map((activeEvent: PointerEvent) => {
          return e.pointerId === activeEvent.pointerId ? e : activeEvent;
        });
        dispatch(element, gestureName, e, activeEvents, 'move');
        onMoveCallback?.(activeEvents, e);
      },
    );

    const removeLostpointercaptureHandler: () => void = addEventListener(
      element,
      'lostpointercapture',
      (e: PointerEvent) => {
        onUp(e);
      },
    );

    const removepointerupHandler: () => void = addEventListener(
      element,
      'pointerup',
      (e: PointerEvent) => {
        onUp(e);
      },
    );
    const removepointerleaveHandler: () => void = addEventListener(
      element,
      'pointerleave',
      (e: PointerEvent) => {
        activeEvents = [];
        removeEventHandlers();
        dispatch(element, gestureName, e, activeEvents, 'up');
        onUpCallback?.(activeEvents, e);
      },
    );
  }

  const removePointerdownHandler: () => void = addEventListener(
    element,
    'pointerdown',
    handlePointerdown,
  );

  return {destroy: () => removePointerdownHandler()};
}

function ensureArray<T>(o: T | T[]): T[] {
  return Array.isArray(o) ? o : [o];
}

function dispatch(
  element: HTMLElement,
  gestureName: string,
  event: PointerEvent,
  activeEvents: PointerEvent[],
  actionType: ActionType,
): void {
  element.dispatchEvent(
    new CustomEvent(`${gestureName}${actionType}`, {
      detail: {
        event,
        pointersCount: activeEvents.length,
        target: event.target,
      },
    }),
  );
}

function removeEvent(event: PointerEvent, activeEvents: PointerEvent[]): PointerEvent[] {
  return activeEvents.filter((activeEvent: PointerEvent) => event.pointerId !== activeEvent.pointerId);
}

function addEventListener<T extends EventTarget, E extends Event>(target: T, event: string, handler: (this: T, evt: E) => void): () => void {
  target.addEventListener(event, handler as (evt: Event) => void);
  return () => target.removeEventListener(event, handler as (evt: Event) => void);
}
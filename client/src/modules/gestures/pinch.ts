import {
  type BaseParams,
  DEFAULT_TOUCH_ACTION,
  type GestureReturnType, getCenterOfTwoPoints,
  type ParametersSwitch,
  type Position, setPointerControls,
} from './shared';

function getPointersDistance(activeEvents: PointerEvent[]): number {
  return Math.hypot(
    activeEvents[0].clientX - activeEvents[1].clientX,
    activeEvents[0].clientY - activeEvents[1].clientY,
  );
}

export type PinchParameters = BaseParams;

export function pinch<R extends ParametersSwitch<PinchParameters> = undefined>(
  element: HTMLElement,
  inputParameters?: R,
): GestureReturnType<PinchParameters, R> {
  const parameters: PinchParameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    ...inputParameters,
  };

  const gestureName: string = 'pinch';

  let prevDistance: number | undefined;
  let initDistance: number = 0;
  let pinchCenter: Position;

  function onUp(activeEvents: PointerEvent[]): void {
    if (activeEvents.length === 1) {
      prevDistance = undefined;
    }
  }

  function onDown(activeEvents: PointerEvent[]): void {
    if (activeEvents.length === 2) {
      initDistance = getPointersDistance(activeEvents);
      pinchCenter = getCenterOfTwoPoints(element, activeEvents);
    }
  }

  function onMove(activeEvents: PointerEvent[]): boolean {
    if (activeEvents.length === 2) {
      const curDistance: number = getPointersDistance(activeEvents);

      if (prevDistance !== undefined && curDistance !== prevDistance) {
        const scale: number = curDistance / initDistance;
        element.dispatchEvent(new CustomEvent(gestureName, {detail: { scale, center: pinchCenter }}));
      }

      prevDistance = curDistance;
    }

    return false;
  }

  if (parameters.composed) {
    return { onMove, onDown, onUp: null } as unknown as GestureReturnType<PinchParameters, R>;
  }

  return setPointerControls(
    gestureName,
    element,
    onMove,
    onDown,
    onUp,
    parameters.touchAction,
  ) as GestureReturnType<PinchParameters, R>;
}
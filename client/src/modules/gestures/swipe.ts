import {
  type BaseParams,
  DEFAULT_DELAY,
  DEFAULT_MIN_SWIPE_DISTANCE,
  type GestureReturnType,
  type ParametersSwitch, setPointerControls,
} from './shared';

export type SwipeParameters = {
  delay?: number,
  minDistance?: number,
} & BaseParams;

export type Direction = 'top' | 'right' | 'bottom' | 'left';

export function swipe<R extends ParametersSwitch<SwipeParameters> = undefined>(
  node: HTMLElement,
  inputParameters?: R,
): GestureReturnType<SwipeParameters, R> {
  const parameters: SwipeParameters = {
    delay: DEFAULT_DELAY,
    minDistance: DEFAULT_MIN_SWIPE_DISTANCE,
    touchAction: 'auto',
    composed: false,
    ...inputParameters,
  };

  const gestureName: string = 'swipe';

  let startTime: number;
  let clientX: number;
  let clientY: number;
  let target: EventTarget | null;

  function onDown(activeEvents: PointerEvent[], event: PointerEvent): void {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();

    if (activeEvents.length === 1) {
      target = event.target;
    }
  }

  function onUp(activeEvents: PointerEvent[], event: PointerEvent): void {
    if (
      startTime &&
      event.type === 'pointerup' &&
      activeEvents.length === 0 &&
      Date.now() - startTime < parameters.delay
    ) {
      const x: number = event.clientX - clientX;
      const y: number = event.clientY - clientY;
      const absX: number = Math.abs(x);
      const absY: number = Math.abs(y);

      let direction: Direction;

      if (absX >= 2 * absY && absX > parameters.minDistance) {
        direction = x > 0 ? 'right' : 'left';
      } else if (absY >= 2 * absX && absY > parameters.minDistance) {
        direction = y > 0 ? 'bottom' : 'top';
      }

      if (direction) {
        node.dispatchEvent(new CustomEvent(gestureName, {detail: { direction, target }}));
      }
    }
  }

  if (parameters.composed) {
    return { onMove: null, onDown, onUp } as unknown as GestureReturnType<SwipeParameters, R>;
  }

  return setPointerControls(
    gestureName,
    node,
    null,
    onDown,
    onUp,
    parameters.touchAction,
  ) as GestureReturnType<SwipeParameters, R>;
}
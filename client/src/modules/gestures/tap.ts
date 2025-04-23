import {
  type BaseParams,
  DEFAULT_DELAY, DEFAULT_TOLERANCE,
  type GestureReturnType,
  type ParametersSwitch, type Position,
  setPointerControls,
} from './shared';

export type TapParameters = {
  delay?: number,
  tolerances?: Partial<Position>,
} & BaseParams;

type Tap = Position & {timestamp: number};

enum TAP_EVENT {
  EVERY = 'everytap',
  SINGLE = 'singletap',
  MULTIPLE = 'multitap',
}

let relativeTap: Tap;
let tapTimer: NodeJS.Timeout;

function withinTolerance(a: number, b: number, tolerance?: number): boolean {
  return tolerance ? Math.abs(a - b) < tolerance : true;
}

function dispatchTapEvent(eventName: string, event: PointerEvent, element: HTMLElement): void {
  const {left, top}: DOMRect = element.getBoundingClientRect();
  element.dispatchEvent(
    new CustomEvent(eventName, {
      detail: {
        x: Math.round(event.clientX - left),
        y: Math.round(event.clientY - top),
        target: event.target,
      },
    }),
  );
}

export function tap<R extends ParametersSwitch<TapParameters> = undefined>(element: HTMLElement, inputParameters?: R): GestureReturnType<TapParameters, R> {
  const parameters: TapParameters = {
    delay: DEFAULT_DELAY,
    tolerances: undefined,
    composed: false,
    touchAction: 'auto',
    ...inputParameters,
  };

  const gestureName: string = 'tap';
  const tap: Tap = {x: undefined, y: undefined, timestamp: undefined};

  function onUp(activeEvents: PointerEvent[], event: PointerEvent): void {
    if (activeEvents.length > 1) {
      return;
    }

    const timestamp: number = Date.now();

    if (
      withinTolerance(event.clientX, tap.x, DEFAULT_TOLERANCE) &&
      withinTolerance(event.clientY, tap.y, DEFAULT_TOLERANCE) &&
      timestamp - tap.timestamp < parameters.delay
    ) {
      if (undefined === tapTimer) {
        if (relativeTap) {
          relativeTap.timestamp = timestamp;
        }

        tapTimer = setTimeout(() => {
          dispatchTapEvent(TAP_EVENT.SINGLE, event, element);
          clearTimeout(tapTimer);
          tapTimer = undefined;
          relativeTap = undefined;
        }, parameters.delay);
      } else if (timestamp - relativeTap.timestamp < parameters.delay) {
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
          clearTimeout(tapTimer);
          tapTimer = undefined;
          relativeTap = undefined;
        }, parameters.delay);

        relativeTap.timestamp = timestamp;

        let result: boolean = true;

        if (parameters.tolerances) {
          const {x, y}: Partial<Position> = parameters.tolerances;
          result = withinTolerance(event.clientX, relativeTap.x, x) && withinTolerance(event.clientY, relativeTap.y, y);
        }

        if (result) {
          dispatchTapEvent(TAP_EVENT.MULTIPLE, event, element);
        }
      }

      dispatchTapEvent(TAP_EVENT.EVERY, event, element);
    }
  }

  function onDown(activeEvents: PointerEvent[], event: PointerEvent): void {
    if (activeEvents.length > 1) {
      if (tapTimer) {
        clearTimeout(tapTimer);
        tapTimer = undefined;
        relativeTap = undefined;
      }

      return;
    }

    tap.x = event.clientX;
    tap.y = event.clientY;
    tap.timestamp = Date.now();

    if (!relativeTap) {
      relativeTap = {...tap};
    }
  }

  if (parameters.composed) {
    return { onMove: null, onDown, onUp } as unknown as GestureReturnType<TapParameters, R>;
  }

  return setPointerControls(
    gestureName,
    element,
    null,
    onDown,
    onUp,
    parameters.touchAction,
  ) as GestureReturnType<TapParameters, R>;
}
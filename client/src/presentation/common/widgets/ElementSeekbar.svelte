<script lang="ts" context="module">
  export type Range = Record<'max' | 'min', number>;
</script>

<script lang="ts">
  import {KeyboardKey} from '../../../core/keyboard';
  import {keyboard} from '../../../core';
  import {onDestroy} from 'svelte';

  export {className as class};
  export let style: string = undefined;
  export let thumb: boolean = false;
  export let disabled: true | undefined = undefined;
  export let inactive: boolean = undefined;
  export let range: Range = {min: 0, max: 100};
  export let limits: Partial<Range> = undefined;
  export let value: number = 0;
  export let onValueChanged: (value: number) => void = undefined;
  export let onHover: (value: number) => void = undefined;
  export let onPressLeft: () => void = undefined;
  export let onPressRight: () => void = undefined;

  const pointAvailable: boolean = Boolean(window.PointerEvent);

  let div: HTMLDivElement;
  let pointer: HTMLDivElement;
  let className: string = '';
  let changing: boolean = false;
  let tempValue: number;
  let hovered: boolean = false;
  let focused: boolean = false;
  let clientWidth: number;

  $: percent = normalizeValue(((changing ? tempValue : value) - range.min) / (range.max - range.min)) * 100;
  $: pointerRect = pointer && clientWidth ? pointer.getBoundingClientRect() : undefined;

  function calcValue(x: number): number {
    return normalizeValue((x - (pointerRect.x ?? pointerRect.left)) / pointerRect.width) * (range.max - range.min) + range.min;
  }

  function getValueWithingRange(value: number): number {
    if (limits) {
      return Math.max(range.min, limits.min, Math.min(value, range.max, limits.max));
    } else {
      return Math.max(range.min, Math.min(value, range.max));
    }
  }

  function normalizeValue(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value;
  }

  function isHovered(x: number, y: number): boolean {
    return x > pointerRect.x && x < pointerRect.x + pointerRect.width && y > pointerRect.y && y < pointerRect.y + pointerRect.height;
  }

  function onPointerEnter(): void {
    if (!disabled) {
      hovered = true;
    }
  }

  function onPointerMove({clientX}: MouseEvent): void {
    if (changing) {
      tempValue = getValueWithingRange(calcValue(clientX));

      if (onHover) {
        onHover(tempValue);
      }
    } else if (!disabled && onHover) {
      onHover(getValueWithingRange(calcValue(clientX)));
    }
  }

  function onPointerDown(): void {
    if (!disabled) {
      changing = true;
      window.addEventListener(pointAvailable ? 'pointermove' : 'mousemove', onPointerMove);
      window.addEventListener(pointAvailable ? 'pointerup' : 'mouseup', onPointerUp);
    }
  }

  function onPointerUp({clientX, clientY}: MouseEvent): void {
    if (disabled) {
      return;
    }

    if (changing) {
      changing = false;
      hovered = isHovered(clientX, clientY);

      if (!hovered) {
        onHover(undefined);
      }

      mouseUnsubscribe();
    }

    if (onValueChanged) {
      const newValue = getValueWithingRange(calcValue(clientX));

      if (value != newValue) {
        value = newValue;
        onValueChanged(newValue);
      }
    }
  }

  function onPointerLeave(): void {
    hovered = changing;

    if (!disabled && !hovered) {
      onHover(undefined);
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    switch (keyboard.getKey(event)) {
      case KeyboardKey.RIGHT:
      case KeyboardKey.FORWARD:
        if (onPressRight) {
          onPressRight();
          break;
        } else {
          return;
        }
      case KeyboardKey.LEFT:
      case KeyboardKey.BACKWARD:
        if (onPressLeft) {
          onPressLeft();
          break;
        } else {
          return;
        }
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function onFocus(): void {
    focused = true;
  }

  function onBlur(): void {
    focused = false;
  }

  function mouseUnsubscribe(): void {
    window.removeEventListener(pointAvailable ? 'pointermove' : 'mousemove', onPointerMove);
    window.removeEventListener(pointAvailable ? 'pointerup' : 'mouseup', onPointerUp);
  }

  export function getRect(): DOMRect {
    if (div) {
      return div.getBoundingClientRect();
    }
  }

  export function focus(): void {
    if (!disabled) {
      pointer.focus();
    }
  }

  onDestroy(() => mouseUnsubscribe());
</script>

<div bind:this={div} {style} class="seekbar {className}" class:hovered>
  <div class="bar" class:hovered class:focused class:inactive style:width="{percent}%" {disabled}>
    {#if thumb && !disabled}<div class="thumb" class:hovered class:focused class:inactive />{/if}
  </div>
  <div
    role="slider"
    aria-valuenow={percent}
    tabindex="-1"
    {disabled}
    bind:this={pointer}
    bind:clientWidth
    class="pointer focusable"
    on:mouseenter={pointAvailable ? undefined : onPointerEnter}
    on:pointerenter={pointAvailable ? onPointerEnter : undefined}
    on:mousemove={pointAvailable ? undefined : changing ? undefined : onPointerMove}
    on:pointermove={pointAvailable ? (changing ? undefined : onPointerMove) : undefined}
    on:mousedown={pointAvailable ? undefined : onPointerDown}
    on:pointerdown={pointAvailable ? onPointerDown : undefined}
    on:mouseup={pointAvailable ? undefined : onPointerUp}
    on:pointerup={pointAvailable ? onPointerUp : undefined}
    on:mouseleave={pointAvailable ? undefined : onPointerLeave}
    on:pointerleave={pointAvailable ? onPointerLeave : undefined}
    on:focus={onFocus}
    on:blur={onBlur}
    on:keydown={onKeyDown} />
</div>

<style lang="less">
  .seekbar {
    position: relative;
    width: 100%;
    height: 4px;
    background-color: #9a9a9a;
    border-radius: 4px;
  }
  .bar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    border-radius: 4px;
    pointer-events: none;
  }
  .thumb {
    position: absolute;
    right: -8px;
    height: 16px;
    width: 16px;
    border-radius: 100%;
    pointer-events: none;
    -webkit-touch-callout: none;
  }
  .pointer {
    position: absolute;
    width: 100%;
    height: 600%;
    top: -250%;
    user-select: none;
    touch-action: none;
    -webkit-touch-callout: none;
  }
</style>

<script lang="ts" context="module">
  export interface IFakeFocus {
    onKeyUp?: () => boolean;
    onKeyDown?: () => boolean;
    onKeyLeft?: () => boolean;
    onKeyRight?: () => boolean;
    onKeysBack?: () => boolean;
    onKeyEnter?: () => boolean;
    onKeyTab?: () => boolean;
    onOtherKeys?: (event: KeyboardEvent) => boolean;
    onElementClick?: (event: MouseEvent) => boolean;
    onFocus?: () => void;
    onBlur?: () => void;
  }
</script>

<script lang="ts">
  import nav from '../../../modules/spatial-navigation';
  import type {INavSection} from '../../../modules/spatial-navigation';
  import {KeyboardKey} from '../../../core/keyboard';
  import {keyboard} from '../../../core';
  import {onDestroy} from 'svelte';

  export {className as class};
  export let style: string = undefined;
  export let id: string = undefined;
  export let target: IFakeFocus;
  export let disabled: boolean = undefined;
  export let defaultFocus: boolean = false;
  export let focusSelector: string = 'focusable';

  let className: string = '';

  let ref: HTMLDivElement;
  let navSection: INavSection;

  export function getDivRef(): HTMLDivElement {
    return ref;
  }

  function onClick(event: MouseEvent): void {
    if (target) {
      if (target.onElementClick) {
        if (!target.onElementClick(event)) {
          event.preventDefault();
          event.stopPropagation();
        }

        return;
      }

      if (target.onKeyEnter) {
        if (!target.onKeyEnter()) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!keyHandler(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function keyHandler(event: KeyboardEvent): boolean {
    if (target) {
      switch (keyboard.getKey(event)) {
        case KeyboardKey.UP:
          return target.onKeyUp?.();
        case KeyboardKey.DOWN:
          return target.onKeyDown?.();
        case KeyboardKey.LEFT:
          return target.onKeyLeft?.();
        case KeyboardKey.RIGHT:
          return target.onKeyRight?.();
        case KeyboardKey.ENTER:
          return target.onKeyEnter?.();
        case KeyboardKey.ESC:
        case KeyboardKey.BACKSPACE:
          return target.onKeysBack?.() ?? true;
        case KeyboardKey.TAB:
          return target.onKeyTab?.();
        default:
          return target.onOtherKeys?.(event) ?? true;
      }
    }

    return true;
  }

  function onFocus(): void {
    target.onFocus?.();
  }

  function onBlur(): void {
    target.onBlur?.();
  }

  function onMouseDown(event: MouseEvent): void {
    if (disabled) {
      event.preventDefault();
    }
  }

  $: if (ref && disabled) {
    ref.blur();
    disable();
  } else if (ref) {
    enable();
  }

  $: if (id) {
    if (navSection && navSection.getId() !== id) {
      nav.removeSection(navSection);
    } else {
      navSection = nav.addSection({priority: 'last-focused', selector: `.focus-interceptor-${id}`}, id);
      navSection.makeFocusable();
    }
  }

  export function disable(): void {
    navSection?.disable();
  }

  export function enable(): void {
    navSection?.enable();
  }

  export function focus(): void {
    window.requestAnimationFrame(() => {
      if (!ref) {
        return;
      }

      /**
       * Hotfix focus from Chrome < 69
       */
      const transform: string = ref.style.transform;
      const top: string = ref.style.top;

      if (transform) {
        ref.style.transform = 'translate(0px, 0px)';
      }

      if (top) {
        ref.style.top = '0px';
      }

      ref.focus();

      if (transform) {
        ref.style.transform = transform;
      }

      if (top) {
        ref.style.top = top;
      }
    });
  }

  export function isFocused(): boolean {
    return window.document.activeElement === ref;
  }

  export function setEnable(value: boolean): void {
    if (value) {
      enable();
    } else {
      disable();
    }
  }

  onDestroy(() => {
    // if (navSection) {
    //   window.$nav.removeSection(navSection);
    // }
  });
</script>

<div
  {style}
  disabled={disabled || undefined}
  tabindex="-1"
  role="button"
  aria-roledescription="focus interceptor"
  class="{disabled ? '' : focusSelector} {id ? `focus-interceptor-${id}` : ''} {className}"
  class:default-focus={defaultFocus}
  on:click={disabled ? undefined : onClick}
  on:keydown={disabled ? undefined : onKeyDown}
  on:focus={onFocus}
  on:blur={onBlur}
  on:mousedown={onMouseDown}
  bind:this={ref}>
  <slot />
</div>

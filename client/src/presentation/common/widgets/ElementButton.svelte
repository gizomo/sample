<script lang="ts">
  import keyboard, {KeyboardKey} from '../../../core/keyboard';
  import nav from '../../../modules/spatial-navigation';

  export {className as class};
  export let style: string = undefined;
  export let onPress: () => void;
  export let onFocus: () => void = undefined;
  export let onBlur: () => void = undefined;
  export let onDisable: () => void = undefined;
  export let disabled: boolean = undefined;
  export let defaultFocus: boolean = false;
  export let focusSelector: string = 'focusable';
  export let blurUpDisabled: boolean = false;
  export let blurDownDisabled: boolean = false;
  export let blurLeftDisabled: boolean = false;
  export let blurRightDisabled: boolean = false;

  let className: string = '';
  let ref: HTMLDivElement;

  $: if (ref && disabled) {
    if (onDisable && window.document.activeElement === ref) {
      onDisable();
    }

    ref.blur();
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (keyboard.getKey(event)) {
      case KeyboardKey.ENTER:
        onPress();
        break;
      case KeyboardKey.TAB:
        if (!nav.move('down')) {
          nav.getLastSection().focus();
        }
        break;
      case KeyboardKey.UP:
        if (blurUpDisabled) {
          break;
        }

        return;
      case KeyboardKey.DOWN:
        if (blurDownDisabled) {
          break;
        }

        return;
      case KeyboardKey.LEFT:
        if (blurLeftDisabled) {
          break;
        }

        return;
      case KeyboardKey.RIGHT:
        if (blurRightDisabled) {
          break;
        }

        return;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function noop(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  export function getRef(): HTMLDivElement {
    return ref;
  }
</script>

<div
  {style}
  disabled={disabled || undefined}
  tabindex={focusSelector ? -1 : undefined}
  role="button"
  aria-roledescription="fake button"
  class="{disabled ? '' : focusSelector} {className}"
  class:default-focus={defaultFocus}
  on:click={disabled ? undefined : onPress}
  on:keydown={disabled ? undefined : onKeyDown}
  on:pointerup={noop}
  on:pointerdown={noop}
  on:focus={disabled ? undefined : onFocus}
  on:blur={disabled ? undefined : onBlur}
  bind:this={ref}>
  <slot />
</div>

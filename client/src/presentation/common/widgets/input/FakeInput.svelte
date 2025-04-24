<script lang="ts" context="module">
  const ctx: CanvasRenderingContext2D = window.document.createElement('canvas').getContext('2d');
</script>

<script lang="ts">
  import nav from '../../../../modules/spatial-navigation';
  import type {PayloadType, SubscribeType} from '../../../../utils/bind-values';
  import {BindValuesEvents} from '../../../../utils/bind-values';
  import {KeyboardKey} from '../../../../core/keyboard';
  import {keyboard} from '../../../../core';
  import {onDestroy, onMount, tick} from 'svelte';

  export {className as class};
  export let style: string = undefined;
  export let type: string = undefined;
  export let bindValues: SubscribeType = undefined;
  export let placeholder: string = undefined;
  export let active: boolean = undefined;
  export let secured: boolean = undefined;
  export let invalid: boolean = undefined;
  export let disabled: boolean = undefined;
  export let defaultFocus: boolean = false;
  export let focusSelector: string = 'focusable';
  export let onFocus: () => void = undefined;
  export let onBlur: () => void = undefined;
  export let onChange: (inputText: string) => void = undefined;
  export let onPress: () => void = undefined;

  let ref: HTMLDivElement;
  let className: string = '';
  let inputText: string = getText(bindValues.instance.get(bindValues.field), '');
  let inputWidth: number;
  let isOverflow: boolean = false;

  $: text = getText(bindValues.instance.get(bindValues.field), inputText);

  $: if (ref) {
    const style: CSSStyleDeclaration = getComputedStyle(ref);
    const fontFamily: string = style.getPropertyValue('font-family');
    const fontSize: number = parseFloat(style.getPropertyValue('font-size'));
    ctx.font = `${fontSize}px ${fontFamily}`;
    inputWidth =
      parseFloat(style.width) -
      (parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth) + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight));

    checkOverflow();
  }

  function getText(value: any, inputText: string): string {
    if (!value && !inputText) {
      return (inputText = '');
    } else if (inputText) {
      return inputText;
    } else {
      return 'string' === typeof value ? value : value.toString();
    }
  }

  function onBindValuesFieldChange(_event: string, {field, value}: PayloadType): void {
    if (bindValues.field === field) {
      inputText = value;
      onChange && onChange(inputText);
      tick().then(checkOverflow);
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    const key: KeyboardKey = keyboard.getKey(event);

    if (key.length > 1) {
      switch (key) {
        case KeyboardKey.ENTER:
          onPress && onPress();
          break;
        case KeyboardKey.BACKSPACE:
          update(undefined);
          break;
        case KeyboardKey.TAB:
          if (!nav.move('down')) {
            nav.getLastSection().focus();
          }

          break;
        default:
          return;
      }

      event.preventDefault();
      event.stopPropagation();
    } else {
      update(key);
    }
  }

  function checkOverflow(): void {
    isOverflow = ctx.measureText(text).width > inputWidth;
  }

  export function getRef(): HTMLDivElement {
    return ref;
  }

  export function focus(): void {
    ref.focus();
  }

  export function clear(): void {
    if (!bindValues.instance.isProcessed()) {
      bindValues.instance.set(bindValues.field, '');
    }
  }

  export function update(char: string | undefined): void {
    if (!bindValues.instance.isProcessed()) {
      bindValues.instance.set(bindValues.field, char ? text + char : text.slice(0, -1));
    }
  }

  onMount(() => bindValues.instance.on(BindValuesEvents.CHANGE, onBindValuesFieldChange));
  onDestroy(() => bindValues.instance.off(BindValuesEvents.CHANGE, onBindValuesFieldChange));
</script>

<div
  disabled={disabled || undefined}
  invalid={invalid || undefined}
  tabindex="-1"
  role="textbox"
  aria-roledescription="fake input"
  {type}
  {style}
  class="{disabled ? '' : focusSelector} {className}"
  class:caret-before={Boolean(text) && isOverflow && !$$slots.formatter}
  class:caret-after={Boolean(text) && !isOverflow && !$$slots.formatter}
  class:overflown={isOverflow && !$$slots.formatter}
  class:ellipsis={isOverflow && !$$slots.formatter}
  class:default-focus={defaultFocus}
  class:active
  on:focus={disabled ? undefined : onFocus}
  on:blur={disabled ? undefined : onBlur}
  on:keydown={disabled ? undefined : onKeyDown}
  bind:this={ref}>
  <slot name="formatter" {text}>
    {#if Boolean(text)}
      {#if secured}
        {#each text as char}<slot name="secure-dot">*</slot>{/each}
      {:else}
        {text}
      {/if}
    {:else if Boolean(placeholder)}
      {placeholder ?? ''}
    {:else}
      <slot name="placeholder" />
    {/if}
  </slot>
</div>

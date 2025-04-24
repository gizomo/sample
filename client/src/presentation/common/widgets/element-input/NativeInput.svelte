<script lang="ts">
  import type {PayloadType, SubscribeType} from '../../../../utils/bind-values';
  import {BindValuesEvents} from '../../../../utils/bind-values';
  import {KeyboardKey} from '../../../../core/keyboard';
  import {keyboard} from '../../../../core';
  import {onDestroy, onMount} from 'svelte';

  export {className as class};
  export let style: string = undefined;
  export let bindValues: SubscribeType = undefined;
  export let type: 'text' | 'password' | 'tel' | 'email' | 'number' = 'text';
  export let inputMode: 'text' | 'decimal' | 'tel' | 'email' = 'text';
  export let placeholder: string = undefined;
  export let secured: boolean = undefined;
  export let invalid: boolean = undefined;
  export let disabled: boolean = undefined;
  export let lines: number = undefined;

  export let valueFormatter: (text: string) => string = undefined;
  export let onChange: (textInput: string) => void = undefined;
  export let onPress: () => void = undefined;
  export let onFocus: () => void = undefined;

  let input: HTMLInputElement | HTMLTextAreaElement;
  let className: string = '';
  let value: string = bindValues?.instance.get(bindValues.field)?.toString() || '';

  $: if (input && 'tel' === type) {
    value = valueFormatter ? valueFormatter(value) : value;
    input.value = value;
  }

  function onBindValuesFieldChange(_event: string, {field, value: bindValue}: PayloadType): void {
    if (bindValues.field === field) {
      value = valueFormatter ? valueFormatter(bindValue) : bindValue;
      input.value = value;
      onChange && onChange(value);
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
          break;
        default:
          return;
      }

      event.stopPropagation();
    }
  }

  function onChanged(event: any): void {
    const text: string = (event.target as HTMLInputElement)?.value ?? '';

    if (bindValues) {
      update(text);
    } else if (onChange) {
      onChange(text);
    }
  }

  export function clear(): void {
    if (bindValues && !bindValues.instance.isProcessed()) {
      bindValues.instance.set(bindValues.field, '');
    } else {
      input.value = '';
    }
  }

  export function update(text: string | undefined): void {
    if (bindValues && !bindValues.instance.isProcessed() && bindValues.instance.get(bindValues.field) !== text) {
      bindValues.instance.set(bindValues.field, text);
    }
  }

  export function focus(): void {
    input.focus();
  }

  onMount(() => bindValues?.instance.on(BindValuesEvents.CHANGE, onBindValuesFieldChange));
  onDestroy(() => bindValues?.instance.off(BindValuesEvents.CHANGE, onBindValuesFieldChange));
</script>

{#if Boolean(lines) && lines > 1}
  <textarea
    bind:this={input}
    {style}
    {placeholder}
    class={className}
    disabled={disabled || undefined}
    invalid={invalid || undefined}
    type={secured ? 'password' : type}
    inputmode={inputMode}
    {value}
    rows={lines}
    autocapitalize="sentences"
    autocomplete="on"
    dir="auto"
    spellcheck="true"
    on:input={onChanged}
    on:focus={onFocus}
    on:keydown={disabled ? undefined : onKeyDown} />
{:else}
  <input
    bind:this={input}
    {style}
    {placeholder}
    class={className}
    disabled={disabled || undefined}
    invalid={invalid || undefined}
    type={secured ? 'password' : type}
    inputmode={inputMode}
    {value}
    autocapitalize="sentences"
    autocomplete="on"
    dir="auto"
    spellcheck="true"
    on:input={onChanged}
    on:focus={onFocus}
    on:keydown={disabled ? undefined : onKeyDown} />
{/if}

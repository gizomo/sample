<script lang="ts">
  import BackLoader from '../widgets/spinners/BackLoader.svelte';
  import ElementButton from '../widgets/ElementButton.svelte';

  export {className as class};
  export let style: string = undefined;
  export let onPress: () => void | Promise<any>;
  export let onFocus: (target: HTMLDivElement) => void = undefined;
  export let disabled: true | undefined = undefined;
  export let defaultFocus: boolean = false;
  export let focusSelector: string = undefined;
  export let blurUpDisabled: boolean = false;
  export let blurDownDisabled: boolean = false;
  export let blurLeftDisabled: boolean = false;
  export let blurRightDisabled: boolean = false;

  let className: string = '';
  let loading: boolean = false;
  let elementButton: ElementButton;

  function onButtonFocus(): void {
    onFocus && onFocus(elementButton.getRef());
  }

  export function focus(): void {
    elementButton?.getRef().focus();
  }

  export function onButtonPress(): void | Promise<any> {
    const promise: void | Promise<any> = onPress();

    if ('object' === typeof promise && 'then' in promise) {
      loading = true;
      const onFulfilled: (value?: any) => void = (value?: void) => {
        loading = false;
        return Promise.resolve(value);
      };
      const onRejected: (value?: any) => void = (value?: void) => {
        loading = false;
        return Promise.reject(value);
      };

      return promise.then(onFulfilled, onRejected);
    }
  }
</script>

<ElementButton
  bind:this={elementButton}
  {style}
  class="button ellipsis {className}"
  onPress={onButtonPress}
  onFocus={onButtonFocus}
  disabled={loading ? undefined : disabled}
  {defaultFocus}
  {focusSelector}
  {blurUpDisabled}
  {blurDownDisabled}
  {blurLeftDisabled}
  {blurRightDisabled}>
  {#if loading}
    <BackLoader style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;" />
  {/if}
  <slot />
</ElementButton>

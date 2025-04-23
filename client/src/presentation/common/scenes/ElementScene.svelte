<script lang="ts">
  export {className as class};
  export let style: string = undefined;
  export let onFocus: () => void = undefined;
  export let onScroll: (position: number) => void = undefined;

  let className: string = '';
  let handling: boolean = false;
  let div: HTMLDivElement;

  function onScrollEvent(event: Event): void {
    if (handling) {
      return;
    }

    handling = true;

    window.requestAnimationFrame(() => {
      if (event && onScroll) {
        onScroll((event.target as HTMLDivElement).scrollTop);
        handling = false;
      }
    });
  }

  export function getScrollPosition(): number {
    return div?.scrollTop ?? 0;
  }

  export function scrollTo(position: number, animated: boolean = false): void {
    div.scrollTo({top: position, behavior: animated ? 'smooth' : 'instant'});
  }
</script>

<div bind:this={div} {style} tabindex="-1" class="scene {className || ''}" on:focus={onFocus} on:scroll={onScroll && onScrollEvent}>
  <slot />
</div>

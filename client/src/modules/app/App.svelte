<script lang="ts">
  import {onMount} from 'svelte';
  import Stack from '../scenes-stack/Stack.svelte';
  import type {Scenes, StackItem} from '../scenes-stack/types';

  export let scenes: Scenes;
  export let start: string;
  export let onFocus: (target: StackItem) => void;
  export let onBlur: (target: StackItem) => void;
  export let onAppMount: (stack: Stack) => void;

  let stack: Stack;

  onMount(() => onAppMount(stack));
</script>

<Stack bind:this={stack} {scenes} {start} {onFocus} {onBlur} />

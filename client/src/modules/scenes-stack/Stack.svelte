<script lang="ts">
  import Queue from '../../utils/queue';
  import type {Scenes, StackContext, StackItem, StackLifecycleHooks, StackRoute, SvelteComponentConstructor} from './types';
  import {derived, writable, type Readable, type Writable} from 'svelte/store';
  import {onMount, tick, type SvelteComponent} from 'svelte';

  export const navigatorContextKey: string = URL.createObjectURL(new Blob()).slice(-36);
  export const stack: Writable<StackItem[]> = writable<StackItem[]>([]);
  export const navigating: Writable<boolean> = writable(false);
  export const canGoBack: Readable<boolean> = derived(stack, (stack: StackItem[]) => stack.length > 1);
  export const context: StackContext = {
    navigate,
    back,
    replace,
    reset,
    clear,
    setBeforeNavigate,
    setAfterNavigate,
    canGoBack,
    stack,
    navigating,
  };

  export let scenes: Scenes;
  export let start: string;
  export let onFocus: (target: StackItem) => void = undefined;
  export let onBlur: (target: StackItem) => void = undefined;
  export let onError: (error: Error) => void = undefined;

  const queue: Queue<unknown> = new Queue();
  const lifecycleHooks: StackLifecycleHooks = {beforeNavigate: [], afterNavigate: []};

  let ref: HTMLDivElement;

  function getFrontItem(): StackItem {
    return $stack[$stack.length - 1];
  }

  function getPrevItem(): StackItem {
    return $stack[$stack.length - 2];
  }

  function createMountPoint(key: string): HTMLDivElement {
    const mountPoint: HTMLDivElement = window.document.createElement('div');
    mountPoint.classList.add('stack-mount-point', key);

    ref.appendChild(mountPoint);

    return mountPoint;
  }

  function createSceneComponent<TProps extends Record<string, unknown>>(
    target: HTMLDivElement,
    component: SvelteComponentConstructor<TProps>,
    props?: TProps,
  ): SvelteComponent {
    return new component({
      target,
      props,
      context: new Map<string, StackContext>([[navigatorContextKey, context]]),
    });
  }

  function createStackItem<TProps extends Record<string, unknown>>({route, props}: StackRoute<TProps>): StackItem {
    const key: string = `${route}-${new Date().getTime()}`;
    const mountPoint: HTMLDivElement = createMountPoint(key);
    const instance: SvelteComponent = createSceneComponent(mountPoint, scenes[route], props);

    return {key, route, mountPoint, instance};
  }

  function disposeStackItem(item: StackItem): void {
    item.instance.$destroy();
    ref.removeChild(item.mountPoint);
  }

  async function dispatchError(error: any): Promise<any> {
    onError && onError(error);
    return Promise.reject(error);
  }

  async function startNavigate(item?: StackItem): Promise<void> {
    if (lifecycleHooks.beforeNavigate?.length) {
      for (const cb of lifecycleHooks.beforeNavigate) {
        try {
          await cb();
        } catch (err) {
          await dispatchError(err);
        }
      }
    }

    $navigating = true;

    if (item && onBlur) {
      onBlur(item);
    }
  }

  async function endNavigate(item?: StackItem): Promise<void> {
    if (item && onFocus) {
      onFocus(item);
    }

    $navigating = false;

    if (lifecycleHooks.afterNavigate?.length) {
      for (const cb of lifecycleHooks.afterNavigate) {
        try {
          await cb();
        } catch (err) {
          await dispatchError(err);
        }
      }
    }
  }

  async function updateDOM(): Promise<void> {
    await new Promise((resolve: any) => {
      if ($stack.length) {
        const frontItem: StackItem = getFrontItem();
        const prevItem: StackItem = getPrevItem();

        frontItem.mountPoint.style.display = 'block';

        if (prevItem) {
          prevItem.mountPoint.style.display = 'none';
        }

        window.requestAnimationFrame(resolve);
      } else {
        resolve();
      }
    });
  }

  export async function navigate<TProps extends Record<string, unknown>>(route: StackRoute<TProps>): Promise<void> {
    await queue.run(async () => {
      if (!ref) {
        await dispatchError(new Error('Navigation stack is not mounted'));
      }

      await startNavigate(getFrontItem());

      const item: StackItem = createStackItem(route);

      await tick();

      stack.update((stack: StackItem[]) => [...stack, item]);

      await updateDOM();

      await endNavigate(getFrontItem());
    });
  }

  export async function back(): Promise<void> {
    await queue.run(async () => {
      if (!ref) {
        await dispatchError(new Error('Navigation stack is not mounted'));
      }

      if (!$canGoBack) {
        await dispatchError(new Error(`Cannot go back, stack size is ${$stack.length}`));
      }

      const frontItem: StackItem = getFrontItem();
      const prevItem: StackItem = getPrevItem();

      await startNavigate(frontItem);

      disposeStackItem(frontItem);

      await tick();

      stack.update((stack: StackItem[]) => stack.slice(0, -1));

      await updateDOM();

      await endNavigate(prevItem);
    });
  }

  export async function replace<TProps extends Record<string, unknown>>(route: StackRoute<TProps>): Promise<void> {
    await queue.run(async () => {
      if (!ref) {
        await dispatchError(new Error('Navigation stack is not mounted'));
      }

      const frontItem: StackItem = getFrontItem();

      await startNavigate(frontItem);

      disposeStackItem(frontItem);

      const item: StackItem = createStackItem(route);

      await tick();

      stack.update((stack: StackItem[]) => [...stack.slice(0, -1), item]);

      await updateDOM();

      await endNavigate(getFrontItem());
    });
  }

  export async function reset<TProps extends Record<string, unknown>>(route: StackRoute<TProps>): Promise<void> {
    await queue.run(async () => {
      if (!ref) {
        await dispatchError(new Error('Navigation stack is not mounted'));
      }

      await startNavigate(getFrontItem());

      $stack.forEach((item: StackItem) => disposeStackItem(item));

      const item: StackItem = createStackItem(route);

      await tick();

      stack.set([item]);

      await updateDOM();

      await endNavigate($stack[0]);
    });
  }

  export async function clear(): Promise<void> {
    await queue.run(async () => {
      if (!ref) {
        await dispatchError(new Error('Navigation stack is not mounted'));
      }

      await startNavigate();

      $stack.forEach((item: StackItem, index: number, array: StackItem[]) => {
        if (array.length - 1 !== index) {
          disposeStackItem(item);
        }
      });

      await tick();

      stack.set([getFrontItem()]);

      await updateDOM();

      await endNavigate();
    });
  }

  export function setBeforeNavigate(hook: () => unknown | Promise<unknown>): void {
    if ($navigating) {
      const error: Error = new Error('Lifecycle hooks setting ignored, they can only be attached during component initialization.');
      onError && onError(error);
    } else {
      lifecycleHooks.beforeNavigate.push(hook);
    }
  }

  export function setAfterNavigate(hook: () => unknown | Promise<unknown>): void {
    if ($navigating) {
      const error: Error = new Error('Lifecycle hooks setting ignored, they can only be attached during component initialization.');
      onError && onError(error);
    } else {
      lifecycleHooks.afterNavigate.push(hook);
    }
  }

  onMount(() => {
    if (!ref) {
      const error: Error = new Error('Navigation stack is not mounted');
      onError && onError(error);
      throw error;
    }

    navigate({route: start});
  });
</script>

<div bind:this={ref} class="stack" />

<style lang="less">
  .stack {
    display: block;
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
    z-index: 1;
  }
  :global(.stack-mount-point) {
    display: block;
    position: absolute;
    height: 100%;
    width: 100%;
    outline: none;
    overflow: hidden;
    z-index: 1;
  }
</style>

import type {SvelteComponent} from 'svelte';
import type {Readable, Writable} from 'svelte/store';

export type SvelteComponentConstructor<TProps extends Record<string, unknown> = Record<string, unknown>> = new (params: {
  target: HTMLElement;
  context: Map<string, unknown>;
  props: TProps;
}) => SvelteComponent<TProps>;

export type Scenes = Record<string, SvelteComponentConstructor>;

export type StackItem<T = unknown> = {
  key: string;
  route: string;
  instance: SvelteComponent & T;
  mountPoint: HTMLDivElement;
};

export type StackLifecycleHooks = {
  beforeNavigate: (() => unknown | Promise<unknown>)[];
  afterNavigate: (() => unknown | Promise<unknown>)[];
};

export type StackRoute<TProps> = {route: string; props?: TProps};

export type StackContext<T = unknown> = {
  /** Actual navigation stack */
  stack: Writable<StackItem<T>[]>;

  /** Navigation process indicator. */
  navigating: Readable<boolean>;

  /** Navigation possibility indicator of going back to previous scene */
  canGoBack: Readable<boolean>;

  /**
   * Opens a new scene, pushing it to the top of the stack and pausing the current one.
   * @param route
   */
  navigate<TProps extends Record<string, unknown>>(route: StackRoute<TProps>): Promise<void>;

  /** Goes to the previous scene. If the stack contains only one scene this function will throw. */
  back(): Promise<void>;

  /**
   * Opens a new scene by replacing the currently active one.
   * @param route
   */
  replace<TProps extends Record<string, unknown>>(route: StackRoute<TProps>): Promise<void>;

  /**
   * Opens a new scene and reset all stack
   * @param route
   */
  reset<TProps extends Record<string, unknown>>(route: StackRoute<TProps>): Promise<void>;

  /** Clear stack besides last Item. */
  clear(): Promise<void>;

  /**
   * Set lifecycle hooks to navigator which run before navigation process being started
   * If the beforeNavigation hook returns a Promise, the navigation will wait for it to resolve
   *
   * Lifecycle hooks can only be attached during component initialization. Otherwise, navigation throws an Error.
   *
   * @param hook
   */
  setBeforeNavigate(hook: () => unknown | Promise<unknown>): void;

  /**
   * Set lifecycle hooks to navigator which run after navigation process ended
   * If the afterNavigation hook returns a Promise, the navigation will end after resolving it
   *
   * Lifecycle hooks can only be attached during component initialization. Otherwise, navigation throws an Error.
   *
   * @param hook
   */
  setAfterNavigate(hook: () => unknown | Promise<unknown>): void;
};

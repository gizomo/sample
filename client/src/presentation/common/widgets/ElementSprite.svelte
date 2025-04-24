<script lang="ts" context="module">
  export interface Thumbs {
    rows: number;
    cols: number;
    duration: number;
    url: string;
    getSrc(params: {[key: string]: number}): string;
  }
</script>

<script lang="ts">
  export let height: number = 90;
  export let width: number = 160;
  export let thumbs: Thumbs;

  let src: string;
  let x: number = 0;
  let y: number = 0;

  $: thumbsCount = thumbs.cols * thumbs.rows;

  function load(url: string): Promise<string> {
    return new Promise((resolve: (value: string) => undefined) => {
      const tempImg: HTMLImageElement = new Image();
      tempImg.addEventListener('load', () => resolve(url));
      tempImg.src = url;
    });
  }

  export function update(positionMs: number): void {
    const position: number = Math.trunc(positionMs / 1000);

    if (1 === thumbsCount) {
      const rest: number = position % 4;
      const time: number = rest ? position - rest : position;

      load(thumbs.getSrc({time})).then((url: string) => (src = url));
    } else {
      const spriteNumber: number = Math.round(position / thumbs.duration);
      const index: number = Math.floor(spriteNumber / thumbsCount);
      const spriteIndex: number = spriteNumber - index * thumbsCount;

      load(thumbs.getSrc({index: index + 1})).then((url: string) => {
        src = url;
        x = -(spriteIndex % thumbs.cols) * width;
        y = -Math.floor(spriteIndex / thumbs.rows) * height;
      });
    }
  }
</script>

<div
  class="sprite"
  style:width="{width}px"
  style:height="{height}px"
  style:background-image="url({src})"
  style:background-size={1 === thumbsCount ? '100%' : `${width * thumbs.cols}px ${height * thumbs.rows}px`}
  style:background-position={1 === thumbsCount ? undefined : `${x}px, ${y}px`} />

<style lang="less">
  .sprite {
    position: relative;
    overflow: hidden;
    background-color: transparent;
    border-radius: 10px;
  }
</style>

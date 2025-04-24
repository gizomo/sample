<script lang="ts">
  export {className as class};
  export let style: string = undefined;
  export let min: number = 0;
  export let max: number = 100;
  export let value: number = 0;

  let className: string = '';

  function getProgressLineWidth(value: number, min?: number, max?: number): number {
    if (undefined !== value) {
      if (value > max) {
        return 100;
      }

      if (value >= min) {
        return (value - min) / (max - min) * 100;
      }
    }

    return 0;
  }

  $: progressLineStyle = `width: ${getProgressLineWidth(value, min, max)}%`;
</script>

<div class="progress {className}" {style}>
  <div class="progress-line" style={progressLineStyle}/>
</div>

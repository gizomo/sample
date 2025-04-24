<script lang="ts">
  export let style: string = undefined;
</script>

<div class="bar-loader" {style}>
  {#each [1, 2] as version}
    <div class="lines small-lines {version}"/>
  {/each}
</div>

<style lang="less">
  @import '../../../styles/colors';

  .bar-loader {
    position: relative;
    height: 4px;
    overflow: hidden;
    background-color: @WHITE_20;
  }
  .lines {
    height: 100%;
    background-color: @WHITE;
  }
  .small-lines {
    display: block;
    position: absolute;
    overflow: hidden;
    border-radius: 2px;
    will-change: left, right;
    animation-fill-mode: forwards;
    &.\31 {
      animation: 2s cubic-bezier(0.65, 0.815, 0.735, 0.395) 0s infinite normal none running long;
    }
    &.\32 {
      animation: 2s cubic-bezier(0.165, 0.84, 0.44, 1) 1s infinite normal none running short;
    }
  }
  @keyframes long {
    0% {
      left: -35%;
      right: 100%;
    }
    60% {
      left: 100%;
      right: -90%;
    }
    100% {
      left: 100%;
      right: -90%;
    }
  }
  @keyframes short {
    0% {
      left: -200%;
      right: 100%;
    }
    60% {
      left: 107%;
      right: -8%;
    }
    100% {
      left: 107%;
      right: -8%;
    }
  }

  // Chrome 38
  @-webkit-keyframes long {
    0% {
      left: -35%;
      right: 100%;
    }
    60% {
      left: 100%;
      right: -90%;
    }
    100% {
      left: 100%;
      right: -90%;
    }
  }
  @-webkit-keyframes short {
    0% {
      left: -200%;
      right: 100%;
    }
    60% {
      left: 107%;
      right: -8%;
    }
    100% {
      left: 107%;
      right: -8%;
    }
  }
</style>
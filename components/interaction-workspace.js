window.AcademyInteractionWorkspace = Object.freeze({
  attach(card) {
    const view = card.ownerDocument.defaultView;
    const reset = () => card.style.removeProperty('min-block-size');
    view.addEventListener('resize', reset);

    function beforeUpdate() {
      const { scrollingElement } = card.ownerDocument;
      if (!card.isConnected || !scrollingElement?.scrollTop) {
        reset();
        return;
      }

      // Reserve only the height needed to keep the current scroll position reachable.
      const remainingScroll = scrollingElement.scrollHeight - scrollingElement.clientHeight - scrollingElement.scrollTop;
      const minimum = Math.ceil(card.getBoundingClientRect().height - Math.max(0, remainingScroll));
      if (minimum > 0) card.style.minBlockSize = minimum + 'px';
      else reset();
    }

    return { beforeUpdate, reset };
  }
});

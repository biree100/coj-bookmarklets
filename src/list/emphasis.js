//
// emphasis.js
//

(function() {
  [].forEach.call(
    cardbox_card.children,
    function(e) {
      e.style.outline = '#F00 solid 0';
      e.onclick = function() {
        this.style.outlineWidth = this.style.outlineWidth.match(2) ? 0 : '2px';
      };
    }
  );
})();

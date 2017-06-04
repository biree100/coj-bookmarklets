//
// deck.js
//
// Set the argument Array as global;
// ex) deckArgs = [0];
//
// deckArgs[0] -> forIE
//   0: default
//   1: for InternetExplorer
//

(function(D) {
  var args = deckArgs || [];
  var forIE = args[0] || 0;
  var dispPoints = confirm('DOB?');

  var foilImage = new Image();
  var originalityImage = new Image();

  foilImage.src = '../img/pc/foil/foil_thum.png';
  originalityImage.src = D.defaultView.getComputedStyle(p_rank_img, '').backgroundImage.match(/h.+g/);

  var canvas = D.createElement('canvas');
  var context = canvas.getContext('2d');
  context.fillRect(0, 0, canvas.width = 600, canvas.height = 366);
  context.font = '10pt Helvetica';

  var cardImages = getDeckImages();

  var totalCount = cardImages.length;

  foilImage.onload = function() {
    originalityImage.onload = function() {
      cardImages.forEach(putImage);
    };
  };

  function getDeckImages() {
    var array = [];
 
    [].forEach.call(
      deck_card.children,
      function(e) {
        var image = new Image();
        var children = e.children;
        var computedStyle = D.defaultView.getComputedStyle(children[0], '');
        var bgPositions = computedStyle.backgroundPosition.split(/\s/);
        var quantity = +children[3].innerHTML.match(/\d/);
        image.src = computedStyle.backgroundImage.match(/i.+jpg/);
        image.posX = 2 * bgPositions[0].match(/\d+/);
        image.posY = 2 * bgPositions[1].match(/(?:\d|\.)+/);
        image.foil = children[1].className.match(/b/);
        image.op = children[6].innerHTML;
        for(var i = quantity; i--;) array.push(image);
      }
    );

    return array;
  }

  function putImage(e, i) {
    var x = (i % 10) * 60;
    var y = (i / 10 | 0) * 85;

    e.addEventListener('load', draw, 0);

    function draw() {
      context.drawImage(e, e.posX, e.posY, 120, 169, x, y, 60, 84);
      e.foil && context.drawImage(foilImage, x, y, 60, 84);
      dispPoints && (
        context.fillStyle = '#37093E',
        context.fillRect(x, y, 19,16),
        context.fillStyle = '#660D74',
        context.fillRect(x+1, y+1, 17, 14),
        context.fillStyle = '#FFF',
        context.fillText(e.op, x+6, y+13)
      );
      --totalCount || finalize();
    }
  }

  function finalize() {
    context.fillStyle = '#FFF';
    context.font = '17pt sans-serif';

    context.drawImage(originalityImage, 2, 342, 24, 21);

    printJokers();

    forIE ? outputIE() : output();

    function printJokers() {
      var j1c, j2c, u1, u2;
      j1c = j2c = u1 = u2 = ' ';

      if((c1 = deck_1st_box.children)[0])
        j1c = c1[3].className.match(/[^ ]+$/),
        j1n = c1[4].className.match(/\d/);
      if((c2 = deck_2nd_box.children)[0])
        j2c = c2[3].className.match(/[^ ]+$/),
        j2n = c2[4].className.match(/\d/);

      [].forEach.call(
        userJokerInfo,
        function(info) {
          if(info.agentTag == j1c && info.no == j1n)
            u1 = info.abilityName;
          else if(info.agentTag == j2c && info.no == j2n)
            u2 = info.abilityName;
        }
      );

      context.fillText(p_rank_point.innerHTML + '  ' + u1 + ' / ' + u2, 25, 361);
    }

    function outputIE() {
      var deckImage = new Image();
      with(deckImage.style)
        display = 'block',
        position = 'fixed',
        top = right = 0,
        zIndex = 1e3,
        WebkitTouchCallout = 'default';
      deckImage.src = canvas.toDataURL();
      D.body.appendChild(deckImage);
      deckImage.onclick = function() {
        D.body.removeChild(this);
      };
    }

    function output() {
      var anchor = D.createElement('a');
      anchor.href = canvas.toDataURL();
      anchor.download = 'deck';
      D.body.appendChild(anchor);
      anchor.click();
    }
  }
})(document);

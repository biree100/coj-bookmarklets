//
// output.js
//
// Set the argument Array as global;
// ex) outputArgs = [1, 0];
//
// outputArgs[0] -> inverse
//   0: default
//   1: output hidden cards
// outputArgs[1] -> enter
//   0: default
//   1: enter xSize manually
//

(function(D, M) {
  var args = outputArgs || [];
  var inverse = args[0] || 0;
  var enter = args[1] || 0;
  var dividing = args[2] || 0;

  var foilImage = new Image();
  var quantityImage = new Image();

  foilImage.src = 'img/pc/foil/foil_thum.png';
  quantityImage.src = 'img/pc/deck/card_quantity_bg.png';

  var cardImages = getCardImages();

  var totalCount = cardImages.length;
  var xSize = getXSize();
  var ySize = getYSize();
  var xySize = xSize * ySize;

  var loadCounts = [];
  var outputCount = -1;

  var canvas, context;

  foilImage.onload = function() {
    quantityImage.onload = function() {
      cardImages.forEach(putImage);
    };
  };

  function getCardImages() {
    return [].filter.call(
      cardbox_card.children,
      isToOutput
    ).map(toImage);

    function isToOutput(e) {
      var dark = e.dark.className.match(/b/);
      var none = e.style.display.match(/n/);
      return e.n && inverse ^ !(dark || none);
    }

    function toImage(e) {
      var image = new Image();
      var children = e.children;
      var computedStyle = D.defaultView.getComputedStyle(children[0], '');
      var bgPositions = computedStyle.backgroundPosition.split(/\s/);
      image.src = computedStyle.backgroundImage.match(/i.+jpg/);
      image.posX = 2 * bgPositions[0].match(/\d+/);
      image.posY = 2 * bgPositions[1].match(/(?:\d|\.)+/);
      image.foil = children[1].className.match(/b/);
      image.outline = e.style.outlineWidth.match(2) ? e.style.outlineColor : 0;
      image.n = e.n;
      return image;
    }
  }

  function getXSize() {
    if(enter || dividing) return parseInt(prompt('画像の横幅を指定してください')) || getXSize();
    var xSize = M.sqrt(totalCount) * 1.31 | 0;
    return blanks(xSize) < blanks(xSize + 1) ? xSize : xSize + 1;

    function blanks(xSize) {
      return totalCount % xSize && xSize - totalCount % xSize;
    }
  }

  function getYSize() {
    if(dividing) return parseInt(prompt('画像の縦幅を指定してください')) || getYSize();
    else return M.ceil(totalCount / xSize);
  }

  function putImage(e, i) {
    var x = (i % xSize) * 60;
    var y = (i / xSize | 0) % ySize * 84;

    i % xySize || initCanvas();

    e.addEventListener('load', drawClosure(canvas, context, outputCount), 0);

    function initCanvas() {
      canvas = D.createElement('canvas');
      context = canvas.getContext('2d');
      context.fillRect(
        0, 0,
        canvas.width = M.min(xSize, totalCount - i) * 60,
        canvas.height = M.min(ySize, M.ceil((totalCount - i) / xSize)) * 84
      );
      context.font = '16pt Helvetica';
      context.fillStyle = '#FFF';
      context.lineWidth = 2;

      loadCounts.push(M.min(totalCount - i, xySize));
      outputCount++;
    }

    function drawClosure(canvas, context, outputCount) {
      return function() {
        context.drawImage(e, e.posX, e.posY, 120, 169, x, y, 60, 84);
        e.foil && context.drawImage(foilImage, x, y, 60, 84);
        e.outline && (context.strokeStyle = e.outline, context.strokeRect(x + 1, y + 1, 58, 82));
        context.drawImage(quantityImage, x + 31, y + 63, 29, 21);
        context.fillText('x' + e.n, x + 35, y + 81);
        --loadCounts[outputCount] || display(canvas);
      };

      function display(canvas) {
        var listImage = new Image();

        listImage.src = canvas.toDataURL();
        listImage.onclick = function() {
          D.body.removeChild(this);
        };
        with(listImage.style)
          display = 'block',
          position = 'fixed',
          top = right = 0,
          zIndex = 1e3 - outputCount,
          WebkitTouchCallout = 'default';
      
        D.body.appendChild(listImage);
      }
    }
  }
})(document, Math);

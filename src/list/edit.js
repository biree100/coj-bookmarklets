//
// edit.js
//
// Set the argument Array as global;
// ex) editArgs = [3, undefined, 0, 0, 0];
//
// editArgs[0] -> editMode
//   0: default
//   1: all
//   2: excess
//   3: shortage
// **REMOVED** editArgs[1] -> ignoreOld
// editArgs[2] -> hideCards
//   0: default
//   1: hide cards when click
// editArgs[3] -> iPad
//   0: default
//   1: for iPads
// editArgs[4] -> sortType
//   0: default
//   1: sort by card types
//   2: sort by rarities
// **REMOVED** editArgs[5] -> dropRarity
//


(function() {
  var args = editArgs || [];
  var editMode = args[0] || 0;
  var hideCards = args[2] || 0;
  var iPad = args[3] || 0;
  var sortType = {0: 0, 1: '2', 2: '5'}[args[4]] || p_card_sort_type.value;

  var cc = cardbox_card;
  var hist = [];

  editMode && withRequest();
  construct();

  function construct() {
    card_detail_wrapper.style.top = '100%';
    cc.style.background = '#000';

    if (hideCards || iPad) with (cardbox_area.style)
      position = 'fixed',
      top = left = 0,
      zIndex = 800,
      height = (innerHeight - 32) + 'px',
      WebkitTouchCallout = 'default';
    else with (cc.style)
      position = 'absolute',
      top = left = 0,
      zIndex = 800,
      WebkitTouchCallout = 'default';

    [].forEach.call(
      cc.children,
      function(e) {
        if (!(e.cq = e.children[3]) || !(e.n = +e.cq.innerHTML.match(/\d/)))
          e.style.display = 'none';
        e.dark = e.children[2];

        e.onclick = hideCards ? function() {
          this.style.display = 'none';
          hist.push(this);
        } : function() {
          this.dark.className = 'darken' + (this.dark.className.match(/b/) ? '' : ' display_block');
        };
        e.oncontextmenu = function() {
          this.cq.innerHTML = 'x' + (this.n = this.n - 1 || 9);
          return false;
        };
      }
    );
    hideCards && (p_card_search.onclick = function() {
      hist.length && (pv.pop().style.display = 'block');
    });
  }

  function withRequest() {
    var foilConf = confirm('フォイル編集: [OK]\nノーマル編集: [キャンセル]') ? 1e4 : 0;
    var prVer = masterCard[257].ver;
    var spVer = masterCard[1063].ver;
    var cardData = getSortedMasterCard();
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'get_card_list_info', 0);
    httpRequest.send();

    var possessions = getPossessions();

    cc.innerHTML = cardData.map(
      function(e) {
        var n = getN(e);
        if (n && checkCard(e)) return '<li id="cb_' + e.id + '"><div class="card_image' +
          (e.sprite ?
            ' ' + e.imgClass :
            '" style="background:url(' + e.s_img + ') no-repeat;background-size:100%;'
          ) +
          '"></div><div class="foil' + (foilConf && ' display_block') +
          '"></div><div class="darken"></div><div class="card_quantity">x' + n + '</div></li>';
        else return '';
      }
    ).join('');

    function checkCard(card) {
      return ['dop_' + card.op, 'type_' + card.type, 'color_' + card.color, 'rarity_' + card.rarity, 'cost_' + Math.min(card.cost, 8)].every(check) &&
        (species_all.checked || check('species_' + card.species)) &&
        (card.ver == prVer || card.ver == spVer || check((card.ver < 6 ? 'national_' : 'ver_') + card.ver));
      function check(boxId) {
        return (document.getElementById(boxId) || {}).checked;
      }
    }

    function getSortedMasterCard() {
      var array = [];

      for (var i in masterCard) {
        var card = array[i] = masterCard[i];
        !foilConf || editMode - 3 || card.ver - spVer || 35 < card.no && card.no < 53 || delete array[parseInt(card.imgClass.slice(-3), 10)];
      }

      return array.sort(comp());
    }

    function comp() {
      var byNumber = function(a, b) {
        return a.view_no.localeCompare(b.view_no);
  	  };
      var byCardType = function(a, b) {
        return Math.max(a.type, 2) - Math.max(b.type, 2) || a.color - b.color || byNumber(a, b);
  	  };
      var byRarity = function(a, b) {
        return b.rarity - a.rarity || byCardType(a, b);
  	  };
      switch (sortType) {
      	case '2': return byCardType;
      	case '5': return byRarity;
      	default: return byNumber;
      }
    }

    function getN(e) {
      var pos = possessions[e.id + foilConf] || 0;
      return {
        1: pos,
        2: Math.max(pos - 3, 0),
        3: Math.max(3 - pos, 0)
      }[editMode];
    }

    function getPossessions() {
      var obj = {};
      var userCardInfo = JSON.parse(httpRequest.responseText).userCardInfo;

      for (var i in userCardInfo) obj[userCardInfo[i].id] = userCardInfo[i].cnt;

      return obj;
    }
  }
})();

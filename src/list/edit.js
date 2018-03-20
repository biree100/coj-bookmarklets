//
// edit.js
//
// Set the argument Array as global;
// ex) editArgs = [3, 1, 0, 0, 0, 0];
//
// editArgs[0] -> editMode
//   0: default
//   1: all
//   2: excess
//   3: shortage
// editArgs[1] -> ignoreOld
//   0: default
//   1: show only standard-available cards
// editArgs[2] -> hideCards
//   0: default
//   1: hide cards when click
// editArgs[3] -> iPad
//   0: default
//   1: for iPad
// editArgs[4] -> sortType
//   0: default
//   1: sort with card type
//   2: sort with rarity
// editArgs[5] -> dropRarity
//   0: default
//   1: drop C
//   2: drop UC or lower rarity
//   3: drop R  or lower rarity
//   4: drop VR or lower rarity
//


(function() {
  var args = editArgs || [];
  var editMode = args[0] || 0;
  var ignoreOld = args[1] || 0;
  var hideCards = args[2] || 0;
  var iPad = args[3] || 0;
  var sortType = args[4] || 0;
  var dropRarity = args[5] || 0;

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
        if (n && checkCard(e)) return '<li id="cb_' + e.id + '"><div class="card_image'
          + (e.sprite ?
            ' ' + e.imgClass :
            '" style="background:url(' + e.s_img + ') no-repeat;background-size:100%;'
          ) + '"></div><div class="foil' + (foilConf && ' display_block')
          + '"></div><div class="darken"></div><div class="card_quantity">x' + n + '</div></li>';
        else return '';
      }
    ).join('');

    function checkCard(card) {
      return eval('dop_' + card.op).checked
        && eval('type_' + card.type).checked
        && eval('color_' + card.color).checked
        && (card.species ? eval('species_' + card.species).checked : species_all.checked)
        && !((ignoreOld || !national_all.checked) && card.ver < 6)
        && (card.ver == prVer || card.ver == spVer || eval((card.ver < 6 ? 'national_' : 'ver_') + card.ver).checked)
        && eval('cost_' + Math.min(card.cost, 8)).checked
        && card.rarity > dropRarity;
    }

    function getSortedMasterCard() {
      var array = [];

      for (var i in masterCard) {
        array[i] = masterCard[i];
        editMode - 3 || masterCard[i].ver - spVer || masterCard[i].no > 35 || delete array[parseInt(masterCard[i].imgClass.slice(-3), 10)];
      }

      return array.sort(comp());
    }

    function comp() {
      return {
        0: function(a, b) {
          return a.view_no.localeCompare(b.view_no);
        },
        1: function(a, b) {
          return Math.max(a.type, 2) - Math.max(b.type, 2) || a.color - b.color || a.view_no.localeCompare(b.view_no);
        },
        2: function(a, b) {
          return b.rarity - a.rarity || Math.max(a.type, 2) - Math.max(b.type, 2) || a.color - b.color || a.view_no.localeCompare(b.view_no);
        }
      }[sortType];
    }

    function getN(e) {
      return {
        1: possessions[e.id + foilConf],
        2: Math.max((possessions[e.id + foilConf] || 0) - 3, 0),
        3: Math.max(3 - (possessions[e.id + foilConf] || 0), 0)
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

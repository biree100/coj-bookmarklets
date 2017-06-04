//
// edit.js
//
// Set the argument Array as global;
// ex) editArgs = [3, 1, 0, 0];
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
//


(function() {
  var args = editArgs || [];
  var editMode = args[0] || 0;
  var ignoreOld = args[1] || 0;
  var hideCards = args[2] || 0;
  var iPad = editArgs[3] || 0;

  var cc = cardbox_card;
  var hist = [];

  if(editMode) withRequest();
  else construct();

  function construct() {
    card_detail_wrapper.style.top = '100%';
    cc.style.background = '#000';

    if(hideCards || iPad)
      with(cardbox_area.style)
        position = 'fixed',
        top = left = 0,
        zIndex = 800,
        height = (innerHeight - 32) + 'px';
    else
      with(cc.style)
        position = 'absolute',
        top = left = 0,
        zIndex = 800;

    [].forEach.call(
      cc.children,
      function(e) {
        if(!(e.cq = e.children[3]) || !(e.n = +e.cq.innerHTML.match(/\d/)))
          e.style.display = 'none';
        e.dark = e.children[2];

        e.onclick = hideCards ?
          function() {
            this.style.display = 'none';
            hist.push(this);
          } :
          function() {
            this.dark.className = 'darken' + (this.dark.className.match(/b/) ? '' : ' display_block');
          };
        e.oncontextmenu = function() {
          this.cq.innerHTML = 'x' + (this.n = this.n - 1 || 9);
          return false;
        };
        var touchFlag = 0;
        e.ontouchstart = function() {
          touchFlag ?
            this.cq.innerHTML = 'x' + (this.n = this.n - 1 || 9) :
            touchFlag = 1, setTimeout(
              function() { tf = 0; },
              300
            );
        };
      }
    );
    hideCards && (p_card_search.onclick = function() {
      hist.length && (pv.pop().style.display = 'block');
    });
  }

  function withRequest() {
    var foilConf = confirm('フォイル編集: [OK]\nノーマル編集: [キャンセル]') ? 1e4 : 0;
    var cardData = getSortedMasterCard();
    var httpRequest = new XMLHttpRequest();

    httpRequest.onload = function() {
      cc.innerHTML = cardData.map(
        function(e) {
          var n = getN(e);
          if (n && eval('color_' + e.color).checked && (e.ver > 5 || !ignoreOld && national_all.checked))
            return '<li id="cb_' + e.id + '"><div class="card_image' +
              (e.sprite ?
                ' ' + e.imgClass :
                '" style="background:url(' + e.s_img + ') no-repeat;background-size:100%;'
              ) +
              '"></div><div class="foil' + (foilConf && ' display_block') +
              '"></div><div class="darken"></div><div class="card_quantity">x' + n + '</div></li>';
          else return '';
        }
      ).join('');
      construct(cc);
    };
    httpRequest.open('GET', 'get_card_list_info', 1);
    httpRequest.send();

    function getSortedMasterCard() {
      var array = [];

      for(var i in masterCard) {
        array[i] = masterCard[i];
        editMode - 3 || masterCard[i].ver - 23 || masterCard[i].no > 35 || delete array[parseInt(masterCard[i].imgClass.slice(-3), 10)];
      }

      return array.sort(
        function(a, b) {
          return a.view_no.localeCompare(b.view_no);
        }
      );
    }

    function getN(e) {
      var possessions = getPossessions();

      switch(editMode) {
        case 1:
          return possessions[e.id + foilConf];
        case 2:
          return Math.max((possessions[e.id + foilConf] || 0) - 3, 0);
        case 3:
          return Math.max(3 - (possessions[e.id + foilConf] || 0), 0);
      }
    }

    function getPossessions() {
      var obj = {};
      var userCardInfo = JSON.parse(httpRequest.responseText).userCardInfo;

      for(var i in userCardInfo) obj[userCardInfo[i].id] = userCardInfo[i].cnt;

      return obj;
    }
  }
})();

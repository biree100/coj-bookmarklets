//
// friends.js
//

(function(D) {
  var profilePop = D.createElement('div');

  profilePop.id = 'profile_list';
  with(profilePop.style)
    position = 'fixed',
    zIndex = 2e3,
    background = '#000';

  D.styleSheets[0].insertRule('#profile_list dl { box-sizing: border-box; }', 0);

  load();

  [].forEach.call(
    page_nation.children,
    function(e) {
      e.addEventListener('click', load);
    }
  );

  function load() {
    [].forEach.call(
      friend_list.children,
      function(e) {
        var q = e.dataset.value;
        if(q) {
          var httpRequest = new XMLHttpRequest();
          httpRequest.onload = function() {
            e.profile = this.responseXML.getElementById('profile_p1');
            e.onmouseover = function(v) {
              profilePop.innerHTML = '';
              profilePop.style.left = 5 + v.clientX + 'px';
              profilePop.style.top = 5 + v.clientY + 'px';
              profilePop.appendChild(e.profile);
              D.body.appendChild(profilePop);
            };
            e.onmouseout = function() {
              D.body.removeChild(profilePop);
            };
          };
          httpRequest.open('GET', 'friend_player?id=' + q, 1);
          httpRequest.responseType = 'document';
          httpRequest.send();
        }
      }
    );
  }
})(document);

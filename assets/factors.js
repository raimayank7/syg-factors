/* factors.shareyourgroup.com: factor finder and HCF / LCM calculator with the working shown. Pure functions first (checked by the build with Node). */
(function () {
  'use strict';
  var F = {};
  F.pf = function (n) { var out = [], p = 2; while (p * p <= n) { if (n % p === 0) { var e = 0; while (n % p === 0) { n /= p; e++; } out.push([p, e]); } p += p === 2 ? 1 : 2; } if (n > 1) out.push([n, 1]); return out; };
  F.factors = function (n) { var fs = [1]; F.pf(n).forEach(function (pe) { var cur = fs.slice(), m = 1; for (var i = 0; i < pe[1]; i++) { m *= pe[0]; cur.forEach(function (f) { fs.push(f * m); }); } }); return fs.sort(function (a, b) { return a - b; }); };
  F.hcf2 = function (a, b) { while (b) { var t = a % b; a = b; b = t; } return a; };
  F.hcf = function (l) { return l.reduce(F.hcf2); };
  F.lcm = function (l) { var r = BigInt(1); l.forEach(function (x) { var b = BigInt(x), a = r, c = b; while (c) { var t = a % c; a = c; c = t; } r = r / a * b; }); return r.toString(); };
  F.euclid = function (a, b) { var s = []; if (a < b) { var t = a; a = b; b = t; } while (b) { var r = a % b; s.push([a, b, (a - r) / b, r]); a = b; b = r; } return s; };
  /* common division for the LCM: rows of [prime, numbers before dividing]; last row [0, all ones] */
  F.ladder = function (l) {
    var rows = [], cur = l.slice(), p = 2;
    while (cur.some(function (x) { return x > 1; })) {
      if (cur.some(function (x) { return x % p === 0; })) { rows.push([p, cur.slice()]); cur = cur.map(function (x) { return x % p === 0 ? x / p : x; }); }
      else { p += p === 2 ? 1 : 2; if (p * p > Math.max.apply(null, cur)) { var big = cur.filter(function (x) { return x > 1; }); if (big.length) p = Math.min.apply(null, big); } }
    }
    rows.push([0, cur]); return rows;
  };
  if (typeof module !== 'undefined') { module.exports = F; return; }

  var d = document, $ = function (s) { return d.querySelector(s); }, esc = SYG.esc;
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function pfH(pf) { return pf.map(function (pe) { return pe[0] + (pe[1] > 1 ? '<sup>' + pe[1] + '</sup>' : ''); }).join(' × '); }
  function pfT(pf) { return pf.map(function (pe) { return pe[0] + (pe[1] > 1 ? '^' + pe[1] : ''); }).join(' x '); }
  function ladderH(n) { var h = '<div class="ladder">', pf = F.pf(n); pf.forEach(function (pe) { for (var i = 0; i < pe[1]; i++) { h += '<div><b>' + pe[0] + '</b><span>' + n + '</span></div>'; n /= pe[0]; } }); return h + '<div><b></b><span>1</span></div></div>'; }

  var ff = $('#ff-form');
  if (ff) {
    var run = function () {
      var raw = $('#ff-n').value.replace(/[,\s]/g, ''), out = $('#ff-out');
      if (!/^\d+$/.test(raw) || +raw < 1 || +raw > 1e12) { out.innerHTML = '<p class="note">Type a whole number from 1 to 1,000,000,000,000.</p>'; return; }
      var n = +raw, pf = F.pf(n), fs = F.factors(n), prime = pf.length === 1 && pf[0][1] === 1, sum = fs.reduce(function (a, b) { return a + b; }, 0), rest = sum - n;
      var sq = pf.every(function (pe) { return pe[1] % 2 === 0; }), cu = pf.every(function (pe) { return pe[1] % 3 === 0; });
      var kind = n === 1 ? 'Neither prime nor composite' : prime ? 'Prime' : 'Composite';
      var tags = [n % 2 ? 'odd' : 'even']; if (sq) tags.push('perfect square'); if (cu && n > 1) tags.push('perfect cube'); if (n > 1) tags.push(rest === n ? 'perfect number' : rest > n ? 'abundant' : 'deficient');
      var pairs = [], i; for (i = 0; i < Math.ceil(fs.length / 2); i++) pairs.push(fs[i] + ' × ' + fs[fs.length - 1 - i]);
      var many = fs.length > 400, list = many ? fs.slice(0, 200).join(', ') + ' ... ' + fs.slice(-5).join(', ') : fs.join(', ');
      var h = '<div class="result rise"><h2>Factors of ' + fmt(n) + '</h2><p class="fl">' + list + '</p><dl class="facts"><dt>How many factors</dt><dd>' + fs.length + '</dd><dt>Kind of number</dt><dd>' + kind + ' (' + tags.join(', ') + ')</dd>' +
        (n > 1 ? '<dt>Prime factorisation</dt><dd>' + pfH(pf) + '</dd>' : '') + '<dt>Sum of all factors</dt><dd>' + fmt(sum) + '</dd></dl>' +
        '<div class="acts"><button class="btn sm" type="button" data-copy="' + esc('Factors of ' + n + ': ' + fs.join(', ') + (n > 1 ? '\nPrime factorisation: ' + pfT(pf) : '')) + '">Copy</button></div></div>';
      if (n > 1) {
        h += '<div class="work"><h3>Factor pairs</h3><p class="fl">' + (many ? pairs.slice(0, 60).join(', ') + ' ...' : pairs.join(', ')) + '</p>';
        h += prime ? '<h3>Why it is prime</h3><p>No prime up to its square root divides ' + fmt(n) + ', so its only factors are 1 and itself.</p>' :
          '<h3>Prime factorisation by division</h3><p>Divide by the smallest prime that goes in, again and again, until you reach 1.</p>' + ladderH(n) + '<p>' + fmt(n) + ' = ' + pfH(pf) + '</p>';
        h += '<h3>Counting the factors</h3><p>Add 1 to each power in the prime factorisation and multiply: ' + pf.map(function (pe) { return '(' + pe[1] + ' + 1)'; }).join(' × ') + ' = ' + fs.length + '.</p>';
        h += '<h3>Perfect, abundant or deficient?</h3><p>The factors other than ' + fmt(n) + ' itself add up to ' + fmt(rest) + ', which is ' + (rest === n ? 'exactly the number, so it is a perfect number.' : rest > n ? 'more than the number, so it is abundant.' : 'less than the number, so it is deficient.') + '</p></div>';
      }
      out.innerHTML = h;
    };
    ff.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    var m = /[?&]n=(\d+)/.exec(location.search); if (m) { $('#ff-n').value = m[1]; run(); }
  }

  var hl = $('#hl-form');
  if (hl) {
    var go = function () {
      var out = $('#hl-out'), l = ($('#hl-n').value.match(/\d+/g) || []).map(Number);
      if (l.length < 2 || l.length > 6 || l.some(function (x) { return x < 1 || x > 1e9; })) { out.innerHTML = '<p class="note">Type two to six whole numbers, each from 1 to 1,000,000,000, with commas or spaces between them.</p>'; return; }
      var H = F.hcf(l), L = F.lcm(l), pfs = l.map(F.pf), primes = {}, h, i;
      pfs.forEach(function (pf) { pf.forEach(function (pe) { primes[pe[0]] = 1; }); });
      var ps = Object.keys(primes).map(Number).sort(function (a, b) { return a - b; });
      var pow = function (pf, p) { for (var k = 0; k < pf.length; k++) if (pf[k][0] === p) return pf[k][1]; return 0; };
      var hp = [], lp = []; ps.forEach(function (p) { var es = pfs.map(function (pf) { return pow(pf, p); }), mn = Math.min.apply(null, es), mx = Math.max.apply(null, es); if (mn) hp.push([p, mn]); lp.push([p, mx]); });
      h = '<div class="result rise"><h2>' + l.map(fmt).join(', ') + '</h2><dl class="facts"><dt>HCF (GCD)</dt><dd class="big">' + fmt(H) + '</dd><dt>LCM</dt><dd class="big">' + fmt(L) + '</dd></dl>' +
        '<div class="acts"><button class="btn sm" type="button" data-copy="' + esc('HCF of ' + l.join(', ') + ' = ' + H + '\nLCM of ' + l.join(', ') + ' = ' + L) + '">Copy</button></div></div><div class="work">';
      h += '<h3>Method 1: prime factorisation</h3><ul>' + l.map(function (x, k) { return '<li>' + fmt(x) + ' = ' + (x === 1 ? '1' : pfH(pfs[k])) + '</li>'; }).join('') + '</ul>';
      h += '<p><b>HCF:</b> take the primes that are in every number, each with its smallest power. ' + (hp.length ? 'HCF = ' + pfH(hp) + ' = ' + fmt(H) + '.' : 'No prime is in every number, so the HCF is 1. The numbers are co-prime.') + '</p>';
      h += '<p><b>LCM:</b> take every prime that appears, each with its largest power. LCM = ' + (lp.length ? pfH(lp) : '1') + ' = ' + fmt(L) + '.</p>';
      h += '<h3>Method 2: division (Euclid\'s method) for the HCF</h3>'; var cur = l[0];
      for (i = 1; i < l.length; i++) {
        var st = F.euclid(cur, l[i]), g = F.hcf2(cur, l[i]);
        h += '<p>' + (i > 1 ? 'Now ' : '') + 'HCF of ' + fmt(cur) + ' and ' + fmt(l[i]) + ':</p><ul>' + st.map(function (s) { return '<li>' + fmt(s[0]) + ' = ' + fmt(s[1]) + ' × ' + fmt(s[2]) + ' + ' + fmt(s[3]) + '</li>'; }).join('') + '</ul><p>The last divisor is ' + fmt(g) + '.</p>'; cur = g;
      }
      if (Math.max.apply(null, l) <= 1e6) {
        var rows = F.ladder(l), div = rows.filter(function (r) { return r[0]; }).map(function (r) { return r[0]; });
        h += '<h3>Method 3: common division for the LCM</h3><div class="tbl"><table class="cd"><tbody>' + rows.map(function (r) { return '<tr><th>' + (r[0] || '') + '</th>' + r[1].map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
        if (div.length) h += '<p>Multiply the divisors: ' + (div.length > 24 ? div.slice(0, 24).join(' × ') + ' × ...' : div.join(' × ')) + ' = ' + fmt(L) + '.</p>';
      }
      if (l.length === 2) h += '<h3>Check</h3><p>For two numbers, HCF × LCM = product of the numbers: ' + fmt(H) + ' × ' + fmt(L) + ' = ' + fmt((BigInt(H) * BigInt(L)).toString()) + ' = ' + fmt(l[0]) + ' × ' + fmt(l[1]) + '.</p>';
      out.innerHTML = h + '</div>';
    };
    hl.addEventListener('submit', function (e) { e.preventDefault(); go(); });
    d.addEventListener('click', function (e) { var b = e.target.closest('[data-try]'); if (b) { $('#hl-n').value = b.getAttribute('data-try'); go(); } });
  }
})();

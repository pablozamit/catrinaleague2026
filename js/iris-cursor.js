/* Cursor iris global — ojo dorado que sigue el puntero y mira hacia el movimiento.
   Se activa solo en dispositivos con puntero fino (ver otono2026.css). */
(function () {
    var iris = document.createElement('div');
    iris.id = 'iris';
    iris.setAttribute('aria-hidden', 'true');
    var pupil = document.createElement('div');
    pupil.className = 'pupil';
    iris.appendChild(pupil);

    function set(p, v) { document.body.style.setProperty(p, v); }

    var lx = 0, ly = 0, has = false, idle = null;

    document.addEventListener('pointermove', function (e) {
        var x = e.clientX, y = e.clientY;
        if (has) {
            var dx = x - lx, dy = y - ly, d = Math.hypot(dx, dy);
            if (d > 0.5) set('--angle', Math.atan2(dy, dx).toFixed(3) + 'rad');
            set('--speed', Math.min(1, d / 32).toFixed(3));
        }
        set('--x', x.toFixed(1) + 'px');
        set('--y', y.toFixed(1) + 'px');
        if (!document.body.classList.contains('iris-on')) {
            document.body.appendChild(iris);
            document.body.classList.add('iris-on');
        }
        lx = x; ly = y; has = true;
        clearTimeout(idle);
        idle = setTimeout(function () { set('--speed', '0'); }, 120);
    }, { passive: true });
})();

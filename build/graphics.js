var Graphics;
(function (Graphics) {
    var App = (function () {
        function App() {
            var _this = this;
            this.range = 5;
            this.hue = 0;
            this.controls = new Graphics.Controls(this);
            this.canvas = document.createElement('canvas');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx = this.canvas.getContext('2d');
            document.body.insertAdjacentElement('afterbegin', this.canvas);
            this.animation = new Graphics.Animation(function (duration) {
                _this.step(duration);
            });
            this.reset();
            this.run();
        }
        App.prototype.step = function (duration) {
            var _this = this;
            this.ctx.strokeStyle = 'hsla(' + this.hue + ',50%,50%,0.05)';
            Graphics.drawCurve(this.ctx, this.points, 0.5, true);
            this.hue += 0.25;
            this.points = this.points.map(function (p) {
                p[0] += (Math.random() * _this.range) - (_this.range / 2);
                p[1] += (Math.random() * _this.range) - (_this.range / 2);
                return p;
            });
            if (this.hue > 255)
                this.hue = 0;
        };
        App.prototype.run = function () {
            for (var j = 0; j < this.controls.getCount(); j++) {
                this.points.push([Math.random() * this.canvas.width / 2 + this.canvas.width / 4, Math.random() * this.canvas.height / 2 + this.canvas.height / 4]);
            }
            this.hue = 0;
            this.range = this.controls.getVariation();
            this.ctx.lineWidth = this.controls.getLineWidth();
            this.animation.animate();
        };
        App.prototype.stop = function () {
            this.animation.stop();
        };
        App.prototype.reset = function () {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.points = [];
        };
        return App;
    }());
    Graphics.App = App;
})(Graphics || (Graphics = {}));
var Graphics;
(function (Graphics) {
    function drawCurve(ctx, points, smoothing, close) {
        if (!points || points.length < 2)
            return;
        var k = typeof smoothing === 'number' ? smoothing : 0.2;
        var renderData = [];
        var keys;
        points.forEach(function (value, index) {
            if (index === 0 && close) {
                keys = getKeys(points[points.length - 1], value, points[1]);
                renderData.push({
                    job: 'move-to',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            }
            else if (index === 0) {
                renderData.push({
                    job: 'move-to',
                    point: value
                });
            }
            else if (index === 1 && points.length === 2 && !close) {
                renderData.push({
                    job: 'line-to',
                    point: value
                });
            }
            else if (index === 1 && points.length > 2 && close) {
                keys = getKeys(points[index - 1], value, points[index + 1]);
                renderData.push({
                    job: 'bezier',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            }
            else if (index === 1 && points.length > 2) {
                keys = getKeys(points[index - 1], value, points[index + 1]);
                renderData.push({
                    job: 'quadratic',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            }
            else if (index === points.length - 1 && close) {
                keys = getKeys(points[index - 1], value, points[0]);
                renderData.push({
                    job: 'bezier',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
                keys = getKeys(value, points[0], points[1]);
                renderData.push({
                    job: 'bezier',
                    previous: keys.previous,
                    point: points[0],
                    next: keys.next
                });
            }
            else if (index === points.length - 1) {
                renderData.push({
                    job: 'quadratic-end',
                    point: value,
                });
            }
            else {
                keys = getKeys(points[index - 1], value, points[index + 1]);
                renderData.push({
                    job: 'bezier',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            }
        });
        var transfer = null;
        ctx.beginPath();
        for (var i = 0; i < renderData.length; i++) {
            switch (renderData[i].job) {
                case 'move-to':
                    ctx.moveTo(renderData[i].point[0], renderData[i].point[1]);
                    transfer = renderData[i].next;
                    break;
                case 'quadratic':
                    ctx.quadraticCurveTo(renderData[i].previous[0], renderData[i].previous[1], renderData[i].point[0], renderData[i].point[1]);
                    transfer = renderData[i].next;
                    break;
                case 'quadratic-end':
                    ctx.quadraticCurveTo(transfer[0], transfer[1], renderData[i].point[0], renderData[i].point[1]);
                    break;
                case 'bezier':
                    ctx.bezierCurveTo(transfer[0], transfer[1], renderData[i].previous[0], renderData[i].previous[1], renderData[i].point[0], renderData[i].point[1]);
                    transfer = renderData[i].next;
                    break;
                case 'line-to':
                    ctx.lineTo(renderData[i].point[0], renderData[i].point[1]);
                    break;
                default:
                    ctx.lineTo(renderData[i].point[0], renderData[i].point[1]);
                    break;
            }
        }
        if (close)
            ctx.closePath();
        ctx.stroke();
        function getKeys(previous, actual, next) {
            var p = [previous[0] - actual[0], previous[1] - actual[1]];
            var n = [next[0] - actual[0], next[1] - actual[1]];
            var pPolar = [0, 0];
            var nPolar = [0, 0];
            pPolar[1] = Math.sqrt(Math.pow(p[0], 2) + Math.pow(p[1], 2));
            nPolar[1] = Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2));
            pPolar[0] = Math.atan(p[1] / p[0]);
            nPolar[0] = Math.atan(n[1] / n[0]);
            pPolar[0] = p[1] > 0 ? (p[0] > 0 ? pPolar[0] : Math.PI + pPolar[0]) : (p[0] > 0 ? 2 * Math.PI + pPolar[0] : Math.PI + pPolar[0]);
            nPolar[0] = n[1] > 0 ? (n[0] > 0 ? nPolar[0] : Math.PI + nPolar[0]) : (n[0] > 0 ? 2 * Math.PI + nPolar[0] : Math.PI + nPolar[0]);
            var a = (Math.PI - (pPolar[0] - nPolar[0])) / 2;
            var a1Polar = [pPolar[0] + a, pPolar[1] * k];
            var a2Polar = [a1Polar[0] + Math.PI, nPolar[1] * k];
            if (pPolar[0] < nPolar[0]) {
                var x = a2Polar[1];
                a2Polar[1] = a1Polar[1];
                a1Polar[1] = x;
            }
            var a1 = [actual[0] + a1Polar[1] * Math.cos(a1Polar[0]), actual[1] + a1Polar[1] * Math.sin(a1Polar[0])];
            var a2 = [actual[0] + a2Polar[1] * Math.cos(a2Polar[0]), actual[1] + a2Polar[1] * Math.sin(a2Polar[0])];
            if (pPolar[0] < nPolar[0])
                return { previous: a2, next: a1 };
            else
                return { previous: a1, next: a2 };
        }
    }
    Graphics.drawCurve = drawCurve;
})(Graphics || (Graphics = {}));
var Graphics;
(function (Graphics) {
    var Controls = (function () {
        function Controls(app) {
            this.app = app;
            this.count = 2;
            this.variation = 5;
            this.lineWidth = 1;
            this.show();
        }
        Controls.prototype.show = function () {
            var _this = this;
            if (this.element)
                return;
            var html = "\n                <div id=\"controls\">\n                    <label for=\"control-points\">Points (<span>" + this.count + "</span>)</label>\n                    <input id=\"control-points\" type=\"range\" min=\"1\" max=\"10\" value=\"" + this.count + "\" />\n                    <label for=\"control-variation\">Variation (<span>" + this.variation + "</span>)</label>\n                    <input id=\"control-variation\" type=\"range\" min=\"1\" max=\"100\" value=\"" + this.variation + "\" />\n                    <label for=\"control-line\">Line width (<span>" + this.lineWidth + "</span>)</label>\n                    <input id=\"control-line\" type=\"range\" min=\"0.1\" max=\"10\" step=\"0.1\" value=\"" + this.lineWidth + "\" />\n                    <button>Restart</button>\n                </div>\n            ";
            document.body.insertAdjacentHTML('beforeend', html);
            this.element = document.getElementById('controls');
            this.element.querySelector('button').addEventListener('click', function () {
                _this.count = parseInt(document.getElementById('control-points').value);
                _this.variation = parseInt(document.getElementById('control-variation').value);
                _this.lineWidth = parseFloat(document.getElementById('control-line').value);
                _this.app.stop();
                _this.app.reset();
                _this.app.run();
            });
            document.getElementById('control-points').addEventListener('change', function (e) {
                _this.element.querySelector('label[for="control-points"] span').innerHTML = e.target.value;
            });
            document.getElementById('control-variation').addEventListener('change', function (e) {
                _this.element.querySelector('label[for="control-variation"] span').innerHTML = e.target.value;
            });
            document.getElementById('control-line').addEventListener('change', function (e) {
                _this.element.querySelector('label[for="control-line"] span').innerHTML = e.target.value;
            });
        };
        Controls.prototype.hide = function () {
            if (!this.element)
                return;
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        };
        Controls.prototype.getCount = function () {
            return this.count;
        };
        Controls.prototype.getVariation = function () {
            return this.variation;
        };
        Controls.prototype.getLineWidth = function () {
            return this.lineWidth;
        };
        return Controls;
    }());
    Graphics.Controls = Controls;
})(Graphics || (Graphics = {}));
var Graphics;
(function (Graphics) {
    var Animation = (function () {
        function Animation(callback) {
            this.callback = callback;
            this._lastDuration = 0;
            this.callback = callback;
        }
        Animation.prototype.stop = function () {
            if (this.animationId)
                window.cancelAnimationFrame(this.animationId);
            this._lastDuration = 0;
        };
        Animation.prototype.animate = function () {
            var _this = this;
            this.animationId = window.requestAnimationFrame(function (duration) { return _this.step(duration); });
        };
        Animation.prototype.step = function (duration) {
            if (!this._lastDuration)
                this._lastDuration = duration;
            var d = duration - this._lastDuration;
            this._lastDuration = duration;
            this.callback(d);
            this.animate();
        };
        return Animation;
    }());
    Graphics.Animation = Animation;
})(Graphics || (Graphics = {}));
//# sourceMappingURL=graphics.js.map
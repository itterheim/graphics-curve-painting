namespace Graphics {

    interface RenderingInstruction {
        job: string,
        previous?: number[],
        point: number[],
        next?: number[]
    }

    /*
        ctx         HTML Canvas context
        points      Array - points [[x0, y0], [x1, y1], [x2, y2],...]
        smoothing   Number - how smoth should the curve be (number between 0 and 1)
        close       Boolean - closed curve
    */
    export function drawCurve (ctx: CanvasRenderingContext2D, points: number[][], smoothing: number, close: boolean) {
        if (!points || points.length < 2) return;
        let k = typeof smoothing === 'number' ? smoothing : 0.2;

        let renderData: RenderingInstruction[] = [];
        let keys;
        points.forEach(function (value, index) {
            if (index === 0 && close) {
                keys = getKeys(points[points.length - 1], value, points[1]);
                renderData.push({
                    job: 'move-to',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            } else if (index === 0) {
                renderData.push({
                    job: 'move-to',
                    point: value
                });
            } else if (index === 1 && points.length === 2 && !close) {
                renderData.push({
                    job: 'line-to',
                    point: value
                });
            } else if (index === 1 && points.length > 2 && close) {
                keys = getKeys(points[index-1], value, points[index+1]);
                renderData.push({
                    job: 'bezier',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            } else if (index === 1 && points.length > 2) {
                keys = getKeys(points[index-1], value, points[index+1]);
                renderData.push({
                    job: 'quadratic',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            } else if (index === points.length - 1 && close) {
                keys = getKeys(points[index-1], value, points[0]);
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
            } else if (index === points.length - 1) {
                renderData.push({
                    job: 'quadratic-end',
                    point: value,
                });
            } else {
                keys = getKeys(points[index-1], value, points[index+1]);
                renderData.push({
                    job: 'bezier',
                    previous: keys.previous,
                    point: value,
                    next: keys.next
                });
            }
        });

        let transfer = null;
        ctx.beginPath();
        for (let i = 0; i < renderData.length; i++) {
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
        if (close) ctx.closePath();
        ctx.stroke();

        function getKeys (previous: number[], actual: number[], next: number[]) {
            var p = [previous[0] - actual[0], previous[1] - actual[1]];
            var n = [next[0]     - actual[0], next[1]     - actual[1]];

            var pPolar = [0, 0];
            var nPolar = [0, 0];
            pPolar[1] = Math.sqrt(Math.pow(p[0], 2) + Math.pow(p[1], 2));
            nPolar[1] = Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2));
            pPolar[0] = Math.atan(p[1]/p[0]);
            nPolar[0] = Math.atan(n[1]/n[0]);
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
            var a1 = [actual[0] + a1Polar[1] * Math.cos(a1Polar[0]), actual[1] + a1Polar[1] * Math.sin(a1Polar[0]) ];
            var a2 = [actual[0] + a2Polar[1] * Math.cos(a2Polar[0]), actual[1] + a2Polar[1] * Math.sin(a2Polar[0]) ];

            if (pPolar[0] < nPolar[0]) return { previous: a2, next: a1 };
            else return { previous: a1, next: a2 };
        }
    }
}

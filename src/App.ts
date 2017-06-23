namespace Graphics {
    export class App {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private controls: Controls;
        private points: number[][];

        private range = 5;
        private hue = 0;

        private animation: Animation;

        constructor () {
            this.controls = new Controls(this);

            this.canvas = document.createElement('canvas');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx = this.canvas.getContext('2d');

            document.body.insertAdjacentElement('afterbegin', this.canvas);

            this.animation = new Graphics.Animation((duration) => {
                this.step(duration);
            });

            this.reset()
            this.run();
        }

        public step (duration: number): void {
            this.ctx.strokeStyle = 'hsla(' + this.hue + ',50%,50%,0.05)';
            drawCurve(this.ctx, this.points, 0.5, true);

            this.hue += 0.25;
            this.points = this.points.map((p: number[]) => {
                p[0] += (Math.random() * this.range) - (this.range / 2);
                p[1] += (Math.random() * this.range) - (this.range / 2);
                return p;
            });
            if (this.hue > 255) this.hue = 0;
        }

        public run (): void {
            for (let j = 0; j < this.controls.getCount(); j++) {
                this.points.push([Math.random() * this.canvas.width / 2 + this.canvas.width / 4, Math.random() * this.canvas.height / 2 + this.canvas.height / 4]);
            }

            this.hue = 0;
            this.range = this.controls.getVariation();
            this.ctx.lineWidth = this.controls.getLineWidth();

            this.animation.animate();
        }

        public stop (): void {
            this.animation.stop();
        }

        public reset (): void {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.points = [];
        }
    }
}

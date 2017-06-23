namespace Graphics {
    export class Controls {
        private element: Element;

        private count: number = 2;
        private variation: number = 5;
        private lineWidth: number = 1;

        constructor (private app: App) {
            this.show();
        }

        public show (): void {
            if (this.element) return;
            let html = `
                <div id="controls">
                    <label for="control-points">Points (<span>${this.count}</span>)</label>
                    <input id="control-points" type="range" min="1" max="10" value="${this.count}" />
                    <label for="control-variation">Variation (<span>${this.variation}</span>)</label>
                    <input id="control-variation" type="range" min="1" max="100" value="${this.variation}" />
                    <label for="control-line">Line width (<span>${this.lineWidth}</span>)</label>
                    <input id="control-line" type="range" min="0.1" max="10" step="0.1" value="${this.lineWidth}" />
                    <button>Restart</button>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', html);

            this.element = document.getElementById('controls');
            this.element.querySelector('button').addEventListener('click', () => {
                this.count = parseInt((<HTMLInputElement> document.getElementById('control-points')).value);
                this.variation = parseInt((<HTMLInputElement> document.getElementById('control-variation')).value);
                this.lineWidth = parseFloat((<HTMLInputElement> document.getElementById('control-line')).value);

                this.app.stop();
                this.app.reset();
                this.app.run();
            });

            document.getElementById('control-points').addEventListener('change', (e: Event) => {
                this.element.querySelector('label[for="control-points"] span').innerHTML = (<HTMLInputElement> e.target).value;
            });

            document.getElementById('control-variation').addEventListener('change', (e: Event) => {
                this.element.querySelector('label[for="control-variation"] span').innerHTML = (<HTMLInputElement> e.target).value;
            });

            document.getElementById('control-line').addEventListener('change', (e: Event) => {
                this.element.querySelector('label[for="control-line"] span').innerHTML = (<HTMLInputElement> e.target).value;
            });
        }

        public hide (): void {
            if (!this.element) return;

            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }

        public getCount (): number {
            return this.count;
        }

        public getVariation (): number {
            return this.variation;
        }

        public getLineWidth (): number {
            return this.lineWidth;
        }
    }
}

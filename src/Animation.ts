namespace Graphics {
    export class Animation {
        private animationId: number;
        private _lastDuration: number = 0;

        constructor (private callback: (duration?: number) => void) {
            this.callback = callback;
        }

        public stop (): void {
            if (this.animationId) window.cancelAnimationFrame(this.animationId);
            this._lastDuration = 0;
        }

        public animate (): void {
            this.animationId = window.requestAnimationFrame((duration) => this.step(duration));
        }

        private step (duration: number): void {
            if (!this._lastDuration) this._lastDuration = duration;
            let d = duration - this._lastDuration;
            this._lastDuration = duration;

            this.callback(d);
            this.animate();
        }
    }
}

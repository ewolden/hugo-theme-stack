class StackWakeLock {
    private localStorageKey = 'StackWakeLock';
    private isEnabled: boolean = false;
    private wakeLock: WakeLockSentinel | null = null;
    private toggleEl: HTMLElement;

    constructor(toggleEl: HTMLElement) {
        if (!toggleEl) return;
        
        this.toggleEl = toggleEl;
        this.isEnabled = this.getSavedState();
        
        this.updateUI();
        this.bindClick();
        this.bindVisibilityChange();
        
        // Request wake lock if previously enabled
        if (this.isEnabled) {
            this.requestWakeLock();
        }
    }

    private async requestWakeLock() {
        if (!('wakeLock' in navigator)) {
            console.warn('Wake Lock API not supported');
            return;
        }

        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            this.isEnabled = true;
            this.saveState();
            this.updateUI();

            this.wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });
        } catch (err) {
            console.error(`Failed to request wake lock: ${err}`);
            this.isEnabled = false;
            this.saveState();
            this.updateUI();
        }
    }

    private async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
            } catch (err) {
                console.error(`Failed to release wake lock: ${err}`);
            }
        }
        this.isEnabled = false;
        this.saveState();
        this.updateUI();
    }

    private bindClick() {
        this.toggleEl.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (this.isEnabled) {
                await this.releaseWakeLock();
            } else {
                await this.requestWakeLock();
            }
        });
    }

    private bindVisibilityChange() {
        // Re-request wake lock when page becomes visible again
        document.addEventListener('visibilitychange', async () => {
            if (this.isEnabled && document.visibilityState === 'visible' && this.wakeLock === null) {
                await this.requestWakeLock();
            }
        });
    }

    private updateUI() {
        if (this.isEnabled) {
            this.toggleEl.classList.add('active');
        } else {
            this.toggleEl.classList.remove('active');
        }
    }

    private saveState() {
        localStorage.setItem(this.localStorageKey, this.isEnabled.toString());
    }

    private getSavedState(): boolean {
        const savedState = localStorage.getItem(this.localStorageKey);
        return savedState === 'true';
    }
}

export default StackWakeLock;

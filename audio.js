// audio.js - Web Audio API Synthesizer for Island Survival

(function() {
    class SoundSystem {
        constructor() {
            this.ctx = null;
            this.soundEnabled = true;
            this.volume = 0.5;
            this.ambientPlaying = false;
            this.ambientGain = null;
            this.rainGain = null;
            this.lastFootstepAt = 0;
            this.init();
        }

        init() {
            const soundCheckbox = document.getElementById('setting-sound');
            const volumeSlider = document.getElementById('setting-volume');

            if (soundCheckbox) {
                this.soundEnabled = soundCheckbox.checked;
                soundCheckbox.addEventListener('change', (e) => {
                    this.soundEnabled = e.target.checked;
                    if (!this.soundEnabled) {
                        this.stopAmbient();
                    } else {
                        this.startAmbient();
                    }
                });
            }

            if (volumeSlider) {
                this.volume = parseInt(volumeSlider.value, 10) / 100;
                volumeSlider.addEventListener('input', (e) => {
                    this.volume = parseInt(e.target.value, 10) / 100;
                    if (this.ambientGain) {
                        this.ambientGain.gain.setValueAtTime(this.volume * 0.15, this.getAudioContext().currentTime);
                    }
                });
            }

            // Resume audio on first user gesture
            const unlock = () => {
                const ctx = this.getAudioContext();
                if (ctx && ctx.state === 'suspended') {
                    ctx.resume();
                }
                if (this.soundEnabled && !this.ambientPlaying) {
                    this.startAmbient();
                }
                window.removeEventListener('click', unlock);
                window.removeEventListener('keydown', unlock);
                window.removeEventListener('touchstart', unlock);
            };
            window.addEventListener('click', unlock);
            window.addEventListener('keydown', unlock);
            window.addEventListener('touchstart', unlock);
        }

        getAudioContext() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            return this.ctx;
        }

        createMasterGain() {
            const ctx = this.getAudioContext();
            if (!ctx) return null;
            const master = ctx.createGain();
            master.gain.setValueAtTime(this.volume, ctx.currentTime);
            master.connect(ctx.destination);
            return master;
        }

        // Noise buffer helper
        createNoiseBuffer(duration = 1.0) {
            const ctx = this.getAudioContext();
            if (!ctx) return null;
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            return buffer;
        }

        // 1. Ambient Ocean Waves & Breeze
        startAmbient() {
            if (this.ambientPlaying || !this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;

            try {
                const noiseBuf = this.createNoiseBuffer(5.0);
                const noise = ctx.createBufferSource();
                noise.buffer = noiseBuf;
                noise.loop = true;

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(320, ctx.currentTime);

                // LFO to simulate rolling ocean waves
                const lfo = ctx.createOscillator();
                lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
                const lfoGain = ctx.createGain();
                lfoGain.gain.setValueAtTime(180, ctx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);

                this.ambientGain = ctx.createGain();
                this.ambientGain.gain.setValueAtTime(this.volume * 0.12, ctx.currentTime);

                noise.connect(filter);
                filter.connect(this.ambientGain);
                this.ambientGain.connect(ctx.destination);

                noise.start();
                lfo.start();
                this.ambientSource = noise;
                this.ambientLfo = lfo;
                this.ambientPlaying = true;
            } catch (e) {
                console.warn('Ambient sound init error:', e);
            }
        }

        stopAmbient() {
            if (!this.ambientPlaying) return;
            try {
                if (this.ambientSource) this.ambientSource.stop();
                if (this.ambientLfo) this.ambientLfo.stop();
            } catch (e) {}
            this.ambientPlaying = false;
        }

        // 2. Footsteps
        playFootstep(surface = 'grass') {
            if (!this.soundEnabled) return;
            const now = performance.now();
            if (now - this.lastFootstepAt < 280) return;
            this.lastFootstepAt = now;

            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const noiseBuf = this.createNoiseBuffer(0.08);
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuf;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            const gain = ctx.createGain();

            if (surface === 'wood') {
                filter.frequency.setValueAtTime(600, ctx.currentTime);
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
            } else if (surface === 'sand') {
                filter.frequency.setValueAtTime(380, ctx.currentTime);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
            } else {
                filter.frequency.setValueAtTime(260, ctx.currentTime);
                gain.gain.setValueAtTime(0.10, ctx.currentTime);
            }

            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            noise.start();
        }

        // 3. Tree Chopping (Wood)
        playChop() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            // Thump osc
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.frequency.setValueAtTime(140, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);
            oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

            // Crack noise
            const noiseBuf = this.createNoiseBuffer(0.06);
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuf;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, ctx.currentTime);
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

            osc.connect(oscGain);
            oscGain.connect(master);
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(master);

            osc.start();
            noise.start();
            osc.stop(ctx.currentTime + 0.13);
        }

        // 4. Stone Mining / Pickaxe Hit
        playMine() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

            osc.connect(gain);
            gain.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }

        // 5. Item Pickup (Ding)
        playPickup() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.13);
        }

        // 6. Gunshots
        playGunshot(type = 'pistol') {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            let duration = 0.25;
            let filterFreq = 1800;
            let initialThump = 200;

            if (type === 'machinegun') {
                duration = 0.12;
                filterFreq = 2200;
                initialThump = 180;
            } else if (type === 'sniper_rifle') {
                duration = 0.45;
                filterFreq = 1400;
                initialThump = 260;
            } else if (type === 'rifle') {
                duration = 0.18;
                filterFreq = 2000;
                initialThump = 220;
            }

            // Punch
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.frequency.setValueAtTime(initialThump, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration * 0.5);
            oscGain.gain.setValueAtTime(0.6, ctx.currentTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.5);

            // Blast Noise
            const noiseBuf = this.createNoiseBuffer(duration);
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuf;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.7, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(oscGain);
            oscGain.connect(master);
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(master);

            osc.start();
            noise.start();
            osc.stop(ctx.currentTime + duration);
        }

        // 7. Zombie Groan
        playZombie() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(85, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(65, ctx.currentTime + 0.35);
            osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.6);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(260, ctx.currentTime);

            gain.gain.setValueAtTime(0.01, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);

            osc.start();
            osc.stop(ctx.currentTime + 0.7);
        }

        // 8. Dog Bark
        playDogBark() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(380, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.18);

            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
        }

        // 9. Chicken Cluck
        playChicken() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        }

        // 10. Goat Bleat
        playGoat() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.25);

            // Vibrato for goat
            const vibrato = ctx.createOscillator();
            vibrato.frequency.setValueAtTime(12, ctx.currentTime);
            const vibGain = ctx.createGain();
            vibGain.gain.setValueAtTime(25, ctx.currentTime);
            vibrato.connect(vibGain);
            vibGain.connect(osc.frequency);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(550, ctx.currentTime);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);

            osc.start();
            vibrato.start();
            osc.stop(ctx.currentTime + 0.38);
            vibrato.stop(ctx.currentTime + 0.38);
        }

        // 11. Alarm / Pirate Raid Horn
        playAlarm() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.6);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

            osc.connect(gain);
            gain.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.75);
        }

        // 12. Helicopter Rotor Sound (evacuation)
        playHelicopter(duration = 3.0) {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const noiseBuf = this.createNoiseBuffer(duration);
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuf;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, ctx.currentTime);

            // Chopping amplitude modulation (14 Hz rotor blades)
            const lfo = ctx.createOscillator();
            lfo.frequency.setValueAtTime(14, ctx.currentTime);
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + duration * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            lfo.connect(gain.gain);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(master);

            noise.start();
            lfo.start();
            noise.stop(ctx.currentTime + duration);
            lfo.stop(ctx.currentTime + duration);
        }

        // 13. Crafting & Building
        playCraft() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(660, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
        }

        // 14. Splash / Diving
        playSplash() {
            if (!this.soundEnabled) return;
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const master = this.createMasterGain();
            if (!master) return;

            const noiseBuf = this.createNoiseBuffer(0.3);
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuf;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.3);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            noise.start();
        }
    }

    window.soundSystem = new SoundSystem();
})();


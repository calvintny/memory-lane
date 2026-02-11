// Ambient particle system for dust motes and atmosphere
export class ParticleSystem {
    constructor(screenWidth, screenHeight, worldWidth) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.worldWidth = worldWidth;
        this.particles = [];

        this.init();
    }

    init() {
        // Create floating dust particles
        for (let i = 0; i < 60; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(x = null) {
        return {
            x: x !== null ? x : Math.random() * this.worldWidth,
            y: Math.random() * this.screenHeight * 0.7 + this.screenHeight * 0.15,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.4 + 0.1,
            oscillateSpeed: Math.random() * 0.02 + 0.01,
            oscillateOffset: Math.random() * Math.PI * 2,
            type: Math.random() > 0.9 ? 'sparkle' : 'dust'
        };
    }

    update(deltaTime, cameraX) {
        this.particles.forEach(particle => {
            // Gentle floating motion
            particle.x += particle.speedX;
            particle.y += particle.speedY + Math.sin(Date.now() * particle.oscillateSpeed + particle.oscillateOffset) * 0.1;

            // Keep within vertical bounds
            if (particle.y < this.screenHeight * 0.15) {
                particle.speedY = Math.abs(particle.speedY);
            }
            if (particle.y > this.screenHeight * 0.75) {
                particle.speedY = -Math.abs(particle.speedY);
            }

            // Sparkle type flickers
            if (particle.type === 'sparkle') {
                particle.opacity = 0.2 + Math.sin(Date.now() * 0.01 + particle.oscillateOffset) * 0.3;
            }
        });

        // Recycle particles that go off screen
        this.particles.forEach((particle, index) => {
            const screenX = particle.x - cameraX;
            if (screenX < -100 || screenX > this.screenWidth + 100) {
                // Respawn in visible area
                const newX = cameraX + (screenX < 0 ? this.screenWidth + 50 : -50);
                if (newX > 0 && newX < this.worldWidth) {
                    this.particles[index] = this.createParticle(newX);
                }
            }
        });
    }

    draw(ctx, cameraX) {
        this.particles.forEach(particle => {
            const screenX = particle.x - cameraX;

            // Only draw visible particles
            if (screenX < -20 || screenX > this.screenWidth + 20) return;

            if (particle.type === 'sparkle') {
                // Sparkle with cross pattern
                ctx.strokeStyle = `rgba(255, 255, 240, ${particle.opacity})`;
                ctx.lineWidth = 1;
                const size = particle.size * 2;

                ctx.beginPath();
                ctx.moveTo(screenX - size, particle.y);
                ctx.lineTo(screenX + size, particle.y);
                ctx.moveTo(screenX, particle.y - size);
                ctx.lineTo(screenX, particle.y + size);
                ctx.stroke();
            } else {
                // Regular dust mote
                ctx.fillStyle = `rgba(255, 252, 240, ${particle.opacity})`;
                ctx.beginPath();
                ctx.arc(screenX, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}

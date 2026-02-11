// Minimalist player character - Girl with long brown hair and black dress
export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseY = y; // Ground level
        this.width = 24;
        this.height = 52;

        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.baseSpeed = 3.5;
        this.sprintSpeed = 6.5;
        this.acceleration = 6;
        this.friction = 0.85;

        // World bounds
        this.worldMin = 50;
        this.worldMax = 5000;
        this.facingRight = true;

        // Jump
        this.isJumping = false;
        this.jumpForce = -10;
        this.gravity = 0.5;

        // Animation
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.baseWalkSpeed = 8;
        this.bobOffset = 0;
        this.hairSway = 0;

        // Colors
        this.skinColor = "#f5dcc3";
        this.hairColor = "#5a3825";
        this.dressColor = "#1a1a1a";
        this.dressAccent = "#2d2d2d";
    }

    update(keys) {
        // Determine speed based on sprint
        const speed = keys.sprint ? this.sprintSpeed : this.baseSpeed;
        const walkSpeed = keys.sprint ? 4 : this.baseWalkSpeed;

        // Horizontal movement
        if (keys.left) {
            this.velocityX -= this.acceleration;
            this.facingRight = false;
        }
        if (keys.right) {
            this.velocityX += this.acceleration;
            this.facingRight = true;
        }

        // Apply friction
        this.velocityX *= this.friction;

        // Clamp velocity
        this.velocityX = Math.max(-speed, Math.min(speed, this.velocityX));

        // Stop if very slow
        if (Math.abs(this.velocityX) < 0.1) {
            this.velocityX = 0;
        }

        // Jump
        if (keys.jump && !this.isJumping) {
            this.isJumping = true;
            this.velocityY = this.jumpForce;
        }

        // Apply gravity
        if (this.isJumping) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;

            // Land on ground
            if (this.y >= this.baseY) {
                this.y = this.baseY;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }

        // Update position
        this.x += this.velocityX;

        // Walking animation
        if (Math.abs(this.velocityX) > 0.5) {
            this.walkTimer++;
            if (this.walkTimer >= walkSpeed) {
                this.walkTimer = 0;
                this.walkFrame = (this.walkFrame + 1) % 4;
            }
            this.bobOffset = this.isJumping ? 0 : Math.sin(this.walkFrame * Math.PI / 2) * 2;
            this.hairSway = Math.sin(Date.now() * 0.01) * (keys.sprint ? 5 : 3);
        } else {
            this.walkFrame = 0;
            this.walkTimer = 0;
            this.bobOffset = 0;
            this.hairSway = Math.sin(Date.now() * 0.003) * 1;
        }

        // Clamp position to world bounds
        this.x = Math.max(this.worldMin, Math.min(this.worldMax, this.x));
    }

    draw(ctx, cameraX) {
        const screenX = this.x - cameraX;
        const jumpOffset = this.baseY - this.y;
        const screenY = this.y - this.bobOffset;

        ctx.save();

        // Flip if facing left
        if (!this.facingRight) {
            ctx.translate(screenX + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.width / 2, 0);
        } else {
            ctx.translate(screenX, 0);
        }

        // Shadow (smaller when jumping)
        const shadowScale = Math.max(0.3, 1 - jumpOffset / 80);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(this.width / 2, this.baseY + this.height - 2, 16 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = this.skinColor;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";

        const legOffset = this.isJumping ? 4 : Math.sin(this.walkFrame * Math.PI / 2) * 6;

        // Left leg
        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 4, screenY + 38);
        ctx.lineTo(this.width / 2 - 4 - legOffset, screenY + this.height - 2);
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.moveTo(this.width / 2 + 4, screenY + 38);
        ctx.lineTo(this.width / 2 + 4 + legOffset, screenY + this.height - 2);
        ctx.stroke();

        // Back hair (behind body)
        ctx.fillStyle = this.hairColor;
        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 8, screenY + 8);
        ctx.quadraticCurveTo(this.width / 2 - 12 + this.hairSway * 0.5, screenY + 25, this.width / 2 - 10 + this.hairSway, screenY + 40);
        ctx.lineTo(this.width / 2 - 6 + this.hairSway, screenY + 42);
        ctx.quadraticCurveTo(this.width / 2 - 6, screenY + 25, this.width / 2 - 4, screenY + 10);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.width / 2 + 8, screenY + 8);
        ctx.quadraticCurveTo(this.width / 2 + 12 - this.hairSway * 0.5, screenY + 25, this.width / 2 + 10 - this.hairSway, screenY + 40);
        ctx.lineTo(this.width / 2 + 6 - this.hairSway, screenY + 42);
        ctx.quadraticCurveTo(this.width / 2 + 6, screenY + 25, this.width / 2 + 4, screenY + 10);
        ctx.closePath();
        ctx.fill();

        // Dress body (A-line black dress)
        ctx.fillStyle = this.dressColor;
        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 6, screenY + 18);
        ctx.lineTo(this.width / 2 - 12, screenY + 40);
        ctx.lineTo(this.width / 2 + 12, screenY + 40);
        ctx.lineTo(this.width / 2 + 6, screenY + 18);
        ctx.closePath();
        ctx.fill();

        // Dress top
        ctx.fillStyle = this.dressColor;
        ctx.beginPath();
        ctx.roundRect(this.width / 2 - 7, screenY + 14, 14, 10, [2, 2, 0, 0]);
        ctx.fill();

        // Dress accent (subtle)
        ctx.strokeStyle = this.dressAccent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, screenY + 18);
        ctx.lineTo(this.width / 2, screenY + 38);
        ctx.stroke();

        // Neck
        ctx.fillStyle = this.skinColor;
        ctx.fillRect(this.width / 2 - 3, screenY + 12, 6, 5);

        // Head
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.arc(this.width / 2, screenY + 8, 9, 0, Math.PI * 2);
        ctx.fill();

        // Hair top
        ctx.fillStyle = this.hairColor;
        ctx.beginPath();
        ctx.arc(this.width / 2, screenY + 5, 10, Math.PI, Math.PI * 2);
        ctx.fill();

        // Bangs
        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 9, screenY + 6);
        ctx.quadraticCurveTo(this.width / 2 - 5, screenY + 10, this.width / 2 - 2, screenY + 6);
        ctx.quadraticCurveTo(this.width / 2 + 2, screenY + 9, this.width / 2 + 5, screenY + 5);
        ctx.quadraticCurveTo(this.width / 2 + 8, screenY + 8, this.width / 2 + 9, screenY + 6);
        ctx.lineTo(this.width / 2 + 10, screenY + 3);
        ctx.lineTo(this.width / 2 - 10, screenY + 3);
        ctx.closePath();
        ctx.fill();

        // Side hair strands
        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 9, screenY + 5);
        ctx.quadraticCurveTo(this.width / 2 - 14 + this.hairSway * 0.3, screenY + 15, this.width / 2 - 11 + this.hairSway * 0.5, screenY + 22);
        ctx.lineTo(this.width / 2 - 9 + this.hairSway * 0.3, screenY + 20);
        ctx.quadraticCurveTo(this.width / 2 - 10, screenY + 12, this.width / 2 - 8, screenY + 6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.width / 2 + 9, screenY + 5);
        ctx.quadraticCurveTo(this.width / 2 + 14 - this.hairSway * 0.3, screenY + 15, this.width / 2 + 11 - this.hairSway * 0.5, screenY + 22);
        ctx.lineTo(this.width / 2 + 9 - this.hairSway * 0.3, screenY + 20);
        ctx.quadraticCurveTo(this.width / 2 + 10, screenY + 12, this.width / 2 + 8, screenY + 6);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#3d3d3d";
        const blinkChance = Math.random();
        if (blinkChance > 0.005) {
            ctx.beginPath();
            ctx.arc(this.width / 2 - 3, screenY + 8, 1.5, 0, Math.PI * 2);
            ctx.arc(this.width / 2 + 3, screenY + 8, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rosy cheeks
        ctx.fillStyle = "rgba(220, 150, 150, 0.35)";
        ctx.beginPath();
        ctx.ellipse(this.width / 2 - 6, screenY + 10, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(this.width / 2 + 6, screenY + 10, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Small smile
        ctx.strokeStyle = "#c9a090";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.width / 2, screenY + 11, 2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    getWorldX() {
        return this.x;
    }

    setBaseY(y) {
        this.baseY = y;
        if (!this.isJumping) {
            this.y = y;
        }
    }

    setWorldBounds(min, max) {
        this.worldMin = min;
        this.worldMax = max;
    }
}

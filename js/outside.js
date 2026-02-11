// Outside museum area - walk up, buy ticket, enter
export class Outside {
    constructor(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.worldWidth = 1800;

        // Ticket booth
        this.ticketBooth = { x: 1050 };

        // Museum entrance
        this.entrance = { x: 1500 };

        // State
        this.hasTicket = false;
        this.doorOpen = false;
        this.doorOpenAmount = 0; // 0 to 1 animation

        // Clouds
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            this.clouds.push({
                x: Math.random() * this.worldWidth,
                y: 20 + Math.random() * 40,
                width: 60 + Math.random() * 80,
                speed: 0.1 + Math.random() * 0.15
            });
        }

        // Trees
        this.trees = [
            { x: 150, size: 1.0 },
            { x: 350, size: 0.8 },
            { x: 550, size: 1.1 },
            { x: 750, size: 0.9 }
        ];
    }

    update(deltaTime) {
        // Animate clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.worldWidth + 100) {
                cloud.x = -cloud.width;
            }
        });

        // Animate door opening
        if (this.doorOpen && this.doorOpenAmount < 1) {
            this.doorOpenAmount = Math.min(1, this.doorOpenAmount + 0.02);
        }
    }

    buyTicket() {
        if (!this.hasTicket) {
            this.hasTicket = true;
            this.doorOpen = true;
            return true;
        }
        return false;
    }

    isNearTicketBooth(playerX) {
        return Math.abs(playerX - this.ticketBooth.x) < 80;
    }

    isNearEntrance(playerX) {
        return Math.abs(playerX - this.entrance.x) < 80;
    }

    canEnter() {
        return this.hasTicket && this.doorOpenAmount > 0.8;
    }

    draw(ctx, cameraX, playerX) {
        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.screenHeight * 0.65);
        skyGrad.addColorStop(0, '#1a1a3a');
        skyGrad.addColorStop(0.4, '#2a2a5a');
        skyGrad.addColorStop(0.7, '#4a3a6a');
        skyGrad.addColorStop(1, '#6a4a7a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // Stars
        this.drawStars(ctx, cameraX);

        // Moon
        this.drawMoon(ctx, cameraX);

        // Clouds
        this.drawClouds(ctx, cameraX);

        // Distant cityscape
        this.drawCityscape(ctx, cameraX);

        // Ground
        this.drawGround(ctx, cameraX);

        // Trees
        this.drawTrees(ctx, cameraX);

        // Museum building
        this.drawMuseumBuilding(ctx, cameraX, playerX);

        // Ticket booth
        this.drawTicketBooth(ctx, cameraX, playerX);

        // Pathway
        this.drawPathway(ctx, cameraX);
    }

    drawStars(ctx, cameraX) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const starPositions = [
            [100, 20], [250, 45], [400, 15], [550, 55], [700, 30],
            [850, 50], [1000, 25], [1200, 40], [1400, 20], [1600, 50],
            [180, 60], [320, 35], [480, 65], [630, 18], [780, 42]
        ];
        starPositions.forEach(([x, y]) => {
            const screenX = x - cameraX * 0.3; // Parallax
            if (screenX > -10 && screenX < this.screenWidth + 10) {
                const twinkle = 0.4 + Math.sin(Date.now() * 0.003 + x) * 0.4;
                ctx.globalAlpha = twinkle;
                ctx.beginPath();
                ctx.arc(screenX, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
    }

    drawMoon(ctx, cameraX) {
        const moonX = 900 - cameraX * 0.2;
        const moonY = 50;

        // Moon glow
        const glow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 80);
        glow.addColorStop(0, 'rgba(255, 240, 200, 0.15)');
        glow.addColorStop(1, 'rgba(255, 240, 200, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
        ctx.fill();

        // Moon body
        ctx.fillStyle = '#f5ecd0';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
        ctx.fill();

        // Moon craters
        ctx.fillStyle = 'rgba(200, 190, 160, 0.3)';
        ctx.beginPath();
        ctx.arc(moonX - 6, moonY - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + 8, moonY + 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawClouds(ctx, cameraX) {
        this.clouds.forEach(cloud => {
            const screenX = cloud.x - cameraX * 0.4;
            if (screenX < -cloud.width - 20 || screenX > this.screenWidth + 20) return;

            ctx.fillStyle = 'rgba(60, 50, 80, 0.4)';
            ctx.beginPath();
            ctx.ellipse(screenX, cloud.y, cloud.width / 2, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(screenX - cloud.width * 0.25, cloud.y + 5, cloud.width * 0.3, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(screenX + cloud.width * 0.25, cloud.y + 3, cloud.width * 0.35, 13, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawCityscape(ctx, cameraX) {
        const groundY = this.screenHeight * 0.65;
        ctx.fillStyle = 'rgba(20, 15, 30, 0.6)';

        // Distant buildings silhouettes
        const buildings = [
            { x: 80, w: 40, h: 50 },
            { x: 140, w: 30, h: 70 },
            { x: 190, w: 50, h: 40 },
            { x: 600, w: 35, h: 60 },
            { x: 650, w: 45, h: 45 },
            { x: 1350, w: 40, h: 55 },
            { x: 1410, w: 30, h: 35 }
        ];
        buildings.forEach(b => {
            const sx = b.x - cameraX * 0.5;
            if (sx > -60 && sx < this.screenWidth + 60) {
                ctx.fillRect(sx, groundY - b.h, b.w, b.h);
            }
        });
    }

    drawGround(ctx, cameraX) {
        const groundY = this.screenHeight * 0.65;

        // Grass area
        const grassGrad = ctx.createLinearGradient(0, groundY, 0, this.screenHeight);
        grassGrad.addColorStop(0, '#2a3a2a');
        grassGrad.addColorStop(0.3, '#1a2a1a');
        grassGrad.addColorStop(1, '#151f15');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, groundY, this.screenWidth, this.screenHeight - groundY);

        // Grass top edge
        ctx.fillStyle = '#3a4a3a';
        ctx.fillRect(0, groundY, this.screenWidth, 3);

        // Sidewalk in front of museum
        const walkStart = 900 - cameraX;
        const walkEnd = 1700 - cameraX;
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(walkStart, this.screenHeight * 0.75 - 5, walkEnd - walkStart, this.screenHeight * 0.25 + 5);

        // Sidewalk lines
        ctx.fillStyle = '#555';
        for (let x = 900; x < 1700; x += 80) {
            const sx = x - cameraX;
            ctx.fillRect(sx, this.screenHeight * 0.75 - 5, 2, this.screenHeight * 0.25);
        }
    }

    drawTrees(ctx, cameraX) {
        this.trees.forEach(tree => {
            const screenX = tree.x - cameraX;
            if (screenX < -80 || screenX > this.screenWidth + 80) return;

            const groundY = this.screenHeight * 0.65;
            const s = tree.size;

            // Trunk
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(screenX - 4 * s, groundY - 40 * s, 8 * s, 40 * s);

            // Foliage layers (dark nighttime)
            ctx.fillStyle = '#1a3a1a';
            ctx.beginPath();
            ctx.arc(screenX, groundY - 50 * s, 25 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1a3518';
            ctx.beginPath();
            ctx.arc(screenX - 10 * s, groundY - 40 * s, 20 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(screenX + 12 * s, groundY - 42 * s, 18 * s, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawMuseumBuilding(ctx, cameraX, playerX) {
        const buildX = this.entrance.x - cameraX;
        const groundY = this.screenHeight * 0.65;
        const buildWidth = 300;
        const buildHeight = groundY - 80;
        const buildLeft = buildX - buildWidth / 2;

        if (buildLeft > this.screenWidth + 50 || buildLeft + buildWidth < -50) return;

        // Building body
        ctx.fillStyle = '#3a3028';
        ctx.fillRect(buildLeft, 80, buildWidth, buildHeight);

        // Pillars
        ctx.fillStyle = '#4a4038';
        for (let i = 0; i < 4; i++) {
            const px = buildLeft + 30 + i * 80;
            ctx.fillRect(px, 100, 16, buildHeight - 20);

            // Pillar cap
            ctx.fillStyle = '#5a5048';
            ctx.fillRect(px - 4, 95, 24, 10);
            ctx.fillStyle = '#4a4038';
        }

        // Roof/pediment
        ctx.fillStyle = '#4a4038';
        ctx.beginPath();
        ctx.moveTo(buildLeft - 10, 90);
        ctx.lineTo(buildX, 50);
        ctx.lineTo(buildLeft + buildWidth + 10, 90);
        ctx.closePath();
        ctx.fill();

        // Roof border
        ctx.fillStyle = '#5a5048';
        ctx.fillRect(buildLeft - 10, 85, buildWidth + 20, 10);

        // "MEMORY LANE" text on building
        ctx.fillStyle = '#c9b896';
        ctx.font = "bold 14px 'Crimson Text', serif";
        ctx.textAlign = 'center';
        ctx.fillText('MEMORY LANE', buildX, 78);

        // Museum subtitle
        ctx.fillStyle = '#9a8a6a';
        ctx.font = "italic 9px 'Crimson Text', serif";
        ctx.fillText('Museum of Memories', buildX, 92);

        // Windows (lit from inside, warm glow)
        const windowY = 120;
        for (let i = 0; i < 3; i++) {
            const wx = buildLeft + 50 + i * 90;
            // Window glow
            ctx.fillStyle = 'rgba(255, 220, 150, 0.15)';
            ctx.fillRect(wx - 20, windowY, 40, 50);
            // Window frame
            ctx.strokeStyle = '#5a5048';
            ctx.lineWidth = 2;
            ctx.strokeRect(wx - 16, windowY + 4, 32, 42);
            // Cross bar
            ctx.beginPath();
            ctx.moveTo(wx, windowY + 4);
            ctx.lineTo(wx, windowY + 46);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(wx - 16, windowY + 25);
            ctx.lineTo(wx + 16, windowY + 25);
            ctx.stroke();
        }

        // Entrance door
        const doorWidth = 60;
        const doorHeight = groundY - 200;
        const doorLeft = buildX - doorWidth / 2;
        const doorTop = 200;

        // Door frame
        ctx.fillStyle = '#5a5048';
        ctx.fillRect(doorLeft - 8, doorTop - 8, doorWidth + 16, doorHeight + 16);

        if (this.doorOpen) {
            // Open door — show warm interior glow
            const interiorGlow = ctx.createRadialGradient(
                buildX, doorTop + doorHeight / 2, 0,
                buildX, doorTop + doorHeight / 2, doorWidth * 1.5
            );
            interiorGlow.addColorStop(0, `rgba(245, 230, 211, ${0.3 * this.doorOpenAmount})`);
            interiorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = interiorGlow;
            ctx.fillRect(doorLeft, doorTop, doorWidth, doorHeight);

            // Interior warm color
            ctx.fillStyle = `rgba(200, 170, 120, ${0.2 * this.doorOpenAmount})`;
            ctx.fillRect(doorLeft, doorTop, doorWidth, doorHeight);

            // Steps inside visible
            for (let i = 0; i < 3; i++) {
                const stepAlpha = 0.1 * this.doorOpenAmount;
                ctx.fillStyle = `rgba(180, 150, 110, ${stepAlpha})`;
                ctx.fillRect(doorLeft + 5, doorTop + doorHeight - 10 - i * 8, doorWidth - 10, 3);
            }
        } else {
            // Closed/dark door — can't see inside
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(doorLeft, doorTop, doorWidth, doorHeight);

            // Door panels
            ctx.strokeStyle = '#1a1a1f';
            ctx.lineWidth = 1;
            ctx.strokeRect(doorLeft + 5, doorTop + 5, doorWidth / 2 - 8, doorHeight / 2 - 8);
            ctx.strokeRect(doorLeft + doorWidth / 2 + 3, doorTop + 5, doorWidth / 2 - 8, doorHeight / 2 - 8);
            ctx.strokeRect(doorLeft + 5, doorTop + doorHeight / 2 + 3, doorWidth / 2 - 8, doorHeight / 2 - 8);
            ctx.strokeRect(doorLeft + doorWidth / 2 + 3, doorTop + doorHeight / 2 + 3, doorWidth / 2 - 8, doorHeight / 2 - 8);

            // Door handle
            ctx.fillStyle = '#c9a84c';
            ctx.beginPath();
            ctx.arc(doorLeft + doorWidth - 12, doorTop + doorHeight / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Steps in front of door
        ctx.fillStyle = '#4a4038';
        for (let i = 0; i < 3; i++) {
            const stepWidth = doorWidth + 20 + i * 16;
            const stepX = buildX - stepWidth / 2;
            ctx.fillRect(stepX, groundY - i * 6 - 5, stepWidth, 6);
        }

        // Entrance glow when nearby
        const nearEntrance = Math.abs(playerX - this.entrance.x) < 80;
        if (nearEntrance && this.hasTicket) {
            ctx.strokeStyle = 'rgba(245, 230, 211, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(doorLeft - 10, doorTop - 10, doorWidth + 20, doorHeight + 20);
        }

        // Lanterns beside door
        this.drawLantern(ctx, doorLeft - 15, doorTop + 10);
        this.drawLantern(ctx, doorLeft + doorWidth + 8, doorTop + 10);
    }

    drawLantern(ctx, x, y) {
        const flicker = 0.7 + Math.sin(Date.now() * 0.004 + x) * 0.3;

        // Bracket
        ctx.fillStyle = '#3a3028';
        ctx.fillRect(x, y, 6, 3);
        ctx.fillRect(x + 2, y + 3, 2, 8);

        // Lantern body
        ctx.fillStyle = '#4a3a28';
        ctx.fillRect(x - 1, y + 11, 8, 12);

        // Light
        const glow = ctx.createRadialGradient(x + 3, y + 17, 0, x + 3, y + 17, 25 * flicker);
        glow.addColorStop(0, `rgba(255, 200, 80, ${0.4 * flicker})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 3, y + 17, 25 * flicker, 0, Math.PI * 2);
        ctx.fill();

        // Inner flame
        ctx.fillStyle = `rgba(255, 220, 100, ${0.8 * flicker})`;
        ctx.beginPath();
        ctx.arc(x + 3, y + 17, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTicketBooth(ctx, cameraX, playerX) {
        const boothX = this.ticketBooth.x - cameraX;
        if (boothX < -100 || boothX > this.screenWidth + 100) return;

        const groundY = this.screenHeight * 0.65;
        const boothWidth = 80;
        const boothHeight = 90;
        const boothTop = groundY - boothHeight;
        const isNearby = Math.abs(playerX - this.ticketBooth.x) < 80;

        // Booth shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(boothX, groundY + 2, 45, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Booth body
        ctx.fillStyle = '#5a3028';
        ctx.fillRect(boothX - boothWidth / 2, boothTop, boothWidth, boothHeight);

        // Roof
        ctx.fillStyle = '#6a4038';
        ctx.beginPath();
        ctx.moveTo(boothX - boothWidth / 2 - 10, boothTop);
        ctx.lineTo(boothX, boothTop - 20);
        ctx.lineTo(boothX + boothWidth / 2 + 10, boothTop);
        ctx.closePath();
        ctx.fill();

        // Window opening
        ctx.fillStyle = '#2a1a10';
        ctx.fillRect(boothX - 20, boothTop + 15, 40, 25);

        // Window frame
        ctx.strokeStyle = '#7a5038';
        ctx.lineWidth = 2;
        ctx.strokeRect(boothX - 20, boothTop + 15, 40, 25);

        // Counter
        ctx.fillStyle = '#7a5038';
        ctx.fillRect(boothX - boothWidth / 2 - 5, boothTop + 42, boothWidth + 10, 6);

        // "TICKETS" text
        ctx.fillStyle = this.hasTicket ? '#6a8a6a' : '#c9b896';
        ctx.font = "bold 9px 'Quicksand', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(this.hasTicket ? '✓ SOLD' : 'TICKETS', boothX, boothTop + 60);

        // Ticket stack on counter
        if (!this.hasTicket) {
            ctx.fillStyle = '#f5ecd0';
            ctx.fillRect(boothX - 10, boothTop + 38, 20, 4);
            ctx.fillStyle = '#e8dcc0';
            ctx.fillRect(boothX - 9, boothTop + 36, 18, 4);
        }

        // Light on top
        const flicker = 0.7 + Math.sin(Date.now() * 0.003) * 0.3;
        const boothLight = ctx.createRadialGradient(boothX, boothTop - 5, 0, boothX, boothTop - 5, 40 * flicker);
        boothLight.addColorStop(0, `rgba(255, 200, 80, ${0.2 * flicker})`);
        boothLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = boothLight;
        ctx.beginPath();
        ctx.arc(boothX, boothTop - 5, 40 * flicker, 0, Math.PI * 2);
        ctx.fill();

        // Glow when nearby
        if (isNearby && !this.hasTicket) {
            ctx.strokeStyle = 'rgba(249, 220, 100, 0.5)';
            ctx.lineWidth = 3;
            ctx.strokeRect(boothX - boothWidth / 2 - 6, boothTop - 22, boothWidth + 12, boothHeight + 24);
        }
    }

    drawPathway(ctx, cameraX) {
        const groundY = this.screenHeight * 0.75;

        // Brick path leading to museum
        ctx.fillStyle = '#3a3030';
        for (let x = 800; x < 1250; x += 25) {
            const sx = x - cameraX;
            if (sx < -30 || sx > this.screenWidth + 30) continue;
            const y = groundY + Math.sin(x * 0.02) * 2;
            ctx.fillRect(sx, y, 22, 10);
            ctx.fillRect(sx + 11, y + 12, 22, 10);
        }
    }
}

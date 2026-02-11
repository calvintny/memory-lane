import { pictures, frameConfig } from './pictures.js';

// Museum environment rendering
export class Museum {
    constructor(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.worldWidth = 5200;

        // Colors
        this.colors = {
            ceiling: "#2d3446",
            wall: "#e8ddd0",
            wallAccent: "#d9cec0",
            floor: "#8b7355",
            floorAccent: "#7a6348",
            molding: "#c4b5a0",
            baseboard: "#6b5c4a"
        };

        // Decorative elements
        this.plants = this.generatePlants();
        this.lights = this.generateLights();
        this.benches = this.generateBenches();

        // Booths
        this.welcomeBooth = { x: 120 };
        this.valentineBooth = { x: 4550 };

        // Secret door
        this.secretDoor = {
            x: 4900,
            chainsRemaining: 3,
            shakeTimer: 0,
            broken: false
        };

        // Image cache for picture frames
        this.imageCache = {};
        this.loadPictureImages();
    }

    loadPictureImages() {
        pictures.forEach(pic => {
            if (pic.imagePath && !this.imageCache[pic.imagePath]) {
                const img = new Image();
                img.onload = () => {
                    this.imageCache[pic.imagePath] = img;
                };
                img.src = pic.imagePath;
            }
        });
    }

    generatePlants() {
        const plants = [];
        const positions = [350, 1000, 1800, 2700, 3500, 4200];
        positions.forEach((x, i) => {
            plants.push({
                x: x,
                type: i % 2 === 0 ? 'tall' : 'short',
                sway: Math.random() * Math.PI * 2
            });
        });
        return plants;
    }

    generateLights() {
        const lights = [];
        for (let x = 300; x < this.worldWidth; x += 400) {
            lights.push({ x: x, flicker: Math.random() });
        }
        return lights;
    }

    generateBenches() {
        return [
            { x: 700 },
            { x: 1500 },
            { x: 2400 },
            { x: 3300 },
            { x: 4000 }
        ];
    }

    update(deltaTime) {
        // Animate plants
        this.plants.forEach(plant => {
            plant.sway += deltaTime * 0.001;
        });

        // Animate lights
        this.lights.forEach(light => {
            light.flicker = 0.9 + Math.sin(Date.now() * 0.003 + light.x) * 0.1;
        });

        // Shake timer for door
        if (this.secretDoor.shakeTimer > 0) {
            this.secretDoor.shakeTimer -= deltaTime;
        }
    }

    draw(ctx, cameraX, playerX) {
        // Background gradient (far wall) - STATIC, no parallax
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
        bgGradient.addColorStop(0, this.colors.ceiling);
        bgGradient.addColorStop(0.15, this.colors.ceiling);
        bgGradient.addColorStop(0.18, this.colors.wall);
        bgGradient.addColorStop(0.75, this.colors.wallAccent);
        bgGradient.addColorStop(0.78, this.colors.floor);
        bgGradient.addColorStop(1, this.colors.floorAccent);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // Crown molding
        ctx.fillStyle = this.colors.molding;
        ctx.fillRect(0, this.screenHeight * 0.15, this.screenWidth, 8);

        // Ceiling detail line
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, this.screenHeight * 0.15 + 8, this.screenWidth, 2);

        // Baseboard
        ctx.fillStyle = this.colors.baseboard;
        ctx.fillRect(0, this.screenHeight * 0.75 - 12, this.screenWidth, 12);

        // Floor tiles pattern
        this.drawFloorTiles(ctx, cameraX);

        // Draw lights (behind everything else)
        this.drawLights(ctx, cameraX);

        // Draw welcome booth
        this.drawWelcomeBooth(ctx, cameraX);

        // Draw picture frames
        this.drawPictureFrames(ctx, cameraX, playerX);

        // Draw benches
        this.drawBenches(ctx, cameraX);

        // Draw plants
        this.drawPlants(ctx, cameraX);

        // Draw valentine booth at the end
        this.drawValentineBooth(ctx, cameraX, playerX);

        // Draw secret door
        this.drawSecretDoor(ctx, cameraX, playerX);
    }

    drawFloorTiles(ctx, cameraX) {
        const tileWidth = 80;
        const floorY = this.screenHeight * 0.78;
        const floorHeight = this.screenHeight * 0.22;

        for (let x = -cameraX % tileWidth - tileWidth; x < this.screenWidth + tileWidth; x += tileWidth) {
            const tileIndex = Math.floor((x + cameraX) / tileWidth);
            ctx.fillStyle = tileIndex % 2 === 0 ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.03)";
            ctx.fillRect(x, floorY, tileWidth - 2, floorHeight);
        }
    }

    drawLights(ctx, cameraX) {
        this.lights.forEach(light => {
            const screenX = light.x - cameraX;
            if (screenX < -50 || screenX > this.screenWidth + 50) return;

            const ceilingY = this.screenHeight * 0.15;

            // Light fixture
            ctx.fillStyle = "#4a4a4a";
            ctx.fillRect(screenX - 3, ceilingY, 6, 15);

            // Light bulb glow
            const glowRadius = 35 * light.flicker;
            const gradient = ctx.createRadialGradient(
                screenX, ceilingY + 20, 0,
                screenX, ceilingY + 20, glowRadius
            );
            gradient.addColorStop(0, `rgba(255, 248, 220, ${0.4 * light.flicker})`);
            gradient.addColorStop(1, "rgba(255, 248, 220, 0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX, ceilingY + 20, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Light cone on floor
            const floorGradient = ctx.createRadialGradient(
                screenX, this.screenHeight * 0.85, 0,
                screenX, this.screenHeight * 0.85, 80
            );
            floorGradient.addColorStop(0, `rgba(255, 248, 220, ${0.1 * light.flicker})`);
            floorGradient.addColorStop(1, "rgba(255, 248, 220, 0)");
            ctx.fillStyle = floorGradient;
            ctx.beginPath();
            ctx.ellipse(screenX, this.screenHeight * 0.85, 80, 30, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawWelcomeBooth(ctx, cameraX) {
        const screenX = this.welcomeBooth.x - cameraX;
        if (screenX < -150 || screenX > this.screenWidth + 150) return;

        const boothY = this.screenHeight * 0.45;
        const boothWidth = 100;
        const boothHeight = 120;

        // Booth shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.beginPath();
        ctx.ellipse(screenX, this.screenHeight * 0.75 - 5, 55, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Booth body
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(screenX - boothWidth / 2, boothY, boothWidth, boothHeight);

        // Booth top (curved)
        ctx.fillStyle = "#6b5c4a";
        ctx.beginPath();
        ctx.ellipse(screenX, boothY, boothWidth / 2, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Booth front panel
        ctx.fillStyle = "#7a6b5a";
        ctx.fillRect(screenX - boothWidth / 2 + 5, boothY + 10, boothWidth - 10, 40);

        // "WELCOME" text
        ctx.fillStyle = "#f5e6d3";
        ctx.font = "bold 12px 'Quicksand', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("WELCOME", screenX, boothY + 35);

        // Desk surface
        ctx.fillStyle = "#8b7355";
        ctx.fillRect(screenX - boothWidth / 2 - 5, boothY + 55, boothWidth + 10, 8);

        // Booth legs
        ctx.fillStyle = "#4a3a2a";
        ctx.fillRect(screenX - boothWidth / 2 + 5, boothY + 60, 8, boothHeight - 65);
        ctx.fillRect(screenX + boothWidth / 2 - 13, boothY + 60, 8, boothHeight - 65);

        // Small flower vase
        ctx.fillStyle = "#c9788e";
        ctx.beginPath();
        ctx.moveTo(screenX + 25, boothY + 55);
        ctx.lineTo(screenX + 20, boothY + 45);
        ctx.lineTo(screenX + 30, boothY + 45);
        ctx.closePath();
        ctx.fill();

        // Flower
        ctx.fillStyle = "#e8a0b0";
        ctx.beginPath();
        ctx.arc(screenX + 25, boothY + 42, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawValentineBooth(ctx, cameraX, playerX) {
        const screenX = this.valentineBooth.x - cameraX;
        if (screenX < -150 || screenX > this.screenWidth + 150) return;

        const boothY = this.screenHeight * 0.40;
        const boothWidth = 120;
        const boothHeight = 130;

        // Check if player is nearby
        const distance = Math.abs(playerX - this.valentineBooth.x);
        const isNearby = distance < 100;

        // Booth shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.beginPath();
        ctx.ellipse(screenX, this.screenHeight * 0.75 - 5, 65, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Booth body - golden redemption theme
        ctx.fillStyle = "#8b6a3a";
        ctx.fillRect(screenX - boothWidth / 2, boothY, boothWidth, boothHeight);

        // Booth top (curved)
        ctx.fillStyle = "#a07a4a";
        ctx.beginPath();
        ctx.ellipse(screenX, boothY, boothWidth / 2, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Star on top
        ctx.fillStyle = "#e8c050";
        ctx.font = "18px serif";
        ctx.textAlign = "center";
        ctx.fillText("⭐", screenX, boothY - 18);

        // Booth front panel
        ctx.fillStyle = "#9a7a4a";
        ctx.fillRect(screenX - boothWidth / 2 + 8, boothY + 12, boothWidth - 16, 45);

        // "LUCKY CARD" and "REDEMPTION" text
        ctx.fillStyle = "#f5e6d3";
        ctx.font = "bold 10px 'Quicksand', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("LUCKY CARD", screenX, boothY + 30);
        ctx.fillText("REDEMPTION", screenX, boothY + 43);

        // Small stars decoration
        ctx.fillStyle = "#e8c050";
        ctx.font = "10px serif";
        ctx.fillText("✦", screenX - 38, boothY + 37);
        ctx.fillText("✦", screenX + 38, boothY + 37);

        // Desk surface
        ctx.fillStyle = "#7a5a30";
        ctx.fillRect(screenX - boothWidth / 2 - 8, boothY + 62, boothWidth + 16, 10);

        // Scratch card on desk
        ctx.fillStyle = "#c8a860";
        ctx.fillRect(screenX - 20, boothY + 48, 40, 14);
        ctx.fillStyle = "#b89850";
        ctx.fillRect(screenX - 18, boothY + 51, 36, 2);
        ctx.fillRect(screenX - 18, boothY + 55, 25, 2);
        ctx.fillRect(screenX - 18, boothY + 59, 30, 2);

        // Coin
        ctx.fillStyle = "#daa520";
        ctx.beginPath();
        ctx.arc(screenX + 28, boothY + 56, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Booth legs
        ctx.fillStyle = "#6a4a2a";
        ctx.fillRect(screenX - boothWidth / 2 + 8, boothY + 70, 10, boothHeight - 75);
        ctx.fillRect(screenX + boothWidth / 2 - 18, boothY + 70, 10, boothHeight - 75);

        // Gift box on booth
        ctx.fillStyle = "#c94050";
        ctx.fillRect(screenX - 38, boothY + 48, 14, 14);
        ctx.fillStyle = "#e8c050";
        ctx.fillRect(screenX - 38, boothY + 54, 14, 2);
        ctx.fillRect(screenX - 32, boothY + 48, 2, 14);

        // Glow effect when nearby
        if (isNearby) {
            ctx.strokeStyle = "rgba(232, 192, 80, 0.5)";
            ctx.lineWidth = 4;
            ctx.strokeRect(screenX - boothWidth / 2 - 8, boothY - 20, boothWidth + 16, boothHeight + 25);

            // Floating sparkles
            const time = Date.now() * 0.002;
            ctx.fillStyle = "rgba(232, 192, 80, 0.7)";
            ctx.font = "12px serif";
            for (let i = 0; i < 3; i++) {
                const sparkleX = screenX + Math.sin(time + i * 2) * 40;
                const sparkleY = boothY - 35 + Math.cos(time * 0.5 + i) * 10;
                ctx.fillText("✦", sparkleX, sparkleY);
            }
        }
    }

    drawHeart(ctx, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x, y - size * 0.3, x - size, y - size * 0.3, x - size, y + size * 0.2);
        ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size);
        ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.2);
        ctx.bezierCurveTo(x + size, y - size * 0.3, x, y - size * 0.3, x, y + size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawPictureFrames(ctx, cameraX, playerX) {
        pictures.forEach(pic => {
            const screenX = pic.x - cameraX;
            if (screenX < -200 || screenX > this.screenWidth + 200) return;

            const frameY = this.screenHeight * 0.22;
            const { width, height, borderWidth } = frameConfig;

            // Check if player is nearby
            const distance = Math.abs(playerX - pic.x);
            const isNearby = distance < frameConfig.interactionRadius;

            // Frame shadow
            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.fillRect(screenX - width / 2 + 6, frameY + 6, width + borderWidth * 2, height + borderWidth * 2);

            // Outer frame
            ctx.fillStyle = pic.frameColor;
            ctx.fillRect(screenX - width / 2 - borderWidth, frameY - borderWidth, width + borderWidth * 2, height + borderWidth * 2);

            // Inner frame accent
            ctx.fillStyle = pic.accentColor;
            ctx.fillRect(screenX - width / 2 - borderWidth / 2, frameY - borderWidth / 2, width + borderWidth, height + borderWidth);

            // Picture area (cream background)
            ctx.fillStyle = "#f8f4ef";
            ctx.fillRect(screenX - width / 2, frameY, width, height);

            // Draw image if available, otherwise abstract art
            if (pic.imagePath && this.imageCache[pic.imagePath]) {
                this.drawImageCover(ctx, this.imageCache[pic.imagePath], screenX - width / 2, frameY, width, height);
            } else {
                this.drawAbstractArt(ctx, screenX - width / 2, frameY, width, height, pic.id, pic.accentColor);
            }

            // Highlight glow when nearby
            if (isNearby) {
                ctx.strokeStyle = "rgba(255, 248, 220, 0.7)";
                ctx.lineWidth = 4;
                ctx.strokeRect(screenX - width / 2 - borderWidth - 5, frameY - borderWidth - 5, width + borderWidth * 2 + 10, height + borderWidth * 2 + 10);

                // Sparkle effect
                const sparkleTime = Date.now() * 0.003;
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                for (let i = 0; i < 4; i++) {
                    const angle = sparkleTime + i * Math.PI / 2;
                    const sparkleX = screenX + Math.cos(angle) * (width / 2 + 25);
                    const sparkleY = frameY + height / 2 + Math.sin(angle) * (height / 2 + 20);
                    ctx.beginPath();
                    ctx.arc(sparkleX, sparkleY, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }

    drawAbstractArt(ctx, x, y, width, height, seed, accentColor) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        const random = (n) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

        // Background tone
        ctx.fillStyle = `rgba(${128 + random(60)}, ${128 + random(60)}, ${128 + random(60)}, 0.3)`;
        ctx.fillRect(x, y, width, height);

        // Abstract shapes
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.5;

        // Circle
        ctx.beginPath();
        ctx.arc(x + width * 0.3 + random(width * 0.4), y + height * 0.3 + random(height * 0.4), 20 + random(25), 0, Math.PI * 2);
        ctx.fill();

        // Rectangle
        ctx.fillStyle = `rgba(${60 + random(60)}, ${60 + random(60)}, ${80 + random(60)}, 0.4)`;
        ctx.fillRect(x + width * 0.4, y + height * 0.35, 40 + random(25), 35 + random(20));

        // Line
        ctx.strokeStyle = `rgba(${40 + random(40)}, ${40 + random(40)}, ${40 + random(40)}, 0.6)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + height - 20);
        ctx.lineTo(x + width - 15, y + 25 + random(25));
        ctx.stroke();

        ctx.restore();
    }

    // Draw image with cover-fit (fill container, maintain aspect ratio, crop excess)
    drawImageCover(ctx, img, x, y, containerWidth, containerHeight) {
        const imgRatio = img.width / img.height;
        const containerRatio = containerWidth / containerHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > containerRatio) {
            // Image is wider - fit height, crop width
            drawHeight = containerHeight;
            drawWidth = containerHeight * imgRatio;
            offsetX = x - (drawWidth - containerWidth) / 2;
            offsetY = y;
        } else {
            // Image is taller - fit width, crop height
            drawWidth = containerWidth;
            drawHeight = containerWidth / imgRatio;
            offsetX = x;
            offsetY = y - (drawHeight - containerHeight) / 2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, containerWidth, containerHeight);
        ctx.clip();
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
    }

    drawBenches(ctx, cameraX) {
        this.benches.forEach(bench => {
            const screenX = bench.x - cameraX;
            if (screenX < -100 || screenX > this.screenWidth + 100) return;

            const benchY = this.screenHeight * 0.68;

            // Bench shadow
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.beginPath();
            ctx.ellipse(screenX, this.screenHeight * 0.75 - 5, 40, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Bench seat
            ctx.fillStyle = "#5a4a3a";
            ctx.fillRect(screenX - 35, benchY, 70, 8);

            // Bench legs
            ctx.fillRect(screenX - 30, benchY + 8, 6, 25);
            ctx.fillRect(screenX + 24, benchY + 8, 6, 25);

            // Seat highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(screenX - 35, benchY, 70, 2);
        });
    }

    drawPlants(ctx, cameraX) {
        this.plants.forEach(plant => {
            const screenX = plant.x - cameraX;
            if (screenX < -50 || screenX > this.screenWidth + 50) return;

            const baseY = this.screenHeight * 0.75 - 15;
            const sway = Math.sin(plant.sway) * 2;

            // Pot
            ctx.fillStyle = "#8b5a3a";
            ctx.beginPath();
            ctx.moveTo(screenX - 12, baseY);
            ctx.lineTo(screenX - 15, baseY + 20);
            ctx.lineTo(screenX + 15, baseY + 20);
            ctx.lineTo(screenX + 12, baseY);
            ctx.closePath();
            ctx.fill();

            // Pot rim
            ctx.fillStyle = "#9e6b4a";
            ctx.fillRect(screenX - 14, baseY - 3, 28, 5);

            // Plant
            if (plant.type === 'tall') {
                ctx.fillStyle = "#5a7a5a";
                for (let i = 0; i < 5; i++) {
                    const leafAngle = (i - 2) * 0.3 + sway * 0.05;
                    const leafLength = 25 + (i % 2) * 10;
                    ctx.save();
                    ctx.translate(screenX, baseY - 5);
                    ctx.rotate(leafAngle);
                    ctx.beginPath();
                    ctx.ellipse(0, -leafLength / 2, 6, leafLength / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            } else {
                ctx.fillStyle = "#6a8a6a";
                ctx.beginPath();
                ctx.arc(screenX + sway, baseY - 15, 18, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#5a7a5a";
                ctx.beginPath();
                ctx.arc(screenX - 5 + sway, baseY - 20, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    getNearbyPicture(playerX) {
        for (const pic of pictures) {
            const distance = Math.abs(playerX - pic.x);
            if (distance < frameConfig.interactionRadius) {
                return pic;
            }
        }
        return null;
    }

    isNearWelcomeBooth(playerX) {
        return Math.abs(playerX - this.welcomeBooth.x) < 100;
    }

    isNearValentineBooth(playerX) {
        return Math.abs(playerX - this.valentineBooth.x) < 100;
    }

    isNearSecretDoor(playerX) {
        return Math.abs(playerX - this.secretDoor.x) < 100;
    }

    breakChain() {
        if (this.secretDoor.chainsRemaining > 0) {
            this.secretDoor.chainsRemaining--;
            this.secretDoor.shakeTimer = 400;
            if (this.secretDoor.chainsRemaining === 0) {
                this.secretDoor.broken = true;
            }
            return this.secretDoor.chainsRemaining;
        }
        return 0;
    }

    isDoorBroken() {
        return this.secretDoor.broken;
    }

    drawSecretDoor(ctx, cameraX, playerX) {
        const door = this.secretDoor;
        const screenX = door.x - cameraX;
        if (screenX < -200 || screenX > this.screenWidth + 200) return;

        const isNearby = Math.abs(playerX - door.x) < 100;
        const wallY = this.screenHeight * 0.15;
        const floorY = this.screenHeight * 0.75;
        const doorWidth = 90;
        const doorHeight = floorY - wallY - 20;
        const doorLeft = screenX - doorWidth / 2;
        const doorTop = wallY + 10;

        // Shake offset
        const shakeX = door.shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
        const shakeY = door.shakeTimer > 0 ? (Math.random() - 0.5) * 3 : 0;

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // Dark archway
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.moveTo(doorLeft, floorY - 12);
        ctx.lineTo(doorLeft, doorTop + 30);
        ctx.quadraticCurveTo(doorLeft, doorTop, screenX, doorTop - 10);
        ctx.quadraticCurveTo(doorLeft + doorWidth, doorTop, doorLeft + doorWidth, doorTop + 30);
        ctx.lineTo(doorLeft + doorWidth, floorY - 12);
        ctx.closePath();
        ctx.fill();

        // Descending stairs inside the archway (visible darkness)
        if (door.broken) {
            for (let i = 0; i < 5; i++) {
                const stepY = floorY - 12 - i * 18;
                const stepAlpha = 0.15 - i * 0.025;
                ctx.fillStyle = `rgba(60, 50, 40, ${stepAlpha})`;
                ctx.fillRect(doorLeft + 8, stepY - 4, doorWidth - 16, 4);
            }
            // Eerie glow from inside
            const innerGlow = ctx.createRadialGradient(
                screenX, floorY - doorHeight / 2, 0,
                screenX, floorY - doorHeight / 2, doorWidth
            );
            innerGlow.addColorStop(0, 'rgba(80, 50, 30, 0.15)');
            innerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = innerGlow;
            ctx.fillRect(doorLeft, doorTop, doorWidth, doorHeight);
        }

        // Stone archway frame
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(doorLeft - 2, floorY - 12);
        ctx.lineTo(doorLeft - 2, doorTop + 30);
        ctx.quadraticCurveTo(doorLeft - 2, doorTop - 5, screenX, doorTop - 15);
        ctx.quadraticCurveTo(doorLeft + doorWidth + 2, doorTop - 5, doorLeft + doorWidth + 2, doorTop + 30);
        ctx.lineTo(doorLeft + doorWidth + 2, floorY - 12);
        ctx.stroke();

        // Stone texture on archway
        ctx.strokeStyle = '#4a3a2a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const stoneY = doorTop + 10 + i * (doorHeight / 6);
            ctx.beginPath();
            ctx.moveTo(doorLeft - 6, stoneY);
            ctx.lineTo(doorLeft + 2, stoneY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(doorLeft + doorWidth - 2, stoneY);
            ctx.lineTo(doorLeft + doorWidth + 6, stoneY);
            ctx.stroke();
        }

        // Keystone at top
        ctx.fillStyle = '#6b5c4a';
        ctx.beginPath();
        ctx.moveTo(screenX - 12, doorTop - 12);
        ctx.lineTo(screenX, doorTop - 22);
        ctx.lineTo(screenX + 12, doorTop - 12);
        ctx.closePath();
        ctx.fill();

        // Chains
        if (door.chainsRemaining > 0) {
            const chainPositions = [
                { y: doorTop + doorHeight * 0.3 },
                { y: doorTop + doorHeight * 0.5 },
                { y: doorTop + doorHeight * 0.7 }
            ];

            for (let i = 0; i < door.chainsRemaining; i++) {
                const chain = chainPositions[i];
                const sag = 8 + i * 3;

                // Chain links
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(doorLeft - 3, chain.y);
                ctx.quadraticCurveTo(screenX, chain.y + sag, doorLeft + doorWidth + 3, chain.y);
                ctx.stroke();

                // Chain link details
                ctx.fillStyle = '#999';
                const linkCount = 8;
                for (let j = 0; j <= linkCount; j++) {
                    const t = j / linkCount;
                    const linkX = doorLeft - 3 + t * (doorWidth + 6);
                    const linkY = chain.y + Math.sin(t * Math.PI) * sag;
                    ctx.beginPath();
                    ctx.ellipse(linkX, linkY, 3, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // "DO NOT ENTER" sign
            const signY = doorTop + doorHeight * 0.15;
            ctx.fillStyle = '#8b2020';
            ctx.beginPath();
            ctx.roundRect(screenX - 40, signY, 80, 28, 3);
            ctx.fill();

            // Sign border
            ctx.strokeStyle = '#6b1010';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - 40, signY, 80, 28);

            ctx.fillStyle = '#f5e6d3';
            ctx.font = "bold 10px 'Quicksand', sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText('DO NOT ENTER', screenX, signY + 18);
        }

        ctx.restore();

        // Glow effect when nearby
        if (isNearby) {
            const glowColor = door.broken ? 'rgba(255, 180, 80, 0.4)' : 'rgba(200, 50, 50, 0.3)';
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(doorLeft - 8, floorY - 12);
            ctx.lineTo(doorLeft - 8, doorTop + 30);
            ctx.quadraticCurveTo(doorLeft - 8, doorTop - 10, screenX, doorTop - 20);
            ctx.quadraticCurveTo(doorLeft + doorWidth + 8, doorTop - 10, doorLeft + doorWidth + 8, doorTop + 30);
            ctx.lineTo(doorLeft + doorWidth + 8, floorY - 12);
            ctx.stroke();
        }
    }
}

class BrickBreaker {
    constructor(options) {
        this.angleListenerFunction = (e) => {
            if (e.code === 'Space') {
                const angle = document.getElementById("angle");
                angle.remove();
                document.removeEventListener("keydown", this.angleListenerFunction);
                this.board.beginGame();
                return;
            }
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                var cardinal = this.board.balls[0].getDirection();
                if (cardinal.angle === 200)
                    return;
                this.board.balls[0].setDirection({ direction: cardinal.direction, angle: cardinal.angle - 1 });
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                var cardinal = this.board.balls[0].getDirection();
                if (cardinal.angle === 340)
                    return;
                this.board.balls[0].setDirection({ direction: cardinal.direction, angle: cardinal.angle + 1 });
            }
            this.updateAngle();
        };
        this.board = new Board(options);
        this.gameOptions = options;
        var pointDynamics = new PointDynamics(new Point({
            x: (options.width - 2) / 2, y: ((options.height - 2) * 0.9) - 2
        }), { direction: Direction.None, angle: 270 });
        var pointDynamics = new PointDynamics(new Point({
            x: (options.width - 2) / 2, y: ((options.height - 2) * 0.9) - 2
        }), { direction: Direction.None, angle: 270 });
        var batDynamics = new BatDynamics(new Bat({
            middlePosition: options.width / 2,
            leftEdge: (options.width - options.batLength - 2) / 2,
            rightEdge: (options.width + options.batLength - 2) / 2,
        }));
        this.board.setBalls([pointDynamics]);
        this.board.setBats([batDynamics]);
        this.board.setBlocks(this.makeBlocks());
        this.board.setup(() => {
            this.makeAngleLine();
            this.anglelisteners();
        });
    }
    makeAngleLine() {
        var angle = document.createElement("div");
        angle.id = "angle";
        angle.style.transformOrigin = "0% 0%";
        angle.style.transform = `rotate(${this.board.balls[0].cardinal.angle}deg)`;
        var top = ((this.gameOptions.height - 2) * 0.9) + 2;
        var left = (this.gameOptions.width - 2) / 2;
        // top = (top - 40 * Math.abs(Math.sin(this.pointDynamics.cardinal.angle))) + 2
        // left = (left - 40 * Math.abs(Math.cos(this.pointDynamics.cardinal.angle)))
        angle.style.top = top + "px";
        angle.style.left = left + "px";
        const board = document.getElementById("board-game");
        board.append(angle);
    }
    anglelisteners() {
        document.addEventListener("keydown", this.angleListenerFunction);
    }
    makeBlocks() {
        var itr = 0;
        var id = 0;
        var offset = 6;
        // this.blockSystem = new BlockSystem({ x: 10, y: 35 }, 4, 65, 25);
        var blockSystem = new BlockSystem({ x: 10, y: 35 }, 4, 65, 25);
        var startPositon = blockSystem.startPositon;
        var numberOfBlocksOnLine = (this.gameOptions.width - startPositon.x * 2) / blockSystem.blockLength;
        var lines = blockSystem.lines;
        numberOfBlocksOnLine = Math.floor(numberOfBlocksOnLine);
        while (itr < lines) {
            // var block = document.createElement("div");
            // block.id = `block${id}`;
            // block.className += "block";
            var left = ((startPositon.x - offset / 2) + (blockSystem.blockLength + 5) * (id % numberOfBlocksOnLine));
            var top = ((startPositon.y - offset / 2) + (blockSystem.blockHeight + 5) * itr);
            // block.style.left = left + "px";
            // block.style.top = top + "px";
            blockSystem.addBlock({ x: left, y: top });
            // block.style.width = this.blockSystem.blockLength + "px";
            // block.style.height = this.blockSystem.blockHeight + "px";
            // board.append(block);
            id++;
            if (id % numberOfBlocksOnLine == 0) {
                itr++;
            }
        }
        return blockSystem;
    }
    updateAngle() {
        var angle = document.getElementById("angle");
        angle.style.transform = `rotate(${this.board.balls[0].cardinal.angle}deg)`;
    }
}
//# sourceMappingURL=BrickBreaker.js.map
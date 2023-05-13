var Direction;
(function (Direction) {
    Direction[Direction["North"] = 1] = "North";
    Direction[Direction["East"] = 2] = "East";
    Direction[Direction["South"] = 3] = "South";
    Direction[Direction["West"] = 4] = "West";
    Direction[Direction["None"] = 5] = "None";
})(Direction || (Direction = {}));
;
function degreesToRadians(degrees) {
    return (degrees % 360) * (Math.PI / 180);
}
function getWholeNumber(number) {
    var decimal = number - Math.floor(number);
    return decimal < 0.5 ? Math.floor(number) : Math.ceil(number);
}
function radiansToDegrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}
class Point {
    constructor(pos) {
        this.x = pos.x;
        this.y = pos.y;
    }
    nextMove(dir) {
        this.x += Math.cos(degreesToRadians(dir.angle));
        this.y += Math.sin(degreesToRadians(dir.angle));
        return this;
    }
}
const defaultAngle = {
    [Direction.North]: 90,
    [Direction.South]: 270,
    [Direction.East]: 180,
    [Direction.West]: 0
};
class PointDynamics {
    constructor(p, dir) {
        this.point = p;
        this.direction = dir.direction;
        this.cardinal = dir;
        this.lastDeflection = DeflectionOption.None;
    }
    setLastDeflection(option) {
        this.lastDeflection = option;
    }
    getPoint() {
        return this.point;
    }
    setPoint(pt) {
        this.point = pt;
    }
    getDirection() {
        return this.cardinal;
    }
    setDirection(dir) {
        this.cardinal = dir;
    }
}
class Bat {
    constructor(bt) {
        this.middlePosition = bt.middlePosition;
        this.leftEdge = bt.leftEdge;
        this.rightEdge = bt.rightEdge;
    }
    move(dir, dx) {
        if (dir === Direction.West) {
            this.leftEdge = this.leftEdge - dx;
            this.middlePosition = this.middlePosition - dx;
            this.rightEdge = this.rightEdge - dx;
        }
        if (dir === Direction.East) {
            this.leftEdge = this.leftEdge + dx;
            this.middlePosition = this.middlePosition + dx;
            this.rightEdge = this.rightEdge + dx;
        }
    }
}
class BatDynamics {
    constructor(b) {
        this.bat = b;
    }
    getBat() {
        return this.bat;
    }
    setBat(bt) {
        this.bat = bt;
    }
}
class Block {
    constructor(position, id) {
        this.position = position;
        this.isActive = true;
        this.id = id;
    }
    getPostion() {
        return this.position;
    }
}
class BlockSystem {
    constructor(start, lines, length, height) {
        this.blocks = [];
        this.startPositon = start;
        this.lines = lines;
        this.blockLength = length;
        this.blockHeight = height;
    }
    getBlocks() {
        return this.blocks;
    }
    hitBlock(id) {
        var blocks = this.blocks.map((x, i) => {
            if (x.id === id) {
                var tmp = x;
                tmp.isActive = false;
                return tmp;
            }
            else
                return x;
        });
        this.blocks = blocks;
    }
    addBlock(position) {
        this.blocks.push(new Block(position, this.blocks.length));
    }
}
/**
 * ENUM SECTION
 */
var DeflectionOption;
(function (DeflectionOption) {
    DeflectionOption[DeflectionOption["Side"] = 0] = "Side";
    DeflectionOption[DeflectionOption["Block"] = 1] = "Block";
    DeflectionOption[DeflectionOption["Bat"] = 2] = "Bat";
    DeflectionOption[DeflectionOption["None"] = 3] = "None";
})(DeflectionOption || (DeflectionOption = {}));
var BatMovementOption;
(function (BatMovementOption) {
    BatMovementOption[BatMovementOption["Left"] = 0] = "Left";
    BatMovementOption[BatMovementOption["Right"] = 1] = "Right";
})(BatMovementOption || (BatMovementOption = {}));
const DEFLECTION = "DEFLECTION";
const BATMOVEMENT = "BATMOVEMENT";
// ////////////////////////////////////////////
class Board {
    constructor(options) {
        this.deflections = 0;
        this.paused = false;
        this.gameOptions = options;
        this.actions = [];
        this.instructions = [];
        let { batLength } = options;
        this.gameOptions.batLength = batLength ? batLength : 100;
        // var defaultPosition = { x: (options.width - 2) / 2, y: ((options.height - 2) * 0.9) - 2 }
        // var defaultDirection = Direction.None
        // this.pointDynamics = new PointDynamics(
        //     new Point(
        //         defaultPosition
        //     ), { direction: defaultDirection, angle: 270 });
        // this.batDynamics = new BatDynamics(
        //     new Bat({
        //         middlePosition: width / 2,
        //         leftEdge: (width - this.gameOptions.batLength - 2) / 2,
        //         rightEdge: (width + this.gameOptions.batLength - 2) / 2,
        //     })
        // )
    }
    setBlocks(blockSystem) {
        this.blockSystem = blockSystem;
    }
    setBalls(balls) {
        this.balls = balls;
    }
    setBats(bats) {
        this.bats = bats;
    }
    getPointDynamicsForTest() {
        return this.pointDynamics;
    }
    setup(setup) {
        console.log();
        var dom = document.getElementById(this.gameOptions.id);
        dom === null || dom === void 0 ? void 0 : dom.classList.add("board-wrapper");
        var board = document.createElement("div");
        board.id = "board-game";
        board === null || board === void 0 ? void 0 : board.classList.add("board-game");
        board.style.width = this.gameOptions.width + "px";
        board.style.height = this.gameOptions.height + "px";
        board.style.borderColor = this.gameOptions.borderColor ? this.gameOptions.borderColor : "#000000";
        dom === null || dom === void 0 ? void 0 : dom.append(board);
        this.createBalls();
        this.createBats();
        this.updateBalls();
        this.updateBlocks();
        setup();
        this.pause();
        this.deflections = 0;
    }
    startListeners() {
        document.addEventListener("keydown", (e) => {
            if (e.code === 'Space') {
                if (this.paused) {
                    this.start();
                }
                else
                    this.pause();
                this.paused = !this.paused;
            }
        });
    }
    beginGame() {
        this.startListeners();
        this.addBatListener();
        this.start();
    }
    start() {
        this.timeout = setInterval(() => {
            this.updateBats();
            this.checkIfBallsAtSide();
            this.bats.map((bat, i) => {
                this.checkIfBatHitsBalls(bat);
            });
            this.checkIfBlocksHitBall();
            this.updateBalls();
            this.updateBlocks();
            var action = this.actions[0];
            action === null || action === void 0 ? void 0 : action.action(action.side);
            this.actions.pop();
        }, 5);
    }
    pause() {
        clearInterval(this.timeout);
    }
    /**
     * Section BALL
     * This is the section that deals with the ball and its dynamics
     */
    createBalls() {
        var board = document.getElementById("board-game");
        this.balls.map((x, i) => {
            var ball = document.createElement("div");
            ball.id = "ball" + i;
            ball.className = "ball";
            board.append(ball);
            ball.style.width = this.gameOptions.ballSize ? this.gameOptions.ballSize + "px"
                : 20 + "px";
            ball.style.height = this.gameOptions.ballSize ? this.gameOptions.ballSize + "px"
                : 20 + "px";
            ball.style.top = (x.getPoint().y - (this.gameOptions.ballSize / 2)) + "px";
            ball.style.left = (x.getPoint().x - (this.gameOptions.ballSize / 2)) + "px";
        });
    }
    updateBalls() {
        this.balls.map((x, i) => {
            var dir = x.getDirection();
            var pt = x.getPoint();
            pt = pt.nextMove(dir);
            x.setPoint(pt);
            var ball = document.getElementById("ball" + i);
            ball.style.top = (x.getPoint().y - (this.gameOptions.ballSize / 2)) + "px";
            ball.style.left = (x.getPoint().x - (this.gameOptions.ballSize / 2)) + "px";
        });
    }
    /**
     * Section Deflections
     * This is the section that deals with the ball and its dynamics
     */
    /**
     * Section Side Deflections
     * This is the section that deals with the dynamics when deflecting off the side
     *
     */
    checkIfBallsAtSide() {
        var _a;
        this.balls.map((obj, i) => {
            var y = obj.getPoint().y;
            var x = obj.getPoint().x;
            var offset = (this.gameOptions.ballSize / 2) - 3;
            var direction = obj.cardinal.direction;
            var top = y < 0.5 ? Math.floor(y) : Math.ceil(y);
            var left = x < 0.5 ? Math.floor(x) : Math.ceil(x);
            const last = obj.lastDeflection;
            // if (last === DeflectionOption.Side) return
            // For the top side
            if ((top === (offset + 1)
                || top === offset)
                && direction !== Direction.North) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Side },
                    side: Direction.North,
                    action: (s) => this.sideDeflect(s, left, obj)
                });
            }
            // For the bottom side
            if ((top === (this.gameOptions.height - (offset + 1))
                || top === this.gameOptions.height - offset)
                && direction !== Direction.South) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Side },
                    side: Direction.South,
                    action: (s) => this.sideDeflect(s, left, obj)
                });
            }
            // For the left side
            if ((left === (offset + 1) ||
                left === offset)
                && direction !== Direction.West) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Side },
                    side: Direction.West,
                    action: (s) => this.sideDeflect(s, top, obj)
                });
            }
            // For the right side
            if ((left === (this.gameOptions.width - (offset + 1))
                || left === this.gameOptions.width - offset)
                && direction !== Direction.East) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Side },
                    side: Direction.East,
                    action: (s) => this.sideDeflect(s, top, obj)
                });
            }
        });
        return (_a = this.actions[0]) === null || _a === void 0 ? void 0 : _a.eventType;
    }
    sideDeflect(dir, pos, pointObj) {
        this.deflections++;
        var cardinal = pointObj.getDirection();
        cardinal.angle = radiansToDegrees(degreesToRadians(cardinal.angle));
        if (dir === Direction.North) {
            if (cardinal.angle === 270) {
                cardinal.angle = 90;
            }
            if (cardinal.angle > 180 && cardinal.angle < 270) {
                cardinal.angle = cardinal.angle - 90;
            }
            if (cardinal.angle > 270 && cardinal.angle < 360) {
                cardinal.angle = cardinal.angle + 90;
            }
        }
        if (dir === Direction.West) {
            if (cardinal.angle > 180 && cardinal.angle < 270) {
                cardinal.angle = cardinal.angle + 90;
            }
            if (cardinal.angle > 90 && cardinal.angle < 180) {
                cardinal.angle = cardinal.angle - 90;
            }
        }
        if (dir === Direction.East) {
            if (cardinal.angle > 270 && cardinal.angle < 360) {
                cardinal.angle = cardinal.angle - 90;
            }
            if (cardinal.angle > 0 && cardinal.angle < 90) {
                cardinal.angle = cardinal.angle + 90;
            }
        }
        if (dir === Direction.South) {
            if (cardinal.angle === 90) {
                cardinal.angle = 270;
            }
            if (cardinal.angle > 90 && cardinal.angle < 180) {
                cardinal.angle = cardinal.angle + 90;
            }
            if (cardinal.angle > 0 && cardinal.angle < 90) {
                cardinal.angle = cardinal.angle + 180;
            }
        }
        cardinal.direction = dir;
        pointObj.setLastDeflection(DeflectionOption.Side);
        pointObj.setDirection(cardinal);
        pointObj.setLastDeflection(DeflectionOption.Side);
    }
    /**
     * Section BAT
     * This is the section that deals with the bat and its dynamics
     */
    createBats() {
        var board = document.getElementById("board-game");
        this.bats.map((x, i) => {
            var bat = document.createElement("div");
            const { batLength, height } = this.gameOptions;
            bat.id = "bat";
            bat.className = "bat";
            board.append(bat);
            bat.style.top = (0.9 * (height)) + "px";
            bat.style.left = x.getBat().leftEdge + 'px';
            bat.style.width = batLength + "px";
            bat.style.height = 10 + "px";
        });
    }
    updateBats() {
        this.bats.map((x, i) => {
            var bat = document.getElementById("bat");
            var batObj = x.getBat();
            bat.style.left = batObj.leftEdge + "px";
        });
    }
    checkIfBatHitsBalls(bat) {
        this.balls.map((ball, i) => {
            var ballX = getWholeNumber(ball.getPoint().x);
            var ballY = getWholeNumber(ball.getPoint().y);
            var direction = ball.cardinal.direction;
            var last = ball.lastDeflection;
            var batX1 = getWholeNumber(bat.getBat().leftEdge);
            var batX2 = getWholeNumber(bat.getBat().rightEdge);
            var batY1 = getWholeNumber(0.9 * this.gameOptions.height);
            var batY2 = batY1 + 10;
            var offset = (this.gameOptions.ballSize / 2) - 3;
            if (last === DeflectionOption.Bat)
                return;
            if ((ballY + offset) === batY1 &&
                ballX >= batX1 && ballX <= batX2) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Bat },
                    side: Direction.North,
                    action: (s) => this.batDeflect(s, ballX - batX1, ballY - batY1, bat, ball, DeflectionOption.Bat)
                });
            }
            // For the bottom side
            if (((ballY - offset - 3) === batY2) &&
                ballX >= batX1 && ballX <= batX2) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Bat },
                    side: Direction.South,
                    action: (s) => this.batDeflect(s, ballX - batX1, ballY - batY1, bat, ball, DeflectionOption.Bat)
                });
            }
            // For the right side
            if ((ballX - offset) === batX2 &&
                ballY >= batY1 && ballY <= batY2) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Bat },
                    side: Direction.East,
                    action: (s) => this.batDeflect(s, ballX - batX1, ballY - batY1, bat, ball, DeflectionOption.Bat)
                });
            }
            // For the left side
            if ((ballX + offset) === batX1 &&
                ballY >= batY1 && ballY <= batY2) {
                this.actions.push({
                    id: DEFLECTION,
                    eventType: { eventOption: DeflectionOption.Bat },
                    side: Direction.West,
                    action: (s) => this.batDeflect(s, ballX - batX1, ballY - batY1, bat, ball, DeflectionOption.Bat)
                });
            }
        });
    }
    batDeflect(dir, posX, posY, bat, ball, deflectionOption) {
        this.deflections++;
        const batMidPoint = bat.getBat().middlePosition;
        var cardinal = ball.getDirection();
        const batYMidPoint = getWholeNumber(0.9 * this.gameOptions.height) + 5;
        if (dir === Direction.North) {
            if (cardinal.angle === 270) {
                cardinal.angle = 90;
            }
            else {
                var newangle = (posX * 90) / batMidPoint;
                if (posX === batMidPoint) {
                    cardinal.angle = 90;
                }
                else if (posX > batMidPoint)
                    cardinal.angle = 270 - newangle;
                else if (posX < batMidPoint)
                    cardinal.angle = 270 + newangle;
            }
        }
        if (dir === Direction.South) {
            if (cardinal.angle === 90) {
                cardinal.angle = 270;
            }
            else {
                var newangle = (posX * 90) / batMidPoint;
                if (posX === batMidPoint) {
                    cardinal.angle = 90;
                }
                else if (posX > batMidPoint)
                    cardinal.angle = 90 - newangle;
                else if (posX < batMidPoint)
                    cardinal.angle = 90 + newangle;
            }
        }
        if (dir === Direction.West) {
            // cardinal.angle = (posX * 180) / batYMidPoint
            var newangle = (posX * 90) / batYMidPoint;
            if (posX === batMidPoint) {
                cardinal.angle = 90;
            }
            else if (posX > batMidPoint)
                cardinal.angle = 90 - newangle;
            else if (posX < batMidPoint)
                cardinal.angle = 90 + newangle;
        }
        if (dir === Direction.East) {
            var newangle = (posX * 90) / batYMidPoint;
            if (posX === batMidPoint) {
                cardinal.angle = 90;
            }
            else if (posX > batMidPoint)
                cardinal.angle = 90 - newangle;
            else if (posX < batMidPoint)
                cardinal.angle = 90 + newangle;
            // cardinal.angle = (posX * 360) / batYMidPoint
        }
        cardinal.direction = Direction.None;
        ball.setLastDeflection(deflectionOption);
        cardinal.angle = radiansToDegrees(degreesToRadians(cardinal.angle));
        ball.setDirection(cardinal);
    }
    addBatListener() {
        const { width } = this.gameOptions;
        this.bats.map((batObj, i) => {
            const bat = batObj.getBat();
            const ct = this;
            document.addEventListener("keyup", (e) => {
                if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                }
            });
            document.addEventListener("keydown", (e) => {
                if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                    if (bat.leftEdge <= 0)
                        return;
                    bat.move(Direction.West, 5);
                    ct.instructions.push({
                        id: BATMOVEMENT,
                        eventType: { eventOption: BatMovementOption.Left },
                        side: Direction.West,
                        action: (s) => { bat.move(s, 5); ct.instructions.pop(); }
                    });
                }
                if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                    if (bat.rightEdge >= width - 1)
                        return;
                    bat.move(Direction.East, 5);
                    ct.instructions.push({
                        id: BATMOVEMENT,
                        eventType: { eventOption: BatMovementOption.Right },
                        side: Direction.East,
                        action: (s) => { bat.move(s, 5); ct.instructions.pop(); }
                    });
                }
            });
        });
    }
    /**
     * BLOCK SECTION
     * Section that deals with the blocks to be broken
     */
    removeBlocks() {
        document.querySelectorAll('.block').forEach(e => e.remove());
    }
    updateBlocks() {
        this.removeBlocks();
        var board = document.getElementById("board-game");
        this.blockSystem.getBlocks().map((x, i) => {
            if (!x.isActive)
                return;
            var block = document.createElement("div");
            block.id = `block${x.id}`;
            block.className += "block";
            block.style.left = x.getPostion().x + "px";
            block.style.top = x.getPostion().y + "px";
            block.style.width = this.blockSystem.blockLength + "px";
            block.style.height = this.blockSystem.blockHeight + "px";
            board.append(block);
        });
    }
    checkIfBlocksHitBall() {
        this.blockSystem.getBlocks().map(({ position, id, isActive }) => {
            this.balls.map((ball, i) => {
                this.checkIfBlockHitBall(position, ball, id, isActive);
            });
        });
    }
    checkIfBlockHitBall(position, ball, id, active) {
        var ballX = getWholeNumber(ball.getPoint().x);
        var ballY = getWholeNumber(ball.getPoint().y);
        var direction = ball.cardinal.direction;
        var last = ball.lastDeflection;
        var blockX1 = getWholeNumber(position.x);
        var blockX2 = blockX1 + this.blockSystem.blockLength;
        var blockY1 = getWholeNumber(position.y);
        var blockY2 = blockY1 + this.blockSystem.blockHeight;
        var offset = (this.gameOptions.ballSize / 2) - 3;
        if (last === DeflectionOption.Block)
            return;
        if ((ballY + offset) === blockY1 &&
            ballX >= blockX1 && ballX <= blockX2) {
            if (!active)
                return;
            this.blockSystem.hitBlock(id);
            this.actions.push({
                id: DEFLECTION,
                eventType: { eventOption: DeflectionOption.Block },
                side: Direction.North,
                action: (s) => this.blockDeflect(s, ballX - blockX1, ballY - blockY1, position, ball, DeflectionOption.Block)
            });
        }
        // For the bottom side
        if (((ballY - offset - 3) === blockY2) &&
            ballX >= blockX1 && ballX <= blockX2) {
            if (!active)
                return;
            this.blockSystem.hitBlock(id);
            this.actions.push({
                id: DEFLECTION,
                eventType: { eventOption: DeflectionOption.Block },
                side: Direction.South,
                action: (s) => this.blockDeflect(s, ballX - blockX1, ballY - blockY1, position, ball, DeflectionOption.Block)
            });
        }
        // For the right side
        if ((ballX - offset) === blockX2 &&
            ballY >= blockY1 && ballY <= blockY2) {
            if (!active)
                return;
            this.blockSystem.hitBlock(id);
            this.actions.push({
                id: DEFLECTION,
                eventType: { eventOption: DeflectionOption.Block },
                side: Direction.East,
                action: (s) => this.blockDeflect(s, ballX - blockX1, ballY - blockY1, position, ball, DeflectionOption.Block)
            });
        }
        // For the left side
        if ((ballX + offset) === blockX1 &&
            ballY >= blockY1 && ballY <= blockY2) {
            if (!active)
                return;
            this.blockSystem.hitBlock(id);
            this.actions.push({
                id: DEFLECTION,
                eventType: { eventOption: DeflectionOption.Block },
                side: Direction.West,
                action: (s) => this.blockDeflect(s, ballX - blockX1, ballY - blockY1, position, ball, DeflectionOption.Block)
            });
        }
    }
    blockDeflect(dir, posX, posY, position, ball, deflectionOption) {
        this.deflections++;
        const batXMidPoint = position.x + 33;
        const batYMidPoint = position.y + 10;
        var cardinal = ball.getDirection();
        if (dir === Direction.North) {
            if (cardinal.angle === 270) {
                cardinal.angle = 90;
            }
            else {
                var newangle = (posX * 90) / batXMidPoint;
                if (posX === batXMidPoint) {
                    cardinal.angle = 90;
                }
                else if (posX > batXMidPoint)
                    cardinal.angle = 270 - newangle;
                else if (posX < batXMidPoint)
                    cardinal.angle = 270 + newangle;
            }
        }
        if (dir === Direction.South) {
            if (cardinal.angle === 90) {
                cardinal.angle = 270;
            }
            else {
                var newangle = (posX * 90) / batXMidPoint;
                if (posX === batXMidPoint) {
                    cardinal.angle = 90;
                }
                else if (posX > batXMidPoint)
                    cardinal.angle = 90 - newangle;
                else if (posX < batXMidPoint)
                    cardinal.angle = 90 + newangle;
            }
        }
        if (dir === Direction.West) {
            // cardinal.angle = (posX * 180) / batYMidPoint
            var newangle = (posX * 90) / batYMidPoint;
            if (posX === batYMidPoint) {
                cardinal.angle = 90;
            }
            else if (posX > batYMidPoint)
                cardinal.angle = 90 - newangle;
            else if (posX < batYMidPoint)
                cardinal.angle = 90 + newangle;
        }
        if (dir === Direction.East) {
            var newangle = (posX * 90) / batYMidPoint;
            if (posX === batYMidPoint) {
                cardinal.angle = 90;
            }
            else if (posX > batYMidPoint)
                cardinal.angle = 90 - newangle;
            else if (posX < batYMidPoint)
                cardinal.angle = 90 + newangle;
            // cardinal.angle = (posX * 360) / batYMidPoint
        }
        cardinal.direction = Direction.None;
        ball.setLastDeflection(deflectionOption);
        cardinal.angle = radiansToDegrees(degreesToRadians(cardinal.angle));
        ball.setDirection(cardinal);
    }
}
//# sourceMappingURL=PointSystem.js.map
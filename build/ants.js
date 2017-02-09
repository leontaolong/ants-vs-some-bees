"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var game_1 = require("./game");
var chalk = require("chalk");
var Insect = (function () {
    function Insect(armor, place) {
        this.armor = armor;
        this.place = place;
    }
    Insect.prototype.getName = function () { return this.name; };
    Insect.prototype.getArmor = function () { return this.armor; };
    Insect.prototype.getPlace = function () { return this.place; };
    Insect.prototype.setPlace = function (place) { this.place = place; };
    Insect.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        if (this.armor <= 0) {
            console.log(this.toString() + ' ran out of armor and expired');
            this.place.removeInsect(this);
            return true;
        }
        return false;
    };
    Insect.prototype.toString = function () {
        return this.name + '(' + (this.place ? this.place.getName() : '') + ')';
    };
    return Insect;
}());
exports.Insect = Insect;
var Bee = (function (_super) {
    __extends(Bee, _super);
    function Bee(armor, damage, place) {
        var _this = _super.call(this, armor, place) || this;
        _this.damage = damage;
        _this.name = 'Bee';
        return _this;
    }
    Bee.prototype.sting = function (ant) {
        console.log(this + ' stings ' + ant + '!');
        return ant.reduceArmor(this.damage);
    };
    Bee.prototype.isBlocked = function () {
        return this.place.getAnt() !== undefined;
    };
    Bee.prototype.setStatus = function (status) { this.status = status; };
    Bee.prototype.act = function () {
        if (this.isBlocked()) {
            if (this.status !== 'cold') {
                this.sting(this.place.getAnt());
            }
        }
        else if (this.armor > 0) {
            if (this.status !== 'stuck') {
                this.place.exitBee(this);
            }
        }
        this.status = undefined;
    };
    return Bee;
}(Insect));
exports.Bee = Bee;
var Ant = (function (_super) {
    __extends(Ant, _super);
    function Ant(armor, foodCost, place) {
        if (foodCost === void 0) { foodCost = 0; }
        var _this = _super.call(this, armor, place) || this;
        _this.foodCost = foodCost;
        return _this;
    }
    Ant.prototype.getFoodCost = function () { return this.foodCost; };
    Ant.prototype.setBoost = function (boost) {
        this.boost = boost;
        console.log(this.toString() + ' is given a ' + boost);
    };
    Ant.prototype.getGuard = function () {
        return this.guard;
    };
    Ant.prototype.setGuard = function (guard) {
        this.guard = guard;
    };
    return Ant;
}(Insect));
exports.Ant = Ant;
var GrowerAnt = (function (_super) {
    __extends(GrowerAnt, _super);
    function GrowerAnt() {
        var _this = _super.call(this, 1, 1) || this;
        _this.name = "Grower";
        return _this;
    }
    GrowerAnt.prototype.act = function (colony) {
        growBoostFunction(colony);
    };
    return GrowerAnt;
}(Ant));
exports.GrowerAnt = GrowerAnt;
var growBoostFunction = function (colony) {
    var roll = Math.random();
    if (roll < 0.6) {
        colony.increaseFood(1);
    }
    else if (roll < 0.7) {
        colony.addBoost('FlyingLeaf');
    }
    else if (roll < 0.8) {
        colony.addBoost('StickyLeaf');
    }
    else if (roll < 0.9) {
        colony.addBoost('IcyLeaf');
    }
    else if (roll < 0.95) {
        colony.addBoost('BugSpray');
    }
};
var ThrowerAnt = (function (_super) {
    __extends(ThrowerAnt, _super);
    function ThrowerAnt() {
        var _this = _super.call(this, 1, 4) || this;
        _this.name = "Thrower";
        _this.damage = 1;
        return _this;
    }
    ThrowerAnt.prototype.act = function () {
        attack(this, this.boost, this.place, this.damage);
    };
    return ThrowerAnt;
}(Ant));
exports.ThrowerAnt = ThrowerAnt;
function attack(ant, boost, place, damage) {
    if (boost == "FlyingLeaf") {
        var booster = new FlyingLeafApplyer();
        booster.act(place, ant, damage);
    }
    else if (boost == "StickyLeaf") {
        var booster = new IcyLeafApplyer();
        booster.act(place, ant, damage);
    }
    else if (boost == "IcyLeaf") {
        var booster = new StickyLeafApplyer();
        booster.act(place, ant, damage);
    }
    else if (boost == "BugSpray") {
        var booster = new BugSprayApplyer();
        booster.act(place, ant, damage);
    }
    else {
        var booster = new NoBoostApplyer();
        booster.act(place, ant, damage);
    }
    ant.setBoost(undefined);
}
var NoBoostApplyer = (function () {
    function NoBoostApplyer() {
    }
    NoBoostApplyer.prototype.act = function (place, ant, damage) {
        var target = place.getClosestBee(3);
        console.log(ant + ' throws a leaf at ' + target);
        if (target)
            target.reduceArmor(damage);
    };
    return NoBoostApplyer;
}());
var BugSprayApplyer = (function () {
    function BugSprayApplyer() {
    }
    BugSprayApplyer.prototype.act = function (place, ant, damage) {
        console.log(ant + ' sprays bug repellant everywhere!');
        var target = place.getClosestBee(0);
        while (target) {
            target.reduceArmor(10);
            target = place.getClosestBee(0);
        }
        ant.reduceArmor(10);
    };
    return BugSprayApplyer;
}());
var FlyingLeafApplyer = (function () {
    function FlyingLeafApplyer() {
    }
    FlyingLeafApplyer.prototype.act = function (place, ant, damage) {
        var target = place.getClosestBee(5);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
        }
    };
    return FlyingLeafApplyer;
}());
var StickyLeafApplyer = (function () {
    function StickyLeafApplyer() {
    }
    StickyLeafApplyer.prototype.act = function (place, ant, damage) {
        var target = place.getClosestBee(3);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
            target.setStatus('stuck');
            console.log(target + ' is stuck!');
        }
    };
    return StickyLeafApplyer;
}());
var IcyLeafApplyer = (function () {
    function IcyLeafApplyer() {
    }
    IcyLeafApplyer.prototype.act = function (place, ant, damage) {
        var target = place.getClosestBee(3);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
            target.setStatus('cold');
            console.log(target + ' is cold!');
        }
    };
    return IcyLeafApplyer;
}());
var EaterAnt = (function (_super) {
    __extends(EaterAnt, _super);
    function EaterAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.EMPTY = 1;
        _this.SWALLOW = 2;
        _this.DIGESTING_TURN_1 = 3;
        _this.DIGESTING_TURN_2 = 4;
        _this.DIGESTING_TURN_3 = 5;
        _this.state = _this.EMPTY;
        _this.name = "Eater";
        _this.stomach = new game_1.Place('stomach');
        return _this;
    }
    EaterAnt.prototype.isFull = function () {
        return this.stomach.getBees().length > 0;
    };
    EaterAnt.prototype.act = function () {
        console.log("eating: " + this.state);
        if (this.state == this.EMPTY) {
            console.log("try to eat");
            var target = this.place.getClosestBee(0);
            if (target) {
                console.log(this + ' eats ' + target + '!');
                this.place.removeBee(target);
                this.stomach.addBee(target);
                this.state = this.SWALLOW;
            }
        }
        else if (this.state == this.DIGESTING_TURN_1) {
            this.state = this.DIGESTING_TURN_2;
        }
        else if (this.state == this.DIGESTING_TURN_2) {
            this.state = this.DIGESTING_TURN_3;
        }
        else {
            this.stomach.removeBee(this.stomach.getBees()[0]);
            this.state = this.EMPTY;
        }
    };
    EaterAnt.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        console.log('armor reduced to: ' + this.armor);
        if (this.armor > 0) {
            if (this.state = this.SWALLOW) {
                var eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
                this.state = this.DIGESTING_TURN_2;
            }
            return false;
        }
        else {
            if (this.state == this.SWALLOW || this.state == this.DIGESTING_TURN_1) {
                var eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
            }
            return _super.prototype.reduceArmor.call(this, amount);
        }
    };
    return EaterAnt;
}(Ant));
exports.EaterAnt = EaterAnt;
var ScubaAnt = (function (_super) {
    __extends(ScubaAnt, _super);
    function ScubaAnt() {
        var _this = _super.call(this, 1, 5) || this;
        _this.name = "Scuba";
        _this.damage = 1;
        return _this;
    }
    ScubaAnt.prototype.act = function () {
        attack(this, this.boost, this.place, this.damage);
    };
    return ScubaAnt;
}(Ant));
exports.ScubaAnt = ScubaAnt;
var GuardAnt = (function (_super) {
    __extends(GuardAnt, _super);
    function GuardAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.name = "Guard";
        return _this;
    }
    GuardAnt.prototype.getGuarded = function () {
        return this.guarded;
    };
    GuardAnt.prototype.setGuarded = function (guarded) {
        this.guarded = guarded;
    };
    GuardAnt.prototype.act = function () { };
    return GuardAnt;
}(Ant));
exports.GuardAnt = GuardAnt;
var AntFactory = (function () {
    function AntFactory() {
    }
    AntFactory.prototype.produceAnt = function (type) {
        switch (type.toLowerCase()) {
            case "grower":
                return new GrowerAnt();
            case "thrower":
                return new ThrowerAnt();
            case "eater":
                return new EaterAnt();
            case "scuba":
                return new ScubaAnt();
            case "guard":
                return new GuardAnt();
            default:
                return null;
        }
    };
    AntFactory.prototype.produceIcon = function (ant) {
        switch (ant.name.toLowerCase()) {
            case "grower":
                return chalk.green('G');
            case "thrower":
                return chalk.red('T');
            case "eater":
                if (ant.isFull()) {
                    return chalk.yellow.bgMagenta('E');
                }
                else {
                    return chalk.magenta('E');
                }
            case "scuba":
                return chalk.cyan('S');
            case "guard":
                var guarded = ant.getGuarded();
                if (guarded != undefined) {
                    console.log("createAntSymbol Guard undefined");
                    return chalk.underline(new AntFactory().produceIcon(guarded));
                }
                else {
                    console.log("createAntSymbol Guard !undefined");
                    return chalk.underline('x');
                }
            default:
                return '?';
        }
    };
    return AntFactory;
}());
exports.AntFactory = AntFactory;
//# sourceMappingURL=ants.js.map
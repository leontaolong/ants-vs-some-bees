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
        return this.name + '(' + (this.place ? this.place.name : '') + ')';
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
        appyBoostFunction(this, this.boost, this.damage, this.place);
    };
    return ThrowerAnt;
}(Ant));
exports.ThrowerAnt = ThrowerAnt;
var appyBoostFunction = function (ant, boost, damage, place) {
    if (boost !== 'BugSpray') {
        var target = void 0;
        if (boost === 'FlyingLeaf')
            target = place.getClosestBee(5);
        else
            target = place.getClosestBee(3);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
            if (boost === 'StickyLeaf') {
                target.setStatus('stuck');
                console.log(target + ' is stuck!');
            }
            if (boost === 'IcyLeaf') {
                target.setStatus('cold');
                console.log(target + ' is cold!');
            }
            boost = undefined;
        }
    }
    else {
        console.log(this + ' sprays bug repellant everywhere!');
        var target = this.place.getClosestBee(0);
        while (target) {
            target.reduceArmor(10);
            target = this.place.getClosestBee(0);
        }
        this.reduceArmor(10);
    }
};
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
        appyBoostFunction(this, this.boost, this.damage, this.place);
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
        return this.place.getGuardedAnt();
    };
    GuardAnt.prototype.act = function () { };
    return GuardAnt;
}(Ant));
exports.GuardAnt = GuardAnt;
//# sourceMappingURL=ants.js.map
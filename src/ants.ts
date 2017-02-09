import { AntColony, Place, GamePlace } from './game';

/**
 * An abstract skeleton class that has name, armor, place and act
 * attributes of a type of insect
 */
export abstract class Insect {
  readonly name: string;

  /**
   * construct a Insect object with the following parameters
   * @param armor  How mamy armors (in number) does this insect have
   * @param place  The place where the insect will be at
   */
  constructor(protected armor: number, protected place: GamePlace) { }

  getName(): string { return this.name; }
  getArmor(): number { return this.armor; }
  getPlace() { return this.place; }
  setPlace(place: Place) { this.place = place; }

  /**
  * @param amount  A amount of armor strength(in number) that should be reduced 
  * @returns True if run out of armor and the insect is dead
  *          False if the insect is still alive */
  reduceArmor(amount: number): boolean {
    this.armor -= amount;
    if (this.armor <= 0) {
      console.log(this.toString() + ' ran out of armor and expired');
      this.place.removeInsect(this);
      return true;
    }
    return false;
  }

  /**
  * An abstract lifecyle function that can be specified to represent behaviors of a particular insect
  */
  abstract act(colony?: AntColony): void;

  /**
   * @returns a string representation of an insect including its name and current place(if any)
   */
  toString(): string {
    return this.name + '(' + (this.place ? this.place.getName() : '') + ')';
  }
}

/**
 * A Bee class that extends from Insect
 */
export class Bee extends Insect {
  readonly name: string = 'Bee';
  private status: string;

  /**
   * construct a Bee object with the following parameters
   * @param armor   How mamy armors (in number) does this Bee have
   * @param damage  The damage (in mumber) this bee will cause to others
   */
  constructor(armor: number, private damage: number, place?: GamePlace) {
    super(armor, place);
  }

  /**
   * @param ant  An Ant object this bee is gonna sting
   * @returns true if the ant stinged is dead, false otherwise
   */
  sting(ant: Ant): boolean {
    console.log(this + ' stings ' + ant + '!');
    return ant.reduceArmor(this.damage);
  }

  isBlocked(): boolean {
    return this.place.getAnt() !== undefined;
  }

  setStatus(status: string) { this.status = status; }

  /**
   * Particular behavior of this type of bee:
   */
  act() {
    if (this.isBlocked()) {
      if (this.status !== 'cold') { // if it's not been frozen
        this.sting(this.place.getAnt());
      }
    }
    else if (this.armor > 0) { // if it's still alive
      if (this.status !== 'stuck') { // if it's not stuck
        this.place.exitBee(this); // go to the next spot
      }
    }
    this.status = undefined;
  }
}

/**
 * A Ant class that extends from Insect class
 */
export abstract class Ant extends Insect {
  protected boost: string;
  protected guard: GuardAnt;

  /**
   * construct an Ant object with the following parameters
   * @param armor  How mamy armors (in number) does this ant have
   * @param foodCost  How much food it costs to deploy this ant
   * @param place (optional)  The place where the ant will be at
   */
  constructor(armor: number, private foodCost: number = 0, place?: GamePlace) {
    super(armor, place);
  }

  getFoodCost(): number { return this.foodCost; }

  /**
   * @param boost  Give a type of boost, as a string, to this ant
   */
  setBoost(boost: string) {
    this.boost = boost;
    console.log(this.toString() + ' is given a ' + boost);
  }

  getGuard(): GuardAnt {
    return this.guard;
  }

  setGuard(guard: GuardAnt) {
    this.guard = guard;
  }
}

/**
 * A Grower ant that has 1 armor and costs 1 food to deploy
 */
export class GrowerAnt extends Ant {
  readonly name: string = "Grower";
  constructor() {
    super(1, 1)
  }

  /**
   * @param colony This ant's colony (base)
   * Particular act of Grower ant: 
   * randomly generate a single food or boost in the colony each time based on the following probability: 
   *  food - 60%, FlyingLeaf - 10%, StickyLeaf -10%, IcyLeaf - 10%, BugSpray - 5%
   */
  act(colony: AntColony) {
    growBoostFunction(colony);
  }
}

interface GrowFunction {
  (colony: AntColony): void;
}

let growBoostFunction: GrowFunction = function (colony: AntColony) {
  let roll = Math.random();
  if (roll < 0.6) {
    colony.increaseFood(1);
  } else if (roll < 0.7) {
    colony.addBoost('FlyingLeaf');
  } else if (roll < 0.8) {
    colony.addBoost('StickyLeaf');
  } else if (roll < 0.9) {
    colony.addBoost('IcyLeaf');
  } else if (roll < 0.95) {
    colony.addBoost('BugSpray');
  }
}

/**
 * A Thrower ant that has 1 armor, costs 4 food to deploy, and will cause 1 damage to others
 */
export class ThrowerAnt extends Ant {
  readonly name: string = "Thrower";
  private damage: number = 1;

  constructor() {
    super(1, 4);
  }

  /**
   * Particular act of Thrower ant: 
   * Throw leafs to the bees and apply boosts if any 
   */
  act() {
    console.log("attack1");
    attackAction(this, this.boost, this.place, this.damage);
    console.log("attack2");
  }
}


function attackAction(ant: Ant, boost: String, place: GamePlace, damage:number) {
  console.log("attack3");
  if (boost == "FlyingLeaf") {
    let boostAdding: BoostSetter = new FlyingLeafSetter();
    boostAdding.act(place, ant, damage);
  } else if (boost == "StickyLeaf") {
    let boostAdding: BoostSetter = new StickyLeafSetter();
    boostAdding.act(place, ant, damage);
  } else if (boost == "IcyLeaf") {
    let boostAdding: BoostSetter = new StickyLeafSetter();
    boostAdding.act(place, ant, damage);
  } else if (boost == "BugSpray") {
    let boostAdding: BoostSetter = new BugSpraySetter();
    boostAdding.act(place, ant, damage);
  } else {
    let boostAdding: BoostSetter = new NonBoostSetter();
    boostAdding.act(place, ant, damage);
  }
  ant.setBoost(undefined);
}


interface BoostSetter {
  act(place: GamePlace, ant: Ant, damage:number);
}

class NonBoostSetter implements BoostSetter {
  act(place: GamePlace, ant: Ant, damage: number) {
    let target = place.getClosestBee(3);
    console.log(ant + ' throws a leaf at ' + target);
    if (target)
    target.reduceArmor(damage);
  }
}

class BugSpraySetter implements BoostSetter {
  act(place: GamePlace, ant: Ant, damage: number) {
    console.log(ant + ' sprays bug repellant everywhere!');
    let target = place.getClosestBee(0);
    while (target) {
      target.reduceArmor(10);
      target = place.getClosestBee(0);
    }
    ant.reduceArmor(10);
  }
}

class FlyingLeafSetter implements BoostSetter {
  act(place: GamePlace, ant: Ant, damage: number) {
    let target = place.getClosestBee(5);
    if (target) {
      console.log(ant + ' throws a leaf at ' + target);
      target.reduceArmor(damage);
    }
  }
}

class StickyLeafSetter implements BoostSetter {
  act(place: GamePlace, ant: Ant, damage: number) {
    let target = place.getClosestBee(3);
    if (target) {
      console.log(ant + ' throws a leaf at ' + target);
      target.reduceArmor(damage);
      target.setStatus('stuck');
      console.log(target + ' is stuck!');
    }
  }
}

class IcyLeaf implements BoostSetter {
  act(place: GamePlace, ant: Ant, damage: number) {
    let target = place.getClosestBee(3);
    if (target) {
      console.log(ant + ' throws a leaf at ' + target);
      target.reduceArmor(damage);
      // applies IcyLeaf boost on this Scuba ant.
      target.setStatus('cold');
      console.log(target + ' is cold!');
    }
  }
}




/**
 * An Eater ant that has 2 armor, a stomach and costs 4 food to deploy,
 */
export class EaterAnt extends Ant {
  readonly EMPTY = 1;
  readonly SWALLOW = 2
  readonly DIGESTING_TURN_1 = 3;
  readonly DIGESTING_TURN_2 = 4;
  readonly DIGESTING_TURN_3 = 5;

  private state: number = this.EMPTY;

  readonly name: string = "Eater";
  private eaten: Bee;
  private stomach: Place = new Place('stomach');

  constructor() {
    super(2, 4)
  }

  isFull(): boolean {
    return this.stomach.getBees().length > 0;
  }

  /**
   * Particular act of Eater ant: 
   * eat a bee and takes 3 turns to digest it
   */
  act() {
    console.log("eating: " + this.state);
    if (this.state == this.EMPTY) {
      console.log("try to eat");
      let target = this.place.getClosestBee(0);
      if (target) {
        console.log(this + ' eats ' + target + '!');
        this.place.removeBee(target);
        this.stomach.addBee(target);
        this.state = this.SWALLOW;
      }
    } else if (this.state == this.DIGESTING_TURN_1) {
      this.state = this.DIGESTING_TURN_2
    } else if (this.state == this.DIGESTING_TURN_2) {
      this.state = this.DIGESTING_TURN_3
    } else {
      this.stomach.removeBee(this.stomach.getBees()[0]);
      this.state = this.EMPTY;
    }
  }
  /**
   * handle some cases where the Eater is under attack while digesting bee
   * @param amount  The amount of armor that will be reduced (in mumber)
   * @returns True if the current Eater is dead, or false otherwise
   */
  reduceArmor(amount: number): boolean {
    this.armor -= amount;
    console.log('armor reduced to: ' + this.armor);
    if (this.armor > 0) {
      if (this.state = this.SWALLOW) {
        // after the attack, if the Eater still has armor, it will cough up the eaten bee
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up ' + eaten + '!');
        this.state = this.DIGESTING_TURN_2;
      }
      return false;
    }
    else {
      if (this.state == this.SWALLOW || this.state == this.DIGESTING_TURN_1) {
        // after the attack, if the Eater has no armor left, it will die
        // if it's digesting, it will cough up the eaten ant and then die
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up ' + eaten + '!');
      }
      return super.reduceArmor(amount);
    }
  }
}

/**
 * An Scuba ant that has 1 armor, costs 4 food to deploy, and cause 1 damage to others
 */
export class ScubaAnt extends Ant {
  readonly name: string = "Scuba";
  private damage: number = 1;

  constructor() {
    super(1, 5)
  }

  /**
   * similar behavior with Thrower ant
   */
  act() {
    attackAction(this, this.boost, this.place, this.damage);
  }
}

/**
 * An Guard ant that has 2 armor and costs 4 food to deploy
 */
export class GuardAnt extends Ant {
  readonly name: string = "Guard";
  private guarded: Ant;

  constructor() {
    super(2, 4)
  }

  /**
   * @returns the current Guard ant 
   */
  getGuarded(): Ant {
    return this.guarded;
  }

  setGuarded(guarded: Ant) {
    this.guarded = guarded;
  }
  /**
   * The Guard ant doesn't have any other particular behavior except guarding
   */
  act() { }
}
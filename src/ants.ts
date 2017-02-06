import { AntColony, Place } from './game';

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
  constructor(protected armor: number, protected place: Place) { }

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
    return this.name + '(' + (this.place ? this.place.name : '') + ')';
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
  constructor(armor: number, private damage: number, place?: Place) {
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

  /**
   * construct an Ant object with the following parameters
   * @param armor  How mamy armors (in number) does this ant have
   * @param foodCost  How much food it costs to deploy this ant
   * @param place (optional)  The place where the ant will be at
   */
  constructor(armor: number, private foodCost: number = 0, place?: Place) {
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

let growBoostFunction:GrowFunction = function (colony: AntColony) {
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
    appyBoostFunction(this, this.boost, this.damage, this.place);
  }
}

interface BoostFunction {
  (ant: Ant, boost: string, damage: number, place: Place): void;
}

let appyBoostFunction: BoostFunction = function (ant: Ant, boost: string, damage: number, place: Place) {
  if (boost !== 'BugSpray') {
    let target;
    // if FlyingLeaf is applied, extend the attacking range to 5
    // otherwise, attacking rage is 3
    if (boost === 'FlyingLeaf')
      target = place.getClosestBee(5);
    else
      target = place.getClosestBee(3);

    if (target) {
      console.log(ant + ' throws a leaf at ' + target);
      target.reduceArmor(damage);
      // apply StickyLeaf to stick a bee
      if (boost === 'StickyLeaf') {
        target.setStatus('stuck');
        console.log(target + ' is stuck!');
      }
      // apply IcyLeaf to freeze a bee       
      if (boost === 'IcyLeaf') {
        target.setStatus('cold');
        console.log(target + ' is cold!');
      }
      // reset boost to null
      boost = undefined;
    }
  }

  // if the BugSpray is applied, damage all bees in the tunnel and the ant itself by 10 armor 
  else {
    console.log(this + ' sprays bug repellant everywhere!');
    let target = this.place.getClosestBee(0);
    while (target) {
      target.reduceArmor(10);
      target = this.place.getClosestBee(0);
    }
    // also damage itself
    this.reduceArmor(10);
  }
}

/**
 * An Eater ant that has 2 armor, a stomach and costs 4 food to deploy,
 */
export class EaterAnt extends Ant {
  readonly name: string = "Eater";
  private turnsEating: number = 0;
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
    console.log("eating: " + this.turnsEating);
    if (this.turnsEating == 0) {
      // first time eating a bee
      console.log("try to eat");
      let target = this.place.getClosestBee(0);
      if (target) {
        console.log(this + ' eats ' + target + '!');
        this.place.removeBee(target);
        this.stomach.addBee(target);
        this.turnsEating = 1;
      }
    } else {
      if (this.turnsEating > 3) {
        // after three turns, finish digesting a bee
        this.stomach.removeBee(this.stomach.getBees()[0]);
        this.turnsEating = 0;
      }
      else
        // count each turn after eating a bee
        this.turnsEating++;
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
      if (this.turnsEating == 1) {
        // after the attack, if the Eater still has armor, it will cough up the eaten bee
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up ' + eaten + '!');
        this.turnsEating = 3;
      }
    }
    else if (this.armor <= 0) {
      if (this.turnsEating > 0 && this.turnsEating <= 2) {
        // after the attack, if the Eater has no armor left, it will die
        // if it's digesting, it will cough up the eaten ant and then die
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up ' + eaten + '!');
      }
      return super.reduceArmor(amount);
    }
    return false;
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
    // if (this.boost !== 'BugSpray') {
    //   let target;
    //   if (this.boost === 'FlyingLeaf')
    //     target = this.place.getClosestBee(5);
    //   else
    //     target = this.place.getClosestBee(3);

    //   if (target) {
    //     console.log(this + ' throws a leaf at ' + target);
    //     target.reduceArmor(this.damage);

    //     if (this.boost === 'StickyLeaf') {
    //       target.setStatus('stuck');
    //       console.log(target + ' is stuck!');
    //     }
    //     if (this.boost === 'IcyLeaf') {
    //       target.setStatus('cold');
    //       console.log(target + ' is cold!');
    //     }
    //     this.boost = undefined;
    //   }
    // }
    // else {
    //   console.log(this + ' sprays bug repellant everywhere!');
    //   let target = this.place.getClosestBee(0);
    //   while (target) {
    //     target.reduceArmor(10);
    //     target = this.place.getClosestBee(0);
    //   }
    //   this.reduceArmor(10);
    // }
    appyBoostFunction(this, this.boost, this.damage, this.place);
  }
}

/**
 * An Guard ant that has 2 armor and costs 4 food to deploy
 */
export class GuardAnt extends Ant {
  readonly name: string = "Guard";

  constructor() {
    super(2, 4)
  }

  /**
   * @returns the current Guard ant 
   */
  getGuarded(): Ant {
    return this.place.getGuardedAnt();
  }
  /**
   * The Guard ant doesn't have any other particular behavior except guarding
   */
  act() { }
}
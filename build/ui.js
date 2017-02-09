"use strict";
var game_1 = require("./game");
var vorpal = require("vorpal");
var chalk = require("chalk");
var _ = require("lodash");
var Vorpal = vorpal();
function showMapOf(game) {
    console.log(getMap(game));
}
exports.showMapOf = showMapOf;
function getMap(game) {
    var places = game.getPlaces();
    var tunnelLength = places[0].length;
    var beeIcon = chalk.bgYellow.black('B');
    var map = '';
    map += chalk.bold('The Colony is under attack!\n');
    map += "Turn: " + game.getTurn() + ", Food: " + game.getFood() + ", Boosts available: [" + game.getBoostNames() + "]\n";
    map += '     ' + _.range(0, tunnelLength).join('    ') + '      Hive' + '\n';
    for (var i = 0; i < places.length; i++) {
        map += '    ' + Array(tunnelLength + 1).join('=====');
        if (i === 0) {
            map += '    ';
            var hiveBeeCount = game.getHiveBeesCount();
            if (hiveBeeCount > 0) {
                map += beeIcon;
                map += (hiveBeeCount > 1 ? hiveBeeCount : ' ');
            }
        }
        map += '\n';
        map += i + ')  ';
        for (var j = 0; j < places[i].length; j++) {
            var place = places[i][j];
            map += iconFor(place.getAnt());
            map += ' ';
            if (place.getBees().length > 0) {
                map += beeIcon;
                map += (place.getBees().length > 1 ? place.getBees().length : ' ');
            }
            else {
                map += '  ';
            }
            map += ' ';
        }
        map += '\n    ';
        for (var j = 0; j < places[i].length; j++) {
            var place = places[i][j];
            if (place instanceof game_1.WaterPlaceDecorator) {
                map += chalk.bgCyan('~~~~') + ' ';
            }
            else {
                map += '==== ';
            }
        }
        map += '\n';
    }
    map += '     ' + _.range(0, tunnelLength).join('    ') + '\n';
    return map;
}
function iconFor(ant) {
    if (ant === undefined) {
        return ' ';
    }
    ;
    var icon;
    switch (ant.name) {
        case "Grower":
            icon = chalk.green('G');
            break;
        case "Thrower":
            icon = chalk.red('T');
            break;
        case "Eater":
            if (ant.isFull())
                icon = chalk.yellow.bgMagenta('E');
            else
                icon = chalk.magenta('E');
            break;
        case "Scuba":
            icon = chalk.cyan('S');
            break;
        case "Guard":
            console.log(ant.getGuarded());
            var guarded = ant.getGuarded();
            if (guarded !== undefined) {
                icon = chalk.underline(iconFor(guarded));
                break;
            }
            else {
                icon = chalk.underline('x');
                break;
            }
        default:
            icon = '?';
    }
    return icon;
}
function play(game) {
    Vorpal
        .delimiter(chalk.green('AvB $'))
        .log(getMap(game))
        .show();
    Vorpal
        .command('show', 'Shows the current game board.')
        .action(function (args, callback) {
        Vorpal.log(getMap(game));
        callback();
    });
    Vorpal
        .command('deploy <antType> <tunnel>', 'Deploys an ant to tunnel (as "row,col" eg. "0,6").')
        .alias('add', 'd')
        .autocomplete(['Grower', 'Thrower', 'Eater', 'Scuba', 'Guard'])
        .action(function (args, callback) {
        var error = game.deployAnt(args.antType, args.tunnel);
        if (error) {
            Vorpal.log("Invalid deployment: " + error + ".");
        }
        else {
            Vorpal.log(getMap(game));
        }
        callback();
    });
    Vorpal
        .command('remove <tunnel>', 'Removes the ant from the tunnel (as "row,col" eg. "0,6").')
        .alias('rm')
        .action(function (args, callback) {
        var error = game.removeAnt(args.tunnel);
        if (error) {
            Vorpal.log("Invalid removal: " + error + ".");
        }
        else {
            Vorpal.log(getMap(game));
        }
        callback();
    });
    Vorpal
        .command('boost <boost> <tunnel>', 'Applies a boost to the ant in a tunnel (as "row,col" eg. "0,6")')
        .alias('b')
        .autocomplete({ data: function () { return game.getBoostNames(); } })
        .action(function (args, callback) {
        var error = game.boostAnt(args.boost, args.tunnel);
        if (error) {
            Vorpal.log("Invalid boost: " + error);
        }
        callback();
    });
    Vorpal
        .command('turn', 'Ends the current turn. Ants and bees will act.')
        .alias('end turn', 'take turn', 't')
        .action(function (args, callback) {
        game.takeTurn();
        Vorpal.log(getMap(game));
        var won = game.gameIsWon();
        if (won === true) {
            Vorpal.log(chalk.green('Yaaaay---\nAll bees are vanquished. You win!\n'));
        }
        else if (won === false) {
            Vorpal.log(chalk.yellow('Bzzzzz---\nThe ant queen has perished! Please try again.\n'));
        }
        else {
            callback();
        }
    });
}
exports.play = play;
//# sourceMappingURL=ui.js.map
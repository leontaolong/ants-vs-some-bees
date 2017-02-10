"use strict";
var game_1 = require("./game");
var ui_1 = require("./ui");
if (process.argv[2] === '--debug') {
    var colony = new game_1.AntColony(16, 1, 8, 0);
    var hive = new game_1.Hive(3, 1)
        .addWave(2, 1)
        .addWave(3, 1);
    var game = new game_1.AntGame(colony, hive);
    game.deployAnt('Grower', '0,0');
    game.deployAnt('Thrower', '0,1');
    game.takeTurn();
    game.takeTurn();
    game.takeTurn();
    ui_1.showMapOf(game);
}
else {
    var colony = new game_1.AntColony(2, 3, 8, 3);
    var hive = new game_1.Hive(3, 1)
        .addWave(2, 1)
        .addWave(3, 1);
    var game = new game_1.AntGame(colony, hive);
    ui_1.play(game);
}
//# sourceMappingURL=index.js.map
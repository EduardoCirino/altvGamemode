import * as alt from 'alt';
import * as chat from 'chat';
import * as locations from './locations.mjs';
import * as playerFunc from './player.mjs';
import SQL from '../../../database/database.mjs';
import { truckerTrailer } from './locations.mjs';

console.log("Loaded server->systems->job.mjs");
const db = new SQL();

//playerstats
export var working = false;
var jobTruck;
var Trailer;
var pestePrins;
var numePeste;
var pretPeste;
var CarDemolish;
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

chat.registerCmd('getjob',(player) => {
    db.selectData('users', ['id', 'username', 'job'], data  => {
        var info = data.find(dbinfo => {
            return dbinfo;
        });
        if(locations.truckerGetJob == true)
        {
            if(info.job == 0)
            {
                chat.sendJob(player, `Acum muncesti la job-ul Trucker!`);
                db.updatePartialData(info.id, {job: 1}, 'users', res => {});
            }
            if(info.job == 1)
            {
                return chat.sendError(player, `Ai deja job-ul de Trucker!`);
            }
            if(info.job > 1)
            {
                return chat.sendError(player, `Ai deja un job, trebuie sa dai /quitjob prima data!`);
            }
        }
        if(locations.fisherGetJob == true) 
        {
            if(info.job == 0)
            {
                chat.sendJob(player, `Acum muncesti la job-ul Fisherman!`);
                db.updatePartialData(info.id, {job: 2}, 'users', res => {});
            }
            if(info.job == 2)
            {
                return chat.sendError(player, `Ai deja job-ul de Fisherman!`);
            }
            if(info.job > 2)
            {
                return chat.sendError(player, `Ai deja un job, trebuie sa dai /quitjob prima data!`);
            }
        }
        if(locations.carDemGetJob == true)
        {
            if(info.job == 0)
            {
                chat.sendJob(player, `Acum muncesti la job-ul Car Demolisher`);
                db.updatePartialData(info.id, {job: 3}, 'users', res => {});
            }
            if(info.job == 3)
            {
                return chat.sendError(player, `Ai deja job-ul de Car Demolisher`);
            }
            if(info.job > 3)
            {
                return chat.sendError(player, `Ai deja un job, trebuie sa dai /quitjob prima data`)
            }
        }
    });
});

chat.registerCmd('quitjob',(player) => {
    db.selectData('users', ['id', 'username', 'job'], data  => {
        var info = data.find(dbinfo => {
            return dbinfo;
        });
        if(info.job <= 0)
        {
            return chat.sendError(player, `Nu ai un job!`);
        }
        if(working == true)
        {
            if(info.job == 1)
            {
                jobTruck.destroy();
                if(Trailer != undefined)
                {
                    Trailer.destroy();
                }
            }
            if(info.job == 2)
            {
                pestePrins = null;
                numePeste = null;
                pretPeste = null;
            }
            if(info.job == 3)
            {
                CarDemolish.destroy();
            }
            working = false;
        }
        else{
            db.updatePartialData(info.id, {job: 0}, 'users', res => {});
            chat.sendJob(player, `Ai demisionat de la job-ul pe care il aveai!`);
        }
    });
});

chat.registerCmd('work',(player) => {
    db.selectData('users', ['id', 'username', 'job'], data  => {
        var info = data.find(dbinfo => {
            return dbinfo;
        });
        if(working == true) return chat.sendError(player, `Deja lucrezi la un job! Tasteaza [/quitjob] pentru a anula!`);
        if(working == false)
        {
            if(info.job == 1)
            {
                if(locations.truckerWork == false)
                {
                    chat.sendJob(player, `Ti-am pus un checkpoint la locul deunde trebuie sa incepi munca!`);
                    alt.emit('cp:createCheckpoint', player, 45, -31, -2412, 5, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Work Place', 'TruckerWork');
                }
                else
                {
                    chat.sendJob(player, `Esti deja la locul deunde trebuie sa incepi munca!`);
                }
            }
            if(info.job == 2)
            {
                if(locations.fisherFish == false)
                {
                    chat.sendJob(player, `Ti-am pus un checkpoint la locul deunde poti pescuii!`);
                    alt.emit('cp:createCheckpoint', player, 45, -1859, -1242, 8, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Fish Place', 'FisherFish2');
                }
                else
                {
                    chat.sendJob(player, `Esti deja la locul unde poti pescuii!`);
                }
            }
            if(info.job == 3)
            {
                if(locations.carDemWork == false)
                {
                    chat.sendJob(player, `Ti-am pus un checkpoint la locul deunde poti incepe munca!`);
                    alt.emit('cp:createCheckpoint', player, 45, -460, -1716, 18, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Work Place', 'CarDemolish');
                }
                else
                {
                    chat.sendJob(player, `Esti deja la locul unde poti incepe munca!`);
                }
            }
        } 
    });
});


//-------------------------------TRUCKER JOB----------------------------
chat.registerCmd('getTruck',(player) => {
    db.selectData('users', ['id', 'username', 'job'], data  => {
        var info = data.find(dbinfo => {
            return dbinfo;
        });
        if(working == true) return chat.sendError(player, `Deja lucrezi la un job! Tasteaza [/quitjob] pentru a anula!`);
        if(working == false)
        {
            if(info.job == 1)
            {
                if(locations.truckerWork == true)
                {
                    chat.sendJob(player, `Du-te la urmatorul checkpoint pentru a selecta cursa si a primii remorca!`);
                    jobTruck = new alt.Vehicle("phantom", player.pos.x, player.pos.y, player.pos.z, player.rot.x, player.rot.y, player.rot.z);
                    alt.emitClient(player, 'job:SetPlayerInTheCar', jobTruck);

                    alt.setTimeout(() => {
                        alt.emit('cp:createCheckpoint', player, 45, -137, -2417, 5, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Get Trailer', 'TruckerTrailer');
                    }, 1000);
                    working = true;
                }
            }
            else
            {
                return;
            }
        } 
    });
});

alt.onClient('trucker:mazeBank', (player) => {
    Trailer = new alt.Vehicle("tr4", -137, -2408, 5, 0, 0, 2);
    alt.emitClient(player, 'job:attachTrailer', jobTruck, Trailer, 5);
    alt.emit('cp:createCheckpoint', player, 45, -387, -1875, 20, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Delivery Destination', 'MazeBankCol');
    console.log("Trailer Spawned!");
});

alt.onClient('trucker:MarfaMag', (player) => {
    Trailer = new alt.Vehicle('tvtrailer', -137, -2408, 5, 0, 0, 2);
    alt.emitClient(player, 'job:attachTrailer', jobTruck, Trailer, 100);
    alt.emit('cp:createCheckpoint', player, 45, 84, -1621, 29, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Delivery Destination', 'MarfaMagCol');
    //x: 84.0791244506836 / y: -1621.5428466796875 / z:29.5831298828125
    console.log("Trailer Spawned!");
});

alt.onClient('trucker:Benzina', (player) => {
    Trailer = new alt.Vehicle('tanker', -137, -2408, 5, 0, 0, 2);
    alt.emitClient(player, 'job:attachTrailer', jobTruck, Trailer, 100);
    alt.emit('cp:createCheckpoint', player, 45, -65, -1744, 29, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Delivery Destination', 'BenzinaCol');
    //x: 89.81538391113281 / y: -1619.208740234375 / z:30.4256591796875  
    console.log("Trailer Spawned!");
});

alt.on('trucker:arriveDestination', (player, name) => {
    var sumaprimita;
    if(name === 'MazeBank')
    {
        db.selectData('users', ['id', 'username', 'cash'], data  => {
            var info = data.find(dbinfo => {
                return dbinfo;
            });
            sumaprimita = randomIntFromInterval(25000, 70000);
            Trailer.destroy();
            chat.sendJob(player, `Ai primit $${sumaprimita} pentru aceasta cursa!`);
            chat.sendJob(player, `Du-te inapoi pentru a alege o alta cursa!`);
            alt.emit('cp:createCheckpoint', player, 45, -137, -2417, 5, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Get Trailer', 'TruckerTrailer');
            playerFunc.addCash(player, sumaprimita);
        });
    }
    if(name === 'MarfaMagCol')
    {
        db.selectData('users', ['id', 'username', 'cash'], data  => {
            var info = data.find(dbinfo => {
                return dbinfo;
            });
            sumaprimita = randomIntFromInterval(70000, 100000);
            Trailer.destroy();
            chat.sendJob(player, `Ai primit $${sumaprimita} pentru aceasta cursa!`);
            chat.sendJob(player, `Du-te inapoi pentru a alege o alta cursa!`);
            alt.emit('cp:createCheckpoint', player, 45, -137, -2417, 5, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Get Trailer', 'TruckerTrailer');
            playerFunc.addCash(player, sumaprimita);
        });
    }
    if(name === 'BenzinaCol')
    {
        db.selectData('users', ['id', 'username', 'cash'], data  => {
            var info = data.find(dbinfo => {
                return dbinfo;
            });
            sumaprimita = randomIntFromInterval(100000, 150000);
            Trailer.destroy();
            chat.sendJob(player, `Ai primit $${sumaprimita} pentru aceasta cursa!`);
            chat.sendJob(player, `Du-te inapoi pentru a alege o alta cursa!`);
            alt.emit('cp:createCheckpoint', player, 45, -137, -2417, 5, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Get Trailer', 'TruckerTrailer');
            playerFunc.addCash(player, sumaprimita);
        });
    }
});

//-------------------------------/TRUCKER JOB----------------------------

//-------------------------------FISHER JOB----------------------------
chat.registerCmd('fish',(player) => {
    db.selectData('users', ['id', 'username', 'job'], data  => {
        var info = data.find(dbinfo => {
            return dbinfo;
        });
        if(working == true) return chat.sendError(player, `Deja lucrezi la un job! Tasteaza [/quitjob] pentru a anula!`);
        if(working == false)
        {
            if(info.job == 2)
            {
                if(locations.fisherFish == true)
                {
                    chat.sendJob(player, `Asteapta sa prinzi un peste!`);
                    alt.emitClient(player, 'utility:freezePlayer', player, true);
                    working = true;
                    alt.setTimeout(() => {
                        pestePrins = randomIntFromInterval(1, 7);
                        if(pestePrins == 1)
                        {
                            numePeste = 'Salau';
                            pretPeste = randomIntFromInterval(40000, 65000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        if(pestePrins == 2)
                        {
                            numePeste = 'Crap';
                            pretPeste = randomIntFromInterval(65000, 90000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        if(pestePrins == 3)
                        {
                            numePeste = 'Pastrav';
                            pretPeste = randomIntFromInterval(90000, 120000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        if(pestePrins == 4)
                        {
                            numePeste = 'Biban';
                            pretPeste = randomIntFromInterval(120000, 150000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        if(pestePrins == 5)
                        {
                            numePeste = 'Scrumbie';
                            pretPeste = randomIntFromInterval(150000, 190000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        if(pestePrins == 6)
                        {
                            numePeste = 'Anghila';
                            pretPeste = randomIntFromInterval(190000, 230000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        if(pestePrins == 7)
                        {
                            numePeste = 'Shiri';
                            pretPeste = randomIntFromInterval(230000, 270000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        if(pestePrins == 8)
                        {
                            numePeste = 'Peste Auriu';
                            pretPeste = randomIntFromInterval(270000, 350000);
                            chat.sendJob(player, `Ai prins un ${numePeste}!`);
                        }
                        chat.sendJob(player, `Du-te la singurul cumparator de peste din oras pentru a vinde pestele prins!`);
                        alt.emitClient(player, 'utility:freezePlayer', player, false);
                        working = false;
                    }, 5000);
                }
                else
                {
                    return chat.sendError(player, `Nu esti la locul de pescuit!`);
                }
            }
            else
            {
                return;
            }
        }
    });
});

///SELL FISH:  -1223 -907 12

chat.registerCmd('sellfish',(player) => {
    db.selectData('users', ['id', 'username', 'job'], data  => {
        var info = data.find(dbinfo => {
            return dbinfo;
        });
            if(info.job == 2)
            {
                if(locations.sellFish == true)
                {
                    if(pestePrins >= 1)
                    {
                        chat.sendJob(player, `Vanzator: Oh, vrei sa vinzi acest peste?`);
                        alt.emitClient(player, 'utility:freezePlayer', player, true);
                        alt.setTimeout(() => {
                            chat.sendJob(player, `Vanzator: Ok, sa vedem ce ai aici?`);
                        }, 3000);
                        alt.setTimeout(() => {
                            if(pestePrins == 1) //Salau
                            {
                                chat.sendJob(player, `Vanzator: Nu este rau acest ${numePeste} dar nu valoreaza foarte mult!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            if(pestePrins == 2) //Crap
                            {
                                chat.sendJob(player, `Vanzator: Nu este rau acest ${numePeste}, sa vedem cat costa!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            if(pestePrins == 3) //Pastrav
                            {
                                chat.sendJob(player, `Vanzator: Nu este rau, un ${numePeste}!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            if(pestePrins == 4) //Biban
                            {
                                chat.sendJob(player, `Vanzator: Oh, un ${numePeste}!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            if(pestePrins == 5) //Scrumbie
                            {
                                chat.sendJob(player, `Vanzator: Se pare ca ai o ${numePeste} care valoreaza ceva!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            if(pestePrins == 6) //Anghila
                            {
                                chat.sendJob(player, `Vanzator: Wow, o ${numePeste}. Acest peste este unul rar!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            if(pestePrins == 7) //Shiri
                            {
                                chat.sendJob(player, `Vanzator: Wow, un ${numePeste}. Acest peste este unul rar!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            if(pestePrins == 8) //Peste Auriu
                            {
                                chat.sendJob(player, `Vanzator: Nu te cred! Un ${numePeste}. Acest peste este cel mai rar si cel mai scump!`);
                                chat.sendJob(player, `Ai primit $${pretPeste} pentru acest peste`);
                                playerFunc.addCash(player, pretPeste);
                            }
                            alt.emitClient(player, 'utility:freezePlayer', player, false);
                        }, 4000);
                    }
                }
            }
            else
            {
                return chat.sendError(player, `Nu esti in locul in care poti vinde pesti!`);
            }
    });
});

/*
FISH SELLLER ACTOR POSITION
x: -1222.07470703125 / y: -908.4659423828125 / z:12.3121337890625
rotx: 0 / roty: 0 / z: -0.49473902583122253
*/

//-------------------------------Car Demolisher JOB----------------------------

//-------------------------------/Car Demolisher JOB----------------------------
var demolishCar;
const demolishCarPool = [
    'dilettante',
    'blista',
    'asbo',
    'prairie',
    'blade',
    'buccaneer',
    'chino',
    'clique',
    'dominator',
    'impaler',
    'emperor2',
    'glendale',
    'ingot',
    'intruder',
    'premier',
    'primo',
    'primo2',
    'stanier',
    'tailgater',
    'warrener',
    'washington',
];
var test = false;
var Player;
let randomVehicle = demolishCarPool[Math.floor(Math.random() * demolishCarPool.length)];
chat.registerCmd('startDemolish',(player) => {
    db.selectData('users', ['id', 'username', 'job'], data  => {
        var info = data.find(dbinfo => {
            return dbinfo;
        });
        if(working == true) return chat.sendError(player, `Deja lucrezi la un job! Tasteaza [/quitjob] pentru a anula!`);
        if(working == false)
        {
            if(info.job != 3) return chat.sendError(player, `Nu ai job-ul de Car Demolisher!`);
            if(info.job == 3)
            {
                working = true;
                alt.emitClient(player, 'cardem:setupJobCinematic', player);
                player.pos = {
                    x:-442,
                    y:-1672,
                    z:19
                }
                player.rot = {
                    x: 0,
                    y: 0,
                    z: 2.67
                }
                alt.emitClient(player, 'utility:freezePlayer', player, true);
                chat.send(player, 'Ghita: Oh, daca esti aici inseamna ca esti in cautare de distractie');
                alt.setTimeout(() => {
                    chat.send(player, 'Ghita: Daca este asa ... iti voi da o masina care va trebuii sa o distrugi in ce mod vrei');
                },2000);
                alt.setTimeout(() => {
                    chat.send(player, 'Ghita: Cand ai distrus masina o poti aduce la mine pentru a fii platit');
                },6000);
                alt.setTimeout(() => {
                    chat.send(player, 'Ghita: Dar trebuie sa ai grija sa nu explodezi ca nu vei fii platit!');
                },10000);
                alt.setTimeout(() => {
                    chat.send(player, 'Ghita: Acum du-te la masina si distreaza-te!');
                },14000);
                alt.setTimeout(() => {
                    alt.emitClient(player, 'cardem:removeJobCinematic', player);
                    chat.send(player, `remove job camera!`);
                    alt.emitClient(player, 'utility:freezePlayer', player, false);
                    player.pos = {
                        x:-460,
                        y:-1716,
                        z:18
                    }
                    demolishCar = new alt.Vehicle(randomVehicle, -455, -1720, 18, 0, 0, 0.54);
                    chat.send(player, `hmm!`);
                    chat.send(player, `Body Health: ${demolishCar.bodyHealth} Engine Health ${demolishCar.engineHealth}`);
                    test = true;
                    Player = player;
                },18000);
            }
        }
    });
});

chat.registerCmd('testdmg',(player) => {
    chat.send(player, `Body Health: ${demolishCar.bodyHealth} Engine Health ${demolishCar.engineHealth}`);
});

alt.everyTick(() => {
    //if(demolishCar != undefined || demolishCar != null) return;
    if(test == true)
    {
        if(demolishCar.engineHealth <= 100)
        {
            alt.emit('cardem:Finish', Player);
        }
    }
    else
    {
        return;
    }
});

alt.on('cardem:Finish', (player) => {
    chat.sendJob(player, `Du-te la Ghita pentru a fii rasplatit!`);
    alt.emit('cp:createCheckpoint', player, 45, -455, -1720, 18, 5, 240, 0, 0, 255, 4, 8, false, 128, 6, 'Deliver Car', 'DemolishCar');
    test = false;
});

alt.on('cardem:Payoff', (player) => {
    var recompensa = randomIntFromInterval(50000, 100000);
    chat.sendJob(player, `Ghita: Ai facut o munca grozava!`);
    chat.sendJob(player, `Ai primit $${recompensa} pentru munca depusa!`);
    demolishCar.destroy();
    working = false;
    playerFunc.addCash(recompensa);
});

chat.registerCmd('damagecar',(player) => {
    chat.sendJob(player, `Ti-am avariat masina!`);
    demolishCar.engineHealth = 102;
    demolishCar.bodyHealth = 150;
});

/*
PASII pentru car dem

/startDemolish -> Seteaza pozitia camerei -> Seteaza pozitia jucatorului -> creeaza actor -> dialog -> sterge camera -> sterge

//CAR DEM ACTOR POS
x: -441.8901062011719 / y: -1673.98681640625 / z:19.018310546875
rotx: 0 / roty: 0 / z: -0.3957912027835846
//CAR DEM PLAYER POS
x: -442.5362548828125 / y: -1672.5098876953125 / z:19.018310546875
rotx: 0 / roty: 0 / z: 2.622116804122925
*/
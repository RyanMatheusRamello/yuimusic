const { Client: DiscordClient } = require("discord.js");
const { join } = require("path");
const { readdirSync, lstatSync, writeFileSync, readFileSync } = require("fs");
const JSONCommand = require("./JSONCommand");
require("./Command");
require("./Events");
const Manager = require("./Manager");

module.exports = class Client extends DiscordClient {

    /**
     * Armazena onde estão os arquivos de eventos
     * @var {string} srcEvents
     */
    srcEvents;

    /**
     * Armazena onde estão os arquivos de comandos
     * @var {string} srcCommands
     */
    srcCommands;

    /**
     * Armazena os comandos do bot
     * @var {array} commands
     */
    commands;

    /**
     * Armazena a URL do DB
     * @var {string} uriDb
     */
    uriDb;

    /**
     * Armazena a id dos donos dos bot
     * @var {set} owner
     */
    owner
    
    /**
     * Armazena a cor do embed
     * @var {number} embedColor
     */
    embedColor

    /**
     * Cria uma classe cliente
     * @param {object} options 
     */
    constructor(options){

        super(options.options);
        this.owner = new Set(options.owner ?? []);
        this.uriDb = options.db;
        this.commands = [];
        this.embedColor = 16416752;
        this.bot = { categoryCommands: {} };
        this.bot.uptime = Math.round(new Date().getTime()/1000);
        this.srcCommands = options.commands ?? "src/commands";
        this.srcEvents = options.events ?? "src/events";
        this.loadDB(options.modelsDB ?? "src/db");
        let _self = this;
        process.on('uncaughtException', (err, origin) => {
            err.origin = origin;
            console.log(err);
            writeFileSync("./error.txt", readFileSync("./error.txt")+"\n\n"+JSON.stringify(err, null, 4))
            //_self.emit("error", err);
        });
        this.loadEvents();
        this.loadCommands();
        Manager(this);

    }

    loadEvents(){

        let src = this.srcEvents;
        let categories = readdirSync(src);
        for(let category of categories){
            let dir = join(process.cwd(), src, category);
            let stat = lstatSync(dir);
            if(stat.isDirectory()){
                let events = readdirSync(dir);
                for(let event of events){
                    let tdir = join(dir, event);
                    stat = lstatSync(tdir);
                    if(stat.isFile()){
                        const EventClass = require(tdir)
                        let evt = new EventClass(this);
                        if(tdir.once)
                            this.once(evt.name, evt.exec);
                        else
                            this.on(evt.name, evt.exec);
                    }
                }
            }
        }

    }

    sendCommands(id){
        let commands = this.commands;
        let send = [];
        for(let command of commands){
            let obj = new JSONCommand(command);
            send.push(obj.data);
        }
        if(!id){
            this.application.commands.set(send);
            return;
        }
        let _json = JSON.stringify(send, null, 4);
        if(_json !== readFileSync("commands.json")){
            writeFileSync("commands.json", _json);
            this.guilds.cache.get(id).commands.set(send);
        }
        
    }

    loadCommands(){

        let src = this.srcCommands;
        let categories = readdirSync(src);
        for(let category of categories){
            let dir = join(process.cwd(), src, category);
            let stat = lstatSync(dir);
            if(stat.isDirectory()){
                let commands = readdirSync(dir);
                for(let command of commands){
                    let tdir = join(dir, command);
                    stat = lstatSync(tdir);
                    if(stat.isFile()){
                        let CommandClass = require(tdir)
                        let cmd = new CommandClass(this);
                        cmd.category = category;
                        this.commands.push(cmd);
                    }else{
                        // Subcommands
                        let data = {
                            name: command,
                            description: "Um subcomando qualquer",
                            options: [],
                            __isSubCommand: true
                        }
                        let subcommands = readdirSync(tdir)
                        for(let subcommand of subcommands){
                            let zdir = join(tdir, subcommand);
                            stat = lstatSync(zdir);
                            if(stat.isFile()){
                                let CommandClass = require(zdir)
                                let cmd = new CommandClass(this);
                                cmd.category = category;
                                cmd.type = "SUB_COMMAND";
                                data.options.push(cmd);
                            }
                        }
                        
                        this.commands.push(new SubCommand(data));
                    }
                }
            }else{
                if(category == "_category.json"){
                    this.bot.categoryCommands = require(dir);
                }
            }
        }

    }

    loadDB(src){

        require("./db.js")(src, this.uriDb);
        
    }

}
const { Manager } = require("erela.js");
const LavaServers = require("../../lavalink.json");
const List = require("../../server_list.json");
const { default: Spotify} = require("better-erela.js-spotify")
const { default: AppleMusic } = require("better-erela.js-apple");
const Deezer  = require("erela.js-deezer");
const Tidal  = require("erela.js-tidal");

module.exports = (client) => {

    const servers = [];
    let typeIndex = 0;

    for(let server of LavaServers){
        if(server.enable){
            typeIndex++;
            servers.push({
                host: server.host,
                port: Number(server.port),
                retryDelay: 5000,
                identifier: "ID: "+typeIndex+", "+List[typeIndex-1],
                password: server.password,
                secure: server.secure
            });
        }

    }

    async function getMessage(channel, id){

        let message = channel.messages.cache.get(id);

        if(!message){
            message = await channel.messages.fetch(id);
        }

        return message;

    }


    client.manager = new Manager({

        plugins: [
            new Spotify(),
            new AppleMusic(),
            new Deezer(),
            new Tidal()
        ],
        nodes: servers,
        send: (id, payload) => {
            const guild = client.guilds.cache.get(id);
            if(guild) guild.shard.send(payload);
        }

    }).on("nodeConnect", (node) => {
        console.log(`Server ${node.options.identifier} connected`)
    }).on("nodeError", (node, err) => {
        console.error(`Server ${node.options.identifier} with err: ${err.message} `);
    }).on("trackStart", async (player, track) => {
        player.set("previusTrack", track)
        let cog = await DB.Config.findOne({ guildId: player.guild });
        if(!cog){
            cog = new DB.Config({
                guildId: msg.guild.id,
                musicChannel: "",
                messageId: "",
                allowRole: []
            });
            await cog.save();
        }
        const channel = client.channels.cache.get(player.textChannel);
        if(cog.musicChannel !== "" && cog.messageId !== ""){
            
            let message = await getMessage(channel, cog.messageId);
            client.emit("queueUpdate", {
                message, queue: player.queue
            });

        }else{
            channel.send(`Tocando agora: ${track.title}, solicitado por ${track.requester.toString()}`);
        }
    }).on("queueEnd", async (player) => {
        // isAutoplay
        if(player.get("autoplay")){
            // Autoplay ativado, add new music
            if(player.get("autoplay_list")){
                let list = player.get("autoplay_list");
                if(list.length > 0){
                    console.log("autoplay_list é mais que 0");
                    let music = list.shift();
                    player.set("autoplay_list", list);
                    player.queue.add(music);
                    return player.play();
                }
            }
            // Definir nova lista
            if(player.get("previusTrack")){
                let track = player.get("previusTrack");
                const mixURL = `https://www.youtube.com/watch?v=${track.identifier}&list=RD${track.identifier}`;
                const response = await client.manager.search(mixURL, track.requester);
                if (response && response.loadType === 'PLAYLIST_LOADED') {
                    if(response.tracks.length > 1){
                        response.tracks.shift(); // Remove a música que acabou de tocar
                        let music = response.tracks.shift();
                        player.set("autoplay_list", response.tracks);
                        player.queue.add(music);
                        return player.play();
                    }
                }
            }
            console.log("OPS!");
        }
        let cog = await DB.Config.findOne({ guildId: player.guild });
        if(!cog){
            cog = new DB.Config({
                guildId: msg.guild.id,
                musicChannel: "",
                messageId: "",
                allowRole: []
            });
            await cog.save();
        }
        const channel = client.channels.cache.get(player.textChannel);
        if(cog.musicChannel !== "" && cog.messageId !== ""){
            
            let message = await getMessage(channel, cog.messageId);
            client.emit("queueUpdate", {
                message, queue: player.queue
            });
            player.destroy();
            
        }else{
            channel.send(`A fila acabou`);
            player.destroy();
        }
    });

    client.on("raw", d => client.manager.updateVoiceState(d));
    client.once("ready", () => {
        client.manager.init(client.user.id);
    })

}
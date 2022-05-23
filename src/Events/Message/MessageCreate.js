const { MessageEmbed } = require("discord.js");

module.exports = class MessageCreate extends Event {

    constructor(client){

        super(client, {
            name: "messageCreate"
        });

    }

    sendMessageAndDelete = (channel, msg, time) => {

        return new Promise((resolve, reject) => {

            let data = new MessageEmbed()
                .setDescription(msg)
                .setColor(this.client.embedColor);
            channel.send({ embeds: [data]}).then((message) => {

                setTimeout(() => {
                    message.delete().then(resolve).catch(reject);
                }, time*1000)

            }).catch(reject);

        })    

    }

    async getMessage(channel, id){

        let message = channel.messages.cache.get(id);

        if(!message){
            message = await channel.messages.fetch(id);
        }

        return message;

    }

    exec = async (msg) => {

        if(msg.author.webhook){
            return;
        }

        // Verificar se está no canal definido
        let cog = await DB.Config.findOne({ guildId: msg.guild.id });
        if(!cog){
            cog = new DB.Config({
                guildId: msg.guild.id,
                musicChannel: "",
                messageId: "",
                allowRole: []
            });
            await cog.save();
            return;
        }
        if(cog.musicChannel !== "" && cog.messageId !== ""){
            
            if(msg.channel.id === cog.musicChannel){
                // Pesquisar música
                
                if(msg.author.bot){
                    if(msg.author.id !== this.client.user.id){
                        await msg.delete();
                    }
                    return;
                }
                
                // Exclui a mensagem do usúario, e inicia a busca
                let search = msg.content;
                let channel = msg.channel;
                try {
                    
                    await msg.delete();
                } catch (err) {
                    
                    return await this.sendMessageAndDelete(channel, "Ops! Não consigo deletar a mensagem do usúario, verifique minhas permisssões", 10)
                }

                // Mensagem deletada, agora verificar se pode
                
                let roles = msg.member.roles.cache.values();
                let enable = false;
                if(cog.allowRole.length > 0){
                    for(let role of roles){
                        if(cog.allowRole.find(e=>e==role.id)){
                            enable=true;
                        }
                    }
                    if(!enable){
                        
                        return await this.sendMessageAndDelete(channel, "Ops! "+msg.author.username+", Parece que você não tem permissão pra pedir música", 10)
                    }
                }
                
                if(!msg.member.voice?.channel){
                    
                    return await this.sendMessageAndDelete(channel, "Ops! "+msg.author.username+", Você precisa estar em um canal de voz", 10)
                }

                
                if(msg.guild.me.voice?.channel && msg.guild.me.voice.channel.id !== msg.member.voice.channel.id){
                    
                    return await this.sendMessageAndDelete(channel, "Ops! "+msg.author.username+", Você precisa estar no mesmo canal de voz que eu", 10)
                }

                let res;

                try {

                    
                    res = await this.client.manager.search(search, msg.author);

                    if(res.loadType == "LOAD_FAILED") throw res.exception;

                } catch (err) {
                    
                    return await this.sendMessageAndDelete(channel, "Ops! "+msg.author.username+", "+err.message, 10)
                }

                
                if(!res?.tracks?.[0]) {
                    
                    return await this.sendMessageAndDelete(channel, "Ops! "+msg.author.username+", Música não encontrada", 10)
                }

                
                const player = this.client.manager.create({
                    guild: msg.guild.id,
                    voiceChannel: msg.member.voice.channel.id,
                    textChannel: msg.channel.id
                });
        
                
                if (player.state !== "CONNECTED") player.connect();

                if(res.loadType == "PLAYLIST_LOADED"){

                    player.queue.add(res.tracks);
                }else{

                    player.queue.add(res.tracks[0]);
                }
                
                let message = await this.getMessage(channel, cog.messageId);


                if(!player.playing && !player.paused){
                    player.play();
                }else{
                    this.client.emit("queueUpdate", {
                        message, queue: player.queue
                    });
                }

            }
        }

    }

}
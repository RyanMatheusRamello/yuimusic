module.exports = class Clear extends Command {

    constructor(client){

        super(client, {
            name: "removeduplicate",
            description: "Remove músicas na playlist",
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction,) => {

        const player = interaction.client.manager.get(interaction.guild.id);

        if(!player){
            return await interaction.editReply("Ops! Não estou tocando nada")
        }

        let cog = await DB.Config.findOne({ guildId: interaction.guild.id });
        if(!cog){
            cog = new DB.Config({
                guildId: interaction.guild.id,
                musicChannel: "",
                messageId: "",
                allowRole: []
            });
            await cog.save();
        }
        let roles = interaction.member.roles.cache.values();
        let enable = false;
        if(cog.allowRole.length > 0){
            for(let role of roles){
                if(cog.allowRole.find(e=>e==role.id)){
                    enable=true;
                }
            }
            if(!enable){
                
                return await interaction.editReply("Ops! Parece que você não tem permissão para executar esse comando")

            }
        }

        if(!interaction.member.voice?.channel){
                    
            return await interaction.editReply("Ops! Você precisa estar em um canal de voz")
        }

        
        if(interaction.guild.me.voice?.channel && interaction.guild.me.voice.channel.id !== interaction.member.voice.channel.id){
            
            return await interaction.editReply("Ops! Você precisa estar no mesmo canal de voz que eu")

        }

        let tracks = player.queue;
        const newtracks = [];
        for (let i = 0; i < tracks.length; i++) {
            let exists = false;
            for (let j = 0; j < newtracks.length; j++) {
                if (tracks[i].uri === newtracks[j].uri) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                newtracks.push(tracks[i]);
            }
        }
        let l = player.queue.length;
        player.queue.clear();
        player.queue.add(newtracks);    
        await interaction.editReply("Removido "+(l-newtracks.length)+" músicas"); 
        let channel;
        if(cog.musicChannel == interaction.channel.id){
            channel = interaction.channel
        }else{
            channel = interaction.guild.channels.cache.get(cog.musicChannel);
        }
        if(!channel) return;
        let message = await this.getMessage(channel, cog.messageId);
        this.client.emit("queueUpdate", {
            message, queue: player.queue
        });

    }

    async getMessage(channel, id){

        let message = channel.messages.cache.get(id);

        if(!message){
            message = await channel.messages.fetch(id);
        }

        return message;

    }

}
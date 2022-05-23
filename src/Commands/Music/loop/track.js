module.exports = class Pause extends Command {

    constructor(client){

        super(client, {
            name: "track",
            description: "Ativa a repetição para a música atual",
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction) => {

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
        player.setTrackRepeat(!player.trackRepeat);
        const queueRepeat = player.trackRepeat ? "ativada" : "desativada";
        return interaction.editReply(`Repetição de música ${queueRepeat}`);

    }

}
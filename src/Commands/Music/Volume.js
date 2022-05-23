module.exports = class Pause extends Command {

    constructor(client){

        super(client, {
            name: "volume",
            description: "Define o volume da música",
            options: [
                {
                    name: "volume",
                    type: "INTEGER",
                    min_value: 1,
                    max_value: 200,
                    default: ()=>100
                }
            ],
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction, { volume }) => {

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

        player.setVolume(volume);
        return interaction.editReply(`Volume definido para ${volume}`);

    }

}
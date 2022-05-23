const levels = {
    none: 0.0,
    low: 0.10,
    medium: 0.15,
    high: 0.25,
}

module.exports = class Ping extends Command {

    constructor(client){

        super(client, {
            name: "bassboost",
            description: "Adiciona o bassboost nas músicas",
            options: [
                {
                    type: "STRING",
                    name: "level",
                    description: "Nível do bassboost (none, low, medium, high ou um valor de 0 a 50)",
                    default: ()=>"none"
                }
            ],
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction, { level }) => {

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

        let l = 0;
        if(typeof levels[level] !== "undefined"){
            l = levels[level] * 100;
            const bands = new Array(3)
                .fill(null)
                .map((_, i) =>
                    ({ band: i, gain: levels[level] })
                );
            player.setEQ(...bands);
        }else{
            if(isNaN(level)){
                return await interaction.editReply("Ops! Valor informado para o bassboost invalido");
            }
            l = Number(level);
            if(l > 50 && l < 0){
                return await interaction.editReply("Ops! Valor informado para o bassboost invalido");
            }
            const bands = new Array(3)
            .fill(null)
            .map((_, i) =>
                ({ band: i, gain: Number(level)/100 })
            );
            player.setEQ(...bands);
        }
        return interaction.editReply(`Bassboost definido para ${level}`);

    }

}
const paginationEmbed = require('discordjs-button-pagination');
const { MessageEmbed , MessageButton} = require('discord.js');
function paginate (arr, size) {
    return arr.reduce((acc, val, i) => {
      let idx = Math.floor(i / size)
      let page = acc[idx] || (acc[idx] = [])
      page.push(val)
  
      return acc
    }, [])
  }
module.exports = class Pause extends Command {

    constructor(client){

        super(client, {
            name: "join",
            description: "Entra no canal de voz que vc está",
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction) => {

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

        
        if(interaction.guild.me.voice?.channel){
            
            return await interaction.editReply("Ops! Já estou em um canal de voz")

        }

        const player = interaction.client.manager.create({
            guild: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: cog.textChannel
        });

        if(!player){
            return await interaction.editReply("Ops! Algo deu errado")
        }

        if (player.state !== "CONNECTED") player.connect();
        await interaction.editReply("Estou no canal de voz"); 

    }

}
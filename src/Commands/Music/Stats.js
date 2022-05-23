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
            name: "stats",
            description: "Mostra o dados para o player",
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

        const embed = new MessageEmbed()
            .setTitle(`Detalhes`)
            .setColor(this.client.embedColor)
            .addField("Servidor", `\`${player.node.options.identifier}\``)
            .addField("CPU", `${player.node.stats.cpu.cores} Cores`, true)
            .addField("RAM", `${(((Object.values(player.node.stats.memory).reduce((p, c)=>p+c, 0))-player.node.stats.memory.used)/1e+9).toFixed(1)}GB/${((Object.values(player.node.stats.memory).reduce((p, c)=>p+c, 0))/1e+9).toFixed(1)}GB`, true)
            .setThumbnail(this.client.user.displayAvatarURL());
        
        return await interaction.editReply({ embeds: [embed] }) 

    }

}
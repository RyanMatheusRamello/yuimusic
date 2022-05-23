const { MessageEmbed , MessageButton} = require('discord.js');
function paginate (arr, size) {
    return arr.reduce((acc, val, i) => {
      let idx = Math.floor(i / size)
      let page = acc[idx] || (acc[idx] = [])
      page.push(val)
  
      return acc
    }, [])
  }
function viewQueue(interaction, pages, page){

    if(!pages[page-1]){
        page = pages.length;
    }

    const embed = new MessageEmbed()
        .setTitle("Queue")
        .setColor(interaction.client.embedColor)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({ text: "Page "+page+"/"+pages.length } );
    
    if(pages[page-1].length === 0){
        embed.setDescription("Sem músicas nessa pagína");
    }else{
        let index = 10 * (page-1);
        let description = "";
        for(let m of pages[page-1]){
            index++;
            description += `${index}) ${m.title}\n`
        }
        embed.setDescription(description);
    }
    interaction.editReply({ embeds: [embed] }).catch(console.error);

}
module.exports = class Queue extends Command {

    constructor(client){

        super(client, {
            name: "queue",
            description: "Mostra as músicas da playlist atual",
            options: [
                {
                    type: "INTEGER",
                    name: "page",
                    description: "Pagína que será exibida",
                    default: ()=>1,
                    min_value: 1
                }
            ],
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction, { page }) => {

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

        // Paginate musics
        if(player.queue.length === 0){
            return await interaction.editReply("Sem músicas na playlist")
        }
        let musics = paginate(player.queue, 10);
        viewQueue(interaction, musics, page);

    }

}
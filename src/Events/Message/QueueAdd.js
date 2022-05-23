const { MessageEmbed } = require("discord.js");

module.exports = class Ready extends Event {

    constructor(client){

        super(client, {
            name: "queueUpdate"
        });

    }

    exec = async ({ queue, message }) => {

        try {

            
            if(!message) return;

            let content = "";
            let index = 0;
            let max = 0;
            for(let q of queue){
                index++;
                if(index > 20){
                    max++;
                }else{
                    content += `${index}) ${q.title}\n`;
                }
            }
            if(max > 0){
                content += `E mais ${max} músicas`;
            }

            let embed = new MessageEmbed()
                .setTitle("Query List")
                .setColor(this.client.embedColor)
                .setThumbnail(this.client.user.displayAvatarURL())
                .setDescription((queue?.current?.title ? `Tocando: ${queue.current.title}` : "Sem músicas para tocar"));
            if(queue?.current?.thumbnail){
                embed.setImage(queue.current.displayThumbnail("maxresdefault"));
            }else{
                embed.setImage("https://media.discordapp.net/attachments/978102184854032385/978102256689877022/yui-image.jpg");
            }
            let obj = {}
            if(content.trim().length > 0){
                obj.content = content.trim();
            }else{
                obj.content = "Sem mais músicas na playlist";
            }
            obj.embeds = [embed]
            await message.edit(obj);

        } catch (err){ console.log(err) }
        

    }

}
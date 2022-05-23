global.SubCommand = class SubCommand {
    constructor(data){
        this.name = data.name;
        this.options = data.options ?? [];
        this.description = data.description;
    }

    run = async(interaction) =>{
        let command = interaction.options.getSubcommand();
        if(!command){
            //interaction.reply("Houve um erro interno ao executar seu comando");
            return {
                status: false,
                message: "Houve um erro interno ao executar seu comando"
            }
        }
        let cmd = this.options.find(e=>e.name==command);
        if(!cmd){
            //interaction.reply("Comando não encontrado");
            return {
                status: false,
                message: "Comando não encontrado"
            }
        }
        return await cmd.run(interaction);
    }
}

global.Command = class Command {

    constructor(client, options){

        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.options = options.options;
        this.config = options.config;
        this.private = options.private ?? false;
        this.deferReply = options.deferReply ?? false;
        this.deferEphemeral = options.deferEphemeral ?? false;
        this.builder = require("./Builder");

    }

    isPermission(interaction){

        if(this.config?.owner === true){
            if(this.client.owner.length > 0){
                if(this.client.owner.indexOf(interaction.user?.id ?? interaction.author?.id) === -1){
                    return false;
                }
            }else{
                throw new Error("ID do dono não encontrada");
            }
        }
        if(this.config?.permissions !== undefined){
            for(const permission of this.config.permissions){
                if(!interaction.member.permissions.has(permission)){
                    return false;
                }
            }
        }
        return true;


    }

    botPermissions(msg){
        if(this.config?.botPermissions !== undefined){
            for(const permission of this.config.botPermissions){
                if(!msg.guild.me.permissions.has(permission)){
                    return false;
                }
            }
        }
        return true;
    }

    async run(interaction){

        if(!this.botPermissions(interaction)){
            return await interaction.reply({ ephemeral: true, content: `Eu não tenho permissão pra executar essa ação`});
        }

        if(!this.isPermission(interaction)){
            return await interaction.reply({ ephemeral: true, content: `:woman_police_officer: Ops! Você não tem permissão para executar esse comando`});
        }

        let args = await this.checkArgs(interaction);
        interaction.cmd = this;
        if(!args.status){
            return await interaction.reply({ content: args.message, ephemeral: true });
        }
        if(this.deferReply)
            await interaction.deferReply({ ephemeral: (this.deferEphemeral ?? false)});
        await this.exec(interaction, args.attr);

    }

    async checkArgs(interaction){

        let argR;
        if(this?.options !== undefined && Array.isArray(this?.options)){
            argR = this.options;
        }
        if(argR){
            const attr = {};
            for(const argData of argR){
                if(argData.type == "MEMBER"){
                    let member = interaction.options.getMember(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "USERDB"){
                    let user = interaction.options.getUser(argData.name);
                    let member;
                    if(!user){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }else{

                        if(user.id == interaction.user.id){
                            member = interaction.userDB;
                        }else{
                            member = await interaction.client.get_user(user);
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "NUMBER"){
                    let member = interaction.options.getNumber(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "USER"){
                    let member = interaction.options.getUser(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "INTEGER"){
                    let member = interaction.options.getInteger(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "BOOLEAN"){
                    let member = interaction.options.getBoolean(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "CHANNEL"){
                    let member = interaction.options.getChannel(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "MENTIONABLE"){
                    let member = interaction.options.getMentionable(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "ROLE"){
                    let member = interaction.options.getRole(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
                if(argData.type == "STRING"){
                    let member = interaction.options.getString(argData.name);
                    if(!member){
                        if(argData.default){
                            member = argData.default(interaction);
                        }else if(argData.required){
                            return {
                                status: false,
                                message: argData.name + " is required"
                            }
                        }
                    }
                    attr[argData.name] = member;
                }
            }

            return {
                status: true,
                attr,
                length: Object.keys(attr).length
            }
        }

        return {
            status: true,
            attr: {},
            length: 0
        }

    }

    static FLAGS = {
        Author: msg => msg.author ?? msg.user,
        Member: msg => msg.member,
        MemberBot: msg => msg.guild.me,
        Bot: msg => msg.client.user,
        Channel: msg => msg.channel,
        Guild: msg => msg.guild,
        DBUser: msg => msg.userDB
    }

}
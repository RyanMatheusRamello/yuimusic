module.exports = class JSONCommand {

    constructor(data){
        this.data = this.toJSON(data);
    }

    toJSON(data){

        let res = {}; 
        
        res.type = this.#loadType(data.type);
        res.name = this.#loadName(data.name);
        res.description = this.#loadDescription(data.description);
        res.options = this.#loadOptions(data.options);
        if(data.choices)
            res.choices = data.choices;
        if(data.required)
            res.required = data.required ? true : false;
        if(data.channel_types)
            res.channel_types = data.channel_types;
        if(data.min_value)
            res.min_value = data.min_value;
        if(data.max_value)
            res.max_value = data.max_value;
        if(data.autocomplete)
            res.autocomplete = data.autocomplete ? true : false;
        return res;

    }

    #loadOptions(options){
        if(options){
            let res = [];
            for(let opt of options){
                res.push(this.toJSON(opt));
            }
            return res;
        }
    }

    #loadName(name){
        return String(name).substring(0, 100);
    }

    #loadDescription(description){
        return String(description ?? "Uma descrição qualquer").substring(0, 100);
    }

    #loadType(type){

        if(type == "MEMBER" || type == "USERDB"){
            return "USER";
        }

        return type;

    }

}
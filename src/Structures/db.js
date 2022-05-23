module.exports = (path, uri) => {
	global.DB = {}
	global.mongoose = require("mongoose");
	const { readdirSync, statSync } = require("fs");
	const { join } = require("path");

	mongoose.connect(uri, { autoIndex: false });

	let list = readdirSync(path);

	for(const file of list){

		if(statSync(join(path, file)).isFile()){

			if(file.endsWith(".js")){

				global.Functions = {
					methods: {},
					statics: {},
					virtual: {},
				}

				let name = file.split(".");
				name.pop();
				name = name.join("_");

				let scheme = new mongoose.Schema(require(join(process.cwd(), path, file)))

				for(const keys of Object.keys(global.Functions.methods)){

					scheme.methods[keys] = global.Functions.methods[keys];

				}

				for(const keys of Object.keys(global.Functions.statics)){

					scheme.static(keys, global.Functions.statics[keys]);

				}

				for(const keys of Object.keys(global.Functions.virtual)){

					let th = scheme.virtual(keys)
					if(global.Functions.virtual[keys].get)
						th.get(global.Functions.virtual[keys].get);
					if(global.Functions.virtual[keys].set)
						th.set(global.Functions.virtual[keys].set);

				}

				DB[name] = mongoose.model(name, scheme);

			}

		}

	}
}
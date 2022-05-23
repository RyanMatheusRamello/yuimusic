module.exports = class Builder {

	static inlineCode(str){

		return '`'+str.replace(/[\\`]/g, "\\$&")+'`'

	}

    static blockCode({ lang="", code="" }){

		return '```'+lang+"\n"+code.replace(/[\\`]/g, "\\$&")+'```'

	}

    static bold(str){

		return '**'+str.replace(/[\\`]/g, "\\$&")+'**'

	}

}
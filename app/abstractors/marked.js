// placeholder abstractor
var abstractor = function () {}

// vendor dependencies
var marked = require('marked')
var renderer = new marked.Renderer();
renderer.heading = function (text, level) {
    var patt = /\s?{([^}]+)}$/
    var link = patt.exec( text )

    if(link && link.length && link[1]) {
        text = text.replace(patt, '');
        link = link[1];
    } else {
        link = text.toLowerCase().replace(/[^\wА-яіІїЇєЄ]+/gi, '-');
    }
    return '<h' + level + ' id="' + link + '">' + text + '</h' + level + '>';
};
marked.setOptions({
	renderer,
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: true,
	sanitize: false,
	smartLists: true,
	smartypants: false
})

abstractor.prototype.init = function (context) {
	return new Promise(function (resolve, reject) {

		// initialize abstractor
		resolve()
	})
}

abstractor.prototype.abstract = function (context) {
	return new Promise(function (resolve, reject) {

		// hides the abstracted context
		context.$abstracted_content_hidden = true

		// creates abstracted context object
		context.abstracted_content = {}

		// creates the markdowned context
		context.abstracted_content.marked_marked = marked(context.marked).replace(/(\s[а-яА-ЯёЁ]{1,2})\s/g, '$1 ')
		if (context.$marked_en) {
			context.abstracted_content.$marked_marked_en = marked(context.$marked_en)
		}

		// applies folder markdown_rule
		context.abstracted_content.marked_marked = folder_markdown(context.abstracted_content.marked_marked)

		// creates folder structure
		var headings = context.abstracted_content.marked_marked.match(/<h[{1-3}] id=".*?">.*?\/h[{1-3}]>/g)

		var heading_structure = []

		for (m in headings) {

			var heading = {}

			var heading_match = headings[m].match(/<h([{1-3}]) id="(.*?)">(.*)?<\/h[{1-3}]>/)

			heading.heading = heading_match[3]
			heading.level = heading_match[1]
			heading.link = heading_match[2]
			heading_structure.push(heading)
		}

		context.abstracted_content.contents = heading_structure

		// abstract directive
		return resolve()
	})
}

// custom markdown rule for markdown
function folder_markdown (input) {
	return input.replace(/\$\$([\w\/\.-]*)/g, '<span class="markdown_folder">$1</span>')
}

module.exports = new abstractor()

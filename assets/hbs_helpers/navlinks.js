/* global enduro */

const _ = require('lodash')

enduro.templating_engine.registerHelper('navlinks', function (options) {
    var navPages, rootPages
    // get_cms_list will return a structured list of all pages in a project
    return enduro.api.pagelist_generator.get_cms_list()
        .then((pagelist) => {
            navPages = []
            rootPages = _.chain(pagelist.structured.pages)
                .filter((o) => { return typeof o === 'object' && !o.hidden}).value() // filter pages only

            return Promise.all(rootPages.map(page =>
                enduro.api.flat
                .load(page.fullpath)
                .then(content => {
                    if (content.display_in_top_navigation) {
                        page.content = content
                        navPages.push(page)
                    }
                })
            ))
        })
        // pass pages as context for the template
        .then(() => options.fn(navPages))
});

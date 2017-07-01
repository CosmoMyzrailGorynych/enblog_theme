var _ = require('lodash')
var Promise = require('bluebird')

enduro.templating_engine.registerHelper('blog_archive', function (options) {

    // will store all the blog entries
    var blog_entries

    // get_cms_list will return a structured list of all pages in a project
    return enduro.api.pagelist_generator.get_cms_list()
        .then((pagelist) => {

            // will store the promises from reading all the blog entries
            var get_content_promises = []

            blog_entries = _.chain(pagelist.structured.blog)
                .filter((o) => { return typeof o === 'object' && !o.hidden}).value() // filter pages only

            // goes through all the blog entries and loads their content
            for (page_id in blog_entries) {
                var page = blog_entries[page_id]

                function get_content (page) {
                    get_content_promises.push(enduro.api.flat.load(page.fullpath).then((content) => { page.content = content }))
                }

                get_content(page)
            }

            return Promise.all(get_content_promises)
        })
        .then(() => {
            var months = []

            // show only published entries
            blog_entries = blog_entries.filter(entry => entry.content.published)

            for (let i = 0, l = blog_entries.length; i < l; i++) {

                let date = new Date(blog_entries[i].content.$date_value),
                    month = (date.getMonth() < 9? '0' : '') + (date.getMonth() + 1) + '/' + (date.getYear() + 1900)
                blog_entries[i].date = date

                let month_ind = months.findIndex(m => m.title === month);
                if (month_ind === -1) {
                    // create a new month if it is absent, and push a page
                    months.push({
                        title: month,
                        pages: [blog_entries[i]],
                        order: 12 * date.getYear() + date.getMonth()
                    });
                } else {
                    // push a page directly
                    months[month_ind].pages.push(blog_entries[i]);
                }

            }

            // sort months by their time
            months.sort((a, b) => b.order - a.order);

            // sort blog entries within months
            months.forEach(month => {
                month.pages.sort((a, b) => b.date > a.date)
            });

            // pass blog entries as context for the template
            return options.fn(months)
        })
})

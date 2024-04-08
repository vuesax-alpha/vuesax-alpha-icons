const { readdir, readFileSync, writeFileSync } = require('node:fs')

String.prototype.splice = function (idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem))
}

const includesCaseInsensitive = (str, searchString) =>
  new RegExp(searchString, 'i').test(str)

function main(path) {
  readdir(path, { encoding: 'utf8' }, (err, files) => {
    if (!err) {
      for (const file of files) {
        if (file.split('.').length === 1) {
          if (file !== 'node_modules') {
            main(`${path}/${file}`)
          }
        } else {
          const lastIndextDot = file.lastIndexOf('.')
          const ext = file.slice(lastIndextDot + 1)

          if (ext === 'svg') {
            const contents = readFileSync(`${path}/${file}`, {
              encoding: 'utf8',
            })
            let textSearch = 'fill="#292D32"'
            let replaced = contents
            let changed = false

            if (includesCaseInsensitive(contents, textSearch)) {
              replaced = replaced.replaceAll(textSearch, 'fill="currentColor"')
              changed = true
            }

            textSearch = 'stroke="#292D32"'
            if (includesCaseInsensitive(contents, textSearch)) {
              replaced = replaced.replaceAll(
                textSearch,
                'stroke="currentColor"'
              )
              changed = true
            }

            textSearch = ' width="24" height="24" '
            if (includesCaseInsensitive(contents, textSearch)) {
              replaced = replaced.replaceAll(textSearch, ' ')
              changed = true
            }

            if (changed) {
              writeFileSync(`${path}/${file}`, replaced)
              console.log({ change: `${path}/${file}` })
            }
          }
        }
      }
    }
  })
}

main('./packages/svg')

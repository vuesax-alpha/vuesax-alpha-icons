import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { emptyDir, ensureDir } from 'fs-extra'
import consola from 'consola'
import camelcase from 'camelcase'
import glob from 'fast-glob'
import { format } from 'prettier'
import chalk from 'chalk'
import findWorkspaceDir from '@pnpm/find-workspace-dir'
import findWorkspacePackages from '@pnpm/find-workspace-packages'
import { pathComponents } from './paths'

import type { BuiltInParserName } from 'prettier'

const getSvgFiles = async () => {
  const pkgs = await // @ts-expect-error
  (findWorkspacePackages.default as typeof findWorkspacePackages)(
    // @ts-expect-error
    (await findWorkspaceDir.default(process.cwd()))!
  )
  const pkg = pkgs.find(
    (pkg: { manifest: { name?: string } }) =>
      pkg.manifest.name === '@vuesax-alpha/icons-svg'
  )!
  return glob('*.svg', { cwd: pkg.dir, absolute: true })
}

const getName = (file: string) => {
  const filename = path.basename(file).replace('.svg', '')
  const componentName = camelcase(filename, { pascalCase: true })
  return {
    filename,
    componentName,
  }
}

const formatCode = (code: string, parser: BuiltInParserName = 'typescript') =>
  format(code, {
    parser,
    semi: false,
    singleQuote: true,
  })

const transformToVueComponent = async (files: string[], name: string) => {
  const content: Record<string, string> = {}
  for (const file of files) {
    const type = file.split('-').pop()!.replace('.svg', '')
    content[type] = await readFile(file, 'utf-8')
  }
  const componentName = camelcase(name, { pascalCase: true })
  const vue = formatCode(
    `
<template>
<div>
<div v-if="type === 'outline'">${content['outline']}</div>
<div v-if="type === 'bold'">${content['bold']}</div>
<div v-if="type === 'linear'">${content['linear']}</div>
<div v-if="type === 'bulk'">${content['bulk']}</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
name: "${componentName}",
props: {
type: { type: String, default: "outline" }
}
})
</script>`,
    'vue'
  )

  writeFile(path.resolve(pathComponents, `${name}.vue`), vue, 'utf-8')
}

const generateEntry = async (names: string[]) => {
  const code = formatCode(
    names
      .map((name) => {
        const componentName = camelcase(name, { pascalCase: true })
        return `export { default as ${componentName} } from './${name}.vue'`
      })
      .join('\n')
  )
  await writeFile(path.resolve(pathComponents, 'index.ts'), code, 'utf-8')
}

consola.info(chalk.blue('generating vue components'))
await ensureDir(pathComponents)
await emptyDir(pathComponents)
const files = await getSvgFiles()

const groupedFiles = files.reduce((groups, file) => {
  const name = file.split('-').slice(0, -1).join('-')
  if (!groups[name]) groups[name] = []
  groups[name].push(file)
  return groups
}, {} as Record<string, string[]>)

consola.info(chalk.blue('generating vue files'))
;(async () => {
  for (const name of Object.keys(groupedFiles)) {
    await transformToVueComponent(groupedFiles[name], name)
  }
})()

consola.info(chalk.blue('generating entry file'))
await generateEntry(Object.keys(groupedFiles))

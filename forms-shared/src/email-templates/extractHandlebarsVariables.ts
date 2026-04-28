import Handlebars from 'handlebars'

/* Created by Claude */

const extractHandlebarsVariables = (template: string): string[] => {
  const ast = Handlebars.parse(template)
  const seenVariables = new Set<string>()
  const result: string[] = []

  const addRoot = (rootSegment: string | undefined) => {
    if (!rootSegment || seenVariables.has(rootSegment)) return
    seenVariables.add(rootSegment)
    result.push(rootSegment)
  }

  const visitProgram = (program: hbs.AST.Program | undefined) => {
    if (!program) return
    for (const statement of program.body) {
      if (statement.type === 'MustacheStatement') {
        const mustache = statement as hbs.AST.MustacheStatement
        if (mustache.path.type === 'PathExpression') {
          addRoot((mustache.path as hbs.AST.PathExpression).parts[0])
        }
      } else if (statement.type === 'BlockStatement') {
        const block = statement as hbs.AST.BlockStatement
        for (const parameter of block.params) {
          if (parameter.type === 'PathExpression') {
            addRoot((parameter as hbs.AST.PathExpression).parts[0])
          }
        }
        visitProgram(block.program)
        visitProgram(block.inverse)
      }
    }
  }

  visitProgram(ast)
  return result
}

export default extractHandlebarsVariables

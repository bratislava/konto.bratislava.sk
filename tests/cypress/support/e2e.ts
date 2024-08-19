import './commands/global'
import './commands/registration'
import './commands/account'
import './commands/form'
import './triggers/before'
import '@frsource/cypress-plugin-visual-regression-diff'
import 'cypress-file-upload'

const app = window.top
if (!app.document.head.querySelector('[data-testid="snapshot-controls]')) {
  const style = app.document.createElement('style')
  style.innerHTML = '[data-testid="snapshot-controls"] { display: none }'
  app.document.head.appendChild(style)
}

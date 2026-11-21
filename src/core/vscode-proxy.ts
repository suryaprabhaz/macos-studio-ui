let vscodeApi: any = null;
try {
  vscodeApi = require('vscode');
} catch {
  // vscode is only injected during runtime/vscode test runner
}

export function getVSCode(): any {
  return vscodeApi;
}

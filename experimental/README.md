# Experimental Size

```
pnpm tsc src/main.ts
pnpm parcel build --detailed-report 2000
ls -alh dist/
```

**Without** Ed25519 supported in browser (polyfill imported):

|||
| :--- | :--- |
| index.browser.js | 59 Kb |
| index.browser.js.gz | 21 Kb |
| index.browser.js.map | 1.2 Mb |
| index.node.js | 104 Kb |
| index.node.js.gz | 34 Kb |
| index.node.js.map | 1.1 Mb |

**With** Ed25519 supported in browser (no polyfill):

|||
| :--- | :--- |
| index.browser.js | 12 Kb |
| index.browser.js.gz | 4.5 Kb |
| index.browser.js.map | 712 Kb |
| index.node.js | 57 Kb |
| index.node.js.gz | 17 Kb |
| index.node.js.map | 853 Kb |
const fs = require('fs');

const files = [
  'd:\\Js\\cms_sma\\app\\dashboard\\skl\\SklDashboardClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\ppdb\\PpdbDashboardClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\pages\\PagesListClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\organigram\\page.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\menus\\MenuBuilderClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\komentar\\CommentModClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\identity\\page.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\berita\\DeleteArticleButton.tsx'
];

for(const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if(!content.includes('showConfirm')) {
    content = content.replace(/import { (.*?) } from "@\/lib\/swal";/, 'import { $1, showConfirm } from "@/lib/swal";');
    if(!content.includes('showConfirm')) {
         content = content.replace(/import {([^}]*?)showAlert([^}]*?)} from "@\/lib\/swal";/, 'import {$1showAlert$2, showConfirm} from "@/lib/swal";');
    }
  }

  // replace if (!confirm("...")) return; -> const isOk = await showConfirm("..."); if(!isOk) return;
  content = content.replace(/if\s*\(!confirm\((.*?)\)\)\s*(return;?|continue;?|break;?)/g, 'if (!(await showConfirm($1))) $2');
  content = content.replace(/if\s*\(confirm\((.*?)\)\)\s*\{/g, 'if (await showConfirm($1)) {');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}

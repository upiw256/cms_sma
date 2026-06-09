const fs = require('fs');
const path = require('path');

const files = [
  'd:\\Js\\cms_sma\\app\\dashboard\\skl\\SklDashboardClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\ppdb\\PpdbDashboardClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\pages\\PagesListClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\pages\\builder\\[id]\\PageBuilderClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\menus\\MenuBuilderClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\komentar\\CommentModClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\identity\\page.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\guru\\nilai\\GradesGridClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\berita\\edit\\[id]\\EditBeritaClient.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\berita\\DeleteArticleButton.tsx',
  'd:\\Js\\cms_sma\\app\\dashboard\\berita\\create\\page.tsx'
];

for(const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if(!content.includes('import { showToast, showAlert } from "@/lib/swal"')) {
    const importStr = 'import { showToast, showAlert } from "@/lib/swal";\n';
    const match = content.match(/import /);
    if(match) {
      content = content.replace(/import /, importStr + 'import ');
    } else {
      content = importStr + content;
    }
  }

  content = content.replace(/alert\("([^"]*berhasil[^"]*)"\)/gi, 'showToast("$1", "success")');
  content = content.replace(/alert\('([^']*berhasil[^']*)'\)/gi, "showToast('$1', 'success')");
  
  content = content.replace(/alert\((.*)\)/g, (match, p1) => {
    if(match.includes('showToast')) return match; 
    if(p1.toLowerCase().includes('gagal') || p1.toLowerCase().includes('error')) {
      return `showAlert({ text: ${p1}, icon: "error" })`;
    } else if (p1.includes('res.message') || p1.includes('err.message') || p1.includes('err?.message')) {
      return `showAlert({ text: ${p1}, icon: "error" })`;
    }
    return `showAlert({ text: ${p1}, icon: "warning" })`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {importPDF,exportPDF} from '../assets/pdf.js';
const require=createRequire(import.meta.url),P=require('../assets/pdf-lib.min.js');
globalThis.PDFLib=P;
globalThis.document={createElement:()=>({}),head:{append:s=>queueMicrotask(()=>s.onload())}};
test('PDF form import preserves text and checkboxes; edited fields round-trip to PDF',async()=>{const doc=await P.PDFDocument.create(),page=doc.addPage(),form=doc.getForm();form.createTextField('Nom').setText('Hero');form.getTextField('Nom').addToPage(page);form.createCheckBox('Rang1').addToPage(page);form.getCheckBox('Rang1').check();const bytes=await doc.save();const data=await importPDF({name:'hero.pdf',size:bytes.length,arrayBuffer:async()=>bytes.buffer});assert.equal(data.pdfFields.find(f=>f.name==='Nom').value,'Hero');assert.equal(data.pdfFields.find(f=>f.name==='Rang1').value,true);data.pdfFields.find(f=>f.name==='Nom').value='New hero';const result=await P.PDFDocument.load(await exportPDF(data));assert.equal(result.getForm().getTextField('Nom').getText(),'New hero');});
test('Flattened PDF is retained without pretending to extract editable fields',async()=>{const d=await P.PDFDocument.create();d.addPage();const bytes=await d.save();const data=await importPDF({name:'flat.pdf',size:bytes.length,arrayBuffer:async()=>bytes.buffer});assert.equal(data.pdfFields.length,0);assert.ok(data.pdf);});

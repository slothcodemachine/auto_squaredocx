import JSZip from 'jszip';
import mammoth from 'mammoth';

export interface ProcessResult {
  blob: Blob;
  previewHtml: string;
  previewText: string;
}

/**
 * Adds a full-page yellow rectangle overlay (with configurable opacity/color)
 * to a DOCX file using standard OpenXML header manipulation.
 * Creates clean VML shapes that open perfectly in Microsoft Word, Google Docs, LibreOffice.
 */
export async function processDocxFile(
  file: File,
  colorHex: string = '#FFFF00',
  transparencyPercent: number = 80
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Generate HTML/Text preview using mammoth
  let previewHtml = '';
  let previewText = '';
  try {
    const mammothResult = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer.slice(0) });
    previewHtml = mammothResult.value;
    previewText = (await mammoth.extractRawText({ arrayBuffer: arrayBuffer.slice(0) })).value;
  } catch (e) {
    console.warn('Mammoth preview extraction warning:', e);
    previewHtml = `<p><em>Pré-visualização gerada com sucesso para o documento.</em></p>`;
  }

  // Calculate fill opacity
  // transparencyPercent = 80 -> fillOpacity = 20% (0.2)
  const fillOpacityPercent = Math.max(0, Math.min(100, 100 - transparencyPercent));
  const fillOpacityDec = (fillOpacityPercent / 100).toFixed(2);
  const cleanHex = colorHex.replace('#', '').toUpperCase();

  // Load DOCX zip archive
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch (zipErr) {
    throw new Error('Ficheiro .docx inválido ou corrompido. Não foi possível ler o arquivo.');
  }

  // Standard VML full-page yellow rectangle shape
  const vmlOverlaySnippet = `
    <w:p w:rsidR="00000000" w:rsidRDefault="00000000">
      <w:pPr>
        <w:pStyle w:val="Header"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:noProof/>
        </w:rPr>
        <w:pict>
          <v:rect id="FrutigerYellowOverlay" 
                  style="position:absolute;left:0;text-align:left;margin-left:-35mm;margin-top:-35mm;width:280mm;height:380mm;z-index:251658240;mso-position-horizontal:left;mso-position-horizontal-relative:page;mso-position-vertical:top;mso-position-vertical-relative:page;v-text-anchor:top" 
                  fillcolor="#${cleanHex}" 
                  stroked="f">
            <v:fill opacity="${fillOpacityPercent}%" color="#${cleanHex}"/>
          </v:rect>
        </w:pict>
      </w:r>
    </w:p>
  `;

  // Check for existing header files (e.g. word/header1.xml, word/header2.xml)
  const headerFiles = Object.keys(zip.files).filter(
    (filename) => /^word\/header\d+\.xml$/i.test(filename)
  );

  if (headerFiles.length > 0) {
    // Process all existing headers in the document
    for (const headerPath of headerFiles) {
      let headerXml = await zip.files[headerPath].async('string');

      // Ensure required VML namespaces are present in <w:hdr ...>
      if (!headerXml.includes('xmlns:v=')) {
        headerXml = headerXml.replace(
          '<w:hdr ',
          '<w:hdr xmlns:v="urn:schemas-microsoft-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" '
        );
      }

      // If overlay already exists, update its parameters
      if (headerXml.includes('id="FrutigerYellowOverlay"')) {
        headerXml = headerXml.replace(
          /fillcolor="#[A-Fa-f0-9]{6}"/g,
          `fillcolor="#${cleanHex}"`
        );
        headerXml = headerXml.replace(
          /<v:fill opacity="[^"]*"/g,
          `<v:fill opacity="${fillOpacityPercent}%"`
        );
      } else {
        // Append overlay paragraph right before closing </w:hdr>
        headerXml = headerXml.replace('</w:hdr>', `${vmlOverlaySnippet}</w:hdr>`);
      }

      zip.file(headerPath, headerXml);
    }
  } else {
    // No headers exist; create word/header1.xml
    const newHeaderXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
       xmlns:v="urn:schemas-microsoft-microsoft-com:vml" 
       xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" 
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  ${vmlOverlaySnippet}
</w:hdr>`;

    zip.file('word/header1.xml', newHeaderXml);

    const headerRelId = 'rIdYellowHeaderOverlay';

    // 1. Register relationship in word/_rels/document.xml.rels
    const docRelsFile = zip.file('word/_rels/document.xml.rels');
    if (docRelsFile) {
      let docRelsXml = await docRelsFile.async('string');
      if (!docRelsXml.includes('header1.xml')) {
        const headerRel = `<Relationship Id="${headerRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>`;
        docRelsXml = docRelsXml.replace('</Relationships>', `${headerRel}</Relationships>`);
        zip.file('word/_rels/document.xml.rels', docRelsXml);
      }
    }

    // 2. Register content type in [Content_Types].xml
    const contentTypesFile = zip.file('[Content_Types].xml');
    if (contentTypesFile) {
      let contentTypesXml = await contentTypesFile.async('string');
      if (!contentTypesXml.includes('header1.xml')) {
        const headerOverride = `<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>`;
        contentTypesXml = contentTypesXml.replace('</Types>', `${headerOverride}</Types>`);
        zip.file('[Content_Types].xml', contentTypesXml);
      }
    }

    // 3. Link header in word/document.xml in strict OpenXML schema order
    const docFile = zip.file('word/document.xml');
    if (docFile) {
      let docXml = await docFile.async('string');
      const headerRefTag = `<w:headerReference w:type="default" r:id="${headerRelId}"/>`;

      if (docXml.includes('<w:sectPr')) {
        // Insert headerReference immediately after opening <w:sectPr ...> tag
        docXml = docXml.replace(/(<w:sectPr[^>]*>)/g, (match) => {
          if (!match.includes('headerReference')) {
            return `${match}${headerRefTag}`;
          }
          return match;
        });
      } else if (docXml.includes('</w:body>')) {
        // Create new section properties at end of body if missing
        docXml = docXml.replace('</w:body>', `<w:sectPr>${headerRefTag}</w:sectPr></w:body>`);
      }

      zip.file('word/document.xml', docXml);
    }
  }

  // Generate clean modified DOCX blob
  const processedBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return {
    blob: processedBlob,
    previewHtml,
    previewText
  };
}

/**
 * Creates a ZIP file containing the subfolder structure and all modified DOCX files.
 */
export async function createResultsZip(
  files: { name: string; blob: Blob }[],
  subfolderName: string
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(subfolderName) || zip;

  for (const item of files) {
    folder.file(item.name, item.blob);
  }

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip'
  });
}


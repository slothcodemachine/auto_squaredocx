import JSZip from 'jszip';
import mammoth from 'mammoth';

export interface ProcessResult {
  blob: Blob;
  previewHtml: string;
  previewText: string;
}

/**
 * Adds a full-page yellow rectangle overlay (with configurable opacity/color)
 * to a DOCX file using OpenXML header manipulation and background colors.
 */
export async function processDocxFile(
  file: File,
  colorHex: string = '#FFFF00',
  transparencyPercent: number = 80
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Generate HTML/Text preview using mammoth
  let previewHtml = '';
  let previewText = '';
  try {
    const mammothResult = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer.slice(0) });
    previewHtml = mammothResult.value;
    previewText = (await mammoth.extractRawText({ arrayBuffer: arrayBuffer.slice(0) })).value;
  } catch (e) {
    console.warn('Mammoth preview extraction error:', e);
    previewHtml = `<p><em>Preview não disponível para este ficheiro, mas a modificação será efetuada normalmente.</em></p>`;
  }

  // Calculate fill opacity
  // transparencyPercent = 80 -> fillOpacity = 0.20 (20% opacity / 80% transparent)
  const opacityRatio = Math.max(0, Math.min(1, (100 - transparencyPercent) / 100));
  const fillOpacityStr = opacityRatio.toFixed(2);
  const cleanHex = colorHex.replace('#', '').toUpperCase();

  // Load DOCX with JSZip
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Process or Create Header XML files
  const headerFiles = Object.keys(zip.files).filter(
    (filename) => /^word\/header\d+\.xml$/i.test(filename)
  );

  const vmlOverlaySnippet = `
    <w:p w:rsidR="00000000" w:rsidRDefault="00000000">
      <w:pPr>
        <w:pStyle w:val="Header"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:noProof/>
        </w:rPr>
        <mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
          <mc:Choice Requires="v">
            <w:pict>
              <v:rect id="FrutigerYellowOverlay" style="position:absolute;left:0;text-align:left;margin-left:-30mm;margin-top:-30mm;width:270mm;height:360mm;z-index:251658240;mso-position-horizontal:left;mso-position-horizontal-relative:page;mso-position-vertical:top;mso-position-vertical-relative:page;v-text-anchor:top" fillcolor="#${cleanHex}" stroked="f">
                <v:fill opacity="${fillOpacityStr}"/>
              </v:rect>
            </w:pict>
          </mc:Choice>
          <mc:Fallback>
            <w:pict>
              <v:rect id="FrutigerYellowOverlay" style="position:absolute;left:0;text-align:left;margin-left:-30mm;margin-top:-30mm;width:270mm;height:360mm;z-index:251658240;mso-position-horizontal:left;mso-position-horizontal-relative:page;mso-position-vertical:top;mso-position-vertical-relative:page;v-text-anchor:top" fillcolor="#${cleanHex}" stroked="f">
                <v:fill opacity="${fillOpacityStr}"/>
              </v:rect>
            </w:pict>
          </mc:Fallback>
        </mc:AlternateContent>
      </w:r>
    </w:p>
  `;

  if (headerFiles.length > 0) {
    // Inject overlay into all existing header XMLs
    for (const headerPath of headerFiles) {
      let headerXml = await zip.files[headerPath].async('string');
      
      // Ensure VML namespaces exist in <w:hdr ...>
      if (!headerXml.includes('xmlns:v=')) {
        headerXml = headerXml.replace(
          '<w:hdr ',
          '<w:hdr xmlns:v="urn:schemas-microsoft-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" '
        );
      }

      // Check if overlay already exists in header
      if (headerXml.includes('id="FrutigerYellowOverlay"')) {
        // Update existing overlay parameters
        headerXml = headerXml.replace(
          /fillcolor="#[A-Fa-f0-9]{6}"/g,
          `fillcolor="#${cleanHex}"`
        );
        headerXml = headerXml.replace(
          /<v:fill opacity="[^"]*"\/>/g,
          `<v:fill opacity="${fillOpacityStr}"/>`
        );
      } else {
        // Insert overlay right after opening <w:hdr ...> tag
        headerXml = headerXml.replace(/<w:hdr([^>]*)>/, `<w:hdr$1>${vmlOverlaySnippet}`);
      }

      zip.file(headerPath, headerXml);
    }
  } else {
    // No header XML found; create new word/header1.xml
    const newHeaderXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
       xmlns:v="urn:schemas-microsoft-microsoft-com:vml" 
       xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" 
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
       xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
  ${vmlOverlaySnippet}
</w:hdr>`;

    zip.file('word/header1.xml', newHeaderXml);

    // Register relationship in word/_rels/document.xml.rels
    let docRelsXml = '';
    const docRelsFile = zip.file('word/_rels/document.xml.rels');
    if (docRelsFile) {
      docRelsXml = await docRelsFile.async('string');
      if (!docRelsXml.includes('Target="header1.xml"')) {
        const headerRel = `<Relationship Id="rIdFrutigerHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>`;
        docRelsXml = docRelsXml.replace('</Relationships>', `${headerRel}</Relationships>`);
        zip.file('word/_rels/document.xml.rels', docRelsXml);
      }
    }

    // Register content type in [Content_Types].xml
    let contentTypesXml = '';
    const contentTypesFile = zip.file('[Content_Types].xml');
    if (contentTypesFile) {
      contentTypesXml = await contentTypesFile.async('string');
      if (!contentTypesXml.includes('PartName="/word/header1.xml"')) {
        const headerOverride = `<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>`;
        contentTypesXml = contentTypesXml.replace('</Types>', `${headerOverride}</Types>`);
        zip.file('[Content_Types].xml', contentTypesXml);
      }
    }

    // Link header in word/document.xml
    const docFile = zip.file('word/document.xml');
    if (docFile) {
      let docXml = await docFile.async('string');
      const headerRefTag = `<w:headerReference w:type="default" r:id="rIdFrutigerHeader"/>`;

      // Check if <w:sectPr> exists
      if (docXml.includes('<w:sectPr')) {
        docXml = docXml.replace(/<w:sectPr([^>]*)>/g, `<w:sectPr$1>${headerRefTag}`);
      } else if (docXml.includes('</w:body>')) {
        docXml = docXml.replace('</w:body>', `<w:sectPr>${headerRefTag}</w:sectPr></w:body>`);
      }

      zip.file('word/document.xml', docXml);
    }
  }

  // 2. Also set background color in word/document.xml for additional soft tint layer
  const docFile = zip.file('word/document.xml');
  if (docFile) {
    let docXml = await docFile.async('string');

    // Add w:background tag if not present
    if (!docXml.includes('<w:background')) {
      const backgroundXml = `<w:background w:color="${cleanHex}"/>`;
      docXml = docXml.replace(/<w:document([^>]*)>/, `<w:document$1>${backgroundXml}`);
    } else {
      docXml = docXml.replace(
        /<w:background w:color="[^"]*"\/>/g,
        `<w:background w:color="${cleanHex}"/>`
      );
    }

    zip.file('word/document.xml', docXml);
  }

  // Generate updated zip blob
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

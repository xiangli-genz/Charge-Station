param(
  [string]$OutFile = (Join-Path $PSScriptRoot '..\DeCuong_DoAn_TramSac_GNN.docx')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Escape-Xml {
  param([string]$Text)
  return [System.Security.SecurityElement]::Escape($Text)
}

function New-Paragraph {
  param(
    [string]$Text = '',
    [string]$Style = 'Normal',
    [string]$Align
  )

  $escaped = Escape-Xml $Text
  $pPr = "<w:pPr><w:pStyle w:val='$Style'/>"
  if ($Align) {
    $pPr += "<w:jc w:val='$Align'/>"
  }
  $pPr += "</w:pPr>"

  if ($Text -eq '') {
    return "<w:p>$pPr</w:p>"
  }

  return "<w:p>$pPr<w:r><w:t xml:space='preserve'>$escaped</w:t></w:r></w:p>"
}

function New-PageBreak {
  return "<w:p><w:r><w:br w:type='page'/></w:r></w:p>"
}

$staging = Join-Path $PSScriptRoot 'docx-staging'
if (Test-Path $staging) {
  Remove-Item $staging -Recurse -Force
}

New-Item -ItemType Directory -Path $staging | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging '_rels') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging 'word') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging 'word\_rels') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging 'docProps') | Out-Null

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

$rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="R1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="R2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="R3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

$docRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>
'@

$coreProps = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>De cuong do an tram sac GNN</dc:title>
  <dc:subject>Do an tot nghiep ky su</dc:subject>
  <dc:creator>Codex</dc:creator>
  <cp:keywords>tram sac, GNN, web app, do an tot nghiep</cp:keywords>
  <dc:description>De cuong mo ta muc tieu va pham vi du an he thong web ho tro du doan va de xuat vi tri dat tram sac xe dien bang GNN.</dc:description>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-08-04T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-08-04T00:00:00Z</dcterms:modified>
</cp:coreProperties>
'@

$appProps = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Title</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>De cuong do an</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company></Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
'@

$styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:jc w:val="center"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:szCs w:val="28"/>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="180" w:after="90"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
    </w:rPr>
  </w:style>
</w:styles>
'@

$contentPath = Join-Path $PSScriptRoot 'thesis_content.md'
$lines = Get-Content -LiteralPath $contentPath -Encoding UTF8

$paragraphs = New-Object System.Collections.Generic.List[string]
foreach ($line in $lines) {
  if ($line -eq '[[PAGEBREAK]]') {
    $paragraphs.Add((New-PageBreak))
    continue
  }

  if ($line.StartsWith('[[TITLE]]')) {
    $paragraphs.Add((New-Paragraph ($line.Substring(9)) 'Title' 'center'))
    continue
  }

  if ($line.StartsWith('[[CENTER]]')) {
    $paragraphs.Add((New-Paragraph ($line.Substring(10)) 'Normal' 'center'))
    continue
  }

  if ($line.StartsWith('# ')) {
    $paragraphs.Add((New-Paragraph ($line.Substring(2)) 'Heading1'))
    continue
  }

  if ($line.StartsWith('## ')) {
    $paragraphs.Add((New-Paragraph ($line.Substring(3)) 'Heading2'))
    continue
  }

  if ($line.StartsWith('- ')) {
    $paragraphs.Add((New-Paragraph ('• ' + $line.Substring(2)) 'Normal'))
    continue
  }

  $paragraphs.Add((New-Paragraph $line 'Normal'))
}

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
$($paragraphs -join "`n")
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

Set-Content -LiteralPath (Join-Path $staging '[Content_Types].xml') -Value $contentTypes -Encoding UTF8
Set-Content -LiteralPath (Join-Path $staging '_rels\.rels') -Value $rels -Encoding UTF8
Set-Content -LiteralPath (Join-Path $staging 'word\document.xml') -Value $documentXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $staging 'word\styles.xml') -Value $styles -Encoding UTF8
Set-Content -LiteralPath (Join-Path $staging 'word\_rels\document.xml.rels') -Value $docRels -Encoding UTF8
Set-Content -LiteralPath (Join-Path $staging 'docProps\core.xml') -Value $coreProps -Encoding UTF8
Set-Content -LiteralPath (Join-Path $staging 'docProps\app.xml') -Value $appProps -Encoding UTF8

if (Test-Path $OutFile) {
  Remove-Item $OutFile -Force
}

[System.IO.Compression.ZipFile]::CreateFromDirectory($staging, $OutFile)
Remove-Item $staging -Recurse -Force

Write-Host "Created: $OutFile"

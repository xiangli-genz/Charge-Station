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

$paragraphs = @(
  (New-Paragraph 'ĐỒ ÁN TỐT NGHIỆP KỸ SƯ' 'Title' 'center'),
  (New-Paragraph 'Hệ thống web hỗ trợ dự đoán và đề xuất vị trí đặt trạm sạc xe điện bằng Graph Neural Network' 'Heading1' 'center'),
  (New-Paragraph ''),
  (New-Paragraph 'Đề cương sơ bộ phục vụ trao đổi với giảng viên hướng dẫn' 'Normal' 'center'),
  (New-Paragraph ''),
  (New-Paragraph 'Sinh viên thực hiện: ..............................................................' 'Normal' 'center'),
  (New-Paragraph 'Giảng viên hướng dẫn: ...........................................................' 'Normal' 'center'),
  (New-Paragraph 'Năm học: 2026' 'Normal' 'center'),
  (New-Paragraph ''),
  (New-PageBreak),
  (New-Paragraph '1. Tên đề tài' 'Heading1'),
  (New-Paragraph 'Hệ thống web hỗ trợ dự đoán và đề xuất vị trí đặt trạm sạc xe điện bằng Graph Neural Network.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '2. Lý do chọn đề tài' 'Heading1'),
  (New-Paragraph 'Trong bối cảnh xe điện đang phát triển nhanh, nhu cầu xây dựng hạ tầng trạm sạc phù hợp về vị trí, mật độ và công suất ngày càng trở nên cấp thiết. Tuy nhiên, việc lựa chọn vị trí đặt trạm hiện nay thường dựa nhiều vào kinh nghiệm, khảo sát thủ công hoặc các tiêu chí rời rạc, nên khó đảm bảo tính tối ưu và khả năng mở rộng theo quy hoạch đô thị.' 'Normal'),
  (New-Paragraph 'Đề tài này hướng tới việc kết hợp web app, cơ sở dữ liệu không gian và mô hình Graph Neural Network (GNN) để phân tích mối quan hệ giữa các khu vực, từ đó đề xuất những vị trí có tiềm năng cao cho việc đặt trạm sạc mới. Đây là một bài toán vừa có tính ứng dụng thực tế, vừa có yếu tố nghiên cứu, phù hợp với yêu cầu của một đồ án tốt nghiệp kỹ sư.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '3. Mục tiêu tổng quát' 'Heading1'),
  (New-Paragraph 'Xây dựng một hệ thống web hỗ trợ quản lý dữ liệu trạm sạc và đề xuất khu vực phù hợp để đặt trạm sạc mới dựa trên dữ liệu không gian, dữ liệu hạ tầng xung quanh và mô hình học máy/học sâu theo hướng Graph Neural Network.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '4. Mục tiêu cụ thể' 'Heading1'),
  (New-Paragraph '• Quản lý dữ liệu trạm sạc hiện có, cổng sạc, giá sạc và trạng thái vận hành trên web.' 'Normal'),
  (New-Paragraph '• Thu thập và chuẩn hóa dữ liệu không gian như dân cư, giao thông, điểm quan tâm (POI), khu thương mại, bãi đỗ xe và các trạm sạc hiện tại.' 'Normal'),
  (New-Paragraph '• Biểu diễn các khu vực dưới dạng đồ thị để mô hình GNN có thể học quan hệ giữa các nút khu vực.' 'Normal'),
  (New-Paragraph '• Huấn luyện mô hình dự đoán để đánh giá mức độ phù hợp của từng khu vực đối với việc đặt trạm sạc mới.' 'Normal'),
  (New-Paragraph '• Hiển thị kết quả đề xuất trực quan trên bản đồ và danh sách ưu tiên để hỗ trợ ra quyết định.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '5. Tính cấp thiết và ý nghĩa thực tiễn' 'Heading1'),
  (New-Paragraph 'Đề tài có ý nghĩa thực tiễn cao vì giải quyết trực tiếp bài toán quy hoạch hạ tầng trạm sạc xe điện. Kết quả của hệ thống có thể hỗ trợ nhà đầu tư, đơn vị vận hành hoặc cơ quan quản lý trong việc lựa chọn vị trí triển khai trạm mới một cách khoa học hơn, thay vì chỉ dựa trên cảm tính.' 'Normal'),
  (New-Paragraph 'Ngoài ra, hệ thống còn có ý nghĩa nghiên cứu vì khai thác được dữ liệu đa nguồn và mô hình GNN cho bài toán không gian. Đây là hướng tiếp cận hiện đại, phù hợp với các bài toán recommendation không gian và quy hoạch đô thị thông minh.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '6. Phạm vi nghiên cứu' 'Heading1'),
  (New-Paragraph 'Đề tài tập trung vào bài toán hỗ trợ ra quyết định vị trí đặt trạm sạc mới, không đi sâu vào điều khiển thiết bị sạc thời gian thực. Phạm vi có thể triển khai ở cấp thành phố hoặc cấp quận/huyện, tùy theo nguồn dữ liệu thu thập được.' 'Normal'),
  (New-Paragraph 'Các nhóm dữ liệu chính gồm: dữ liệu trạm sạc hiện có, dữ liệu dân cư, dữ liệu giao thông, dữ liệu điểm quan tâm (POI), đặc điểm khu vực và các yếu tố xung quanh ảnh hưởng đến nhu cầu sạc.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '7. Đối tượng sử dụng hệ thống' 'Heading1'),
  (New-Paragraph '• Admin: quản lý dữ liệu trạm sạc, dữ liệu khu vực và chạy mô hình đề xuất.' 'Normal'),
  (New-Paragraph '• Người dùng/khách tham khảo: xem bản đồ, tra cứu trạm sạc hiện có và xem khu vực tiềm năng.' 'Normal'),
  (New-Paragraph '• Người ra quyết định: sử dụng kết quả hệ thống để tham khảo khi lập kế hoạch đầu tư hoặc mở rộng mạng lưới trạm sạc.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '8. Ý tưởng tổng quan của hệ thống' 'Heading1'),
  (New-Paragraph 'Hệ thống được xây dựng theo hướng web app kết hợp AI. Phần web đảm nhiệm việc thu thập, lưu trữ, quản lý và hiển thị dữ liệu; phần AI/GNN đảm nhiệm việc học từ dữ liệu không gian để dự đoán khu vực phù hợp.' 'Normal'),
  (New-Paragraph 'Về logic nghiệp vụ, hệ thống không chỉ cho phép tìm trạm sạc hiện có mà còn đưa ra gợi ý cho những khu vực nên đặt trạm mới. Điều này tạo ra giá trị khác biệt so với một website quản lý trạm sạc thông thường.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph 'Sơ đồ chức năng khái quát:' 'Normal'),
  (New-Paragraph 'Hệ thống' 'Normal'),
  (New-Paragraph '├─ Người dùng: tìm kiếm trạm, xem chi tiết, xem bản đồ đề xuất' 'Normal'),
  (New-Paragraph '└─ Admin: đăng nhập, quản lý dữ liệu, chạy mô hình, xem đề xuất, xuất báo cáo' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '9. Chức năng chính của dự án' 'Heading1'),
  (New-Paragraph '• Đăng nhập và phân quyền admin.' 'Normal'),
  (New-Paragraph '• Quản lý trạm sạc: thêm, sửa, xóa, xem danh sách, xem chi tiết.' 'Normal'),
  (New-Paragraph '• Quản lý cổng sạc: mã cổng, loại đầu cắm, công suất, trạng thái và giá áp dụng.' 'Normal'),
  (New-Paragraph '• Quản lý dữ liệu không gian: khu vực, POI, giao thông, dân cư, mật độ khu vực.' 'Normal'),
  (New-Paragraph '• Tìm kiếm trạm sạc theo từ khóa, vị trí, loại cổng, công suất và trạng thái.' 'Normal'),
  (New-Paragraph '• Chạy mô hình GNN để đánh giá tiềm năng của khu vực.' 'Normal'),
  (New-Paragraph '• Hiển thị bản đồ nhiệt và danh sách vị trí được đề xuất theo mức ưu tiên.' 'Normal'),
  (New-Paragraph '• Thống kê và báo cáo phục vụ phân tích quản lý.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '10. Dữ liệu đầu vào dự kiến' 'Heading1'),
  (New-Paragraph 'Dữ liệu đầu vào có thể được thu thập từ các nguồn mở hoặc API bản đồ. Các nhóm dữ liệu chính gồm: tọa độ trạm sạc hiện có, loại cổng sạc, công suất, giá sạc, dân cư theo khu vực, mạng lưới giao thông, điểm quan tâm xung quanh, khu dân cư, trung tâm thương mại, bãi đỗ xe và các tín hiệu phản ánh nhu cầu sử dụng.' 'Normal'),
  (New-Paragraph 'Khi dữ liệu đủ lớn, có thể xây dựng đồ thị nhiều lớp hoặc đồ thị đa quan hệ để mô hình học được sự tương tác giữa các khu vực lân cận, đường giao thông và nơi tập trung nhu cầu thực tế.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '11. Phương pháp thực hiện' 'Heading1'),
  (New-Paragraph 'Đề tài được triển khai theo hướng kết hợp phát triển phần mềm và nghiên cứu thực nghiệm. Quy trình dự kiến gồm: thu thập dữ liệu, làm sạch và chuẩn hóa dữ liệu, biểu diễn dữ liệu dưới dạng đồ thị, huấn luyện mô hình GNN, đánh giá kết quả và tích hợp vào giao diện web.' 'Normal'),
  (New-Paragraph 'Mô hình có thể được so sánh với một số phương pháp truyền thống như heuristic, hồi quy, mô hình cây quyết định hoặc các biến thể machine learning khác để làm rõ ưu điểm của hướng tiếp cận GNN.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '12. Công nghệ đề xuất' 'Heading1'),
  (New-Paragraph '• Frontend/Backend: Node.js, Express, TypeScript.' 'Normal'),
  (New-Paragraph '• Cơ sở dữ liệu: MongoDB.' 'Normal'),
  (New-Paragraph '• Xác thực: JWT.' 'Normal'),
  (New-Paragraph '• Bản đồ và dữ liệu vị trí: API bản đồ hoặc dịch vụ geocoding/reverse geocoding.' 'Normal'),
  (New-Paragraph '• AI/ML: Python hoặc môi trường phù hợp để huấn luyện GNN, sau đó tích hợp kết quả về web.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '13. Kết quả dự kiến' 'Heading1'),
  (New-Paragraph 'Sau khi hoàn thành, đề tài dự kiến tạo ra một hệ thống web có thể phục vụ đồng thời cho hai mục đích: quản lý dữ liệu trạm sạc và hỗ trợ ra quyết định quy hoạch trạm mới. Hệ thống cho phép xem bản đồ, tra cứu dữ liệu, nhận đề xuất khu vực tiềm năng và trực quan hóa kết quả theo mức độ ưu tiên.' 'Normal'),
  (New-Paragraph 'Ngoài sản phẩm phần mềm, đề tài còn tạo ra một hướng tiếp cận nghiên cứu có thể mở rộng cho các bài toán quy hoạch hạ tầng đô thị thông minh khác.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '14. Kế hoạch triển khai' 'Heading1'),
  (New-Paragraph 'Giai đoạn 1: khảo sát đề tài, thu thập tài liệu, xác định bài toán và xây dựng phạm vi.' 'Normal'),
  (New-Paragraph 'Giai đoạn 2: thiết kế cơ sở dữ liệu, xây dựng backend và các API quản lý.' 'Normal'),
  (New-Paragraph 'Giai đoạn 3: xây dựng module bản đồ, tìm kiếm và hiển thị dữ liệu.' 'Normal'),
  (New-Paragraph 'Giai đoạn 4: tiền xử lý dữ liệu, xây dựng đồ thị và huấn luyện mô hình GNN.' 'Normal'),
  (New-Paragraph 'Giai đoạn 5: tích hợp kết quả dự đoán vào hệ thống web và hoàn thiện báo cáo thực nghiệm.' 'Normal'),
  (New-Paragraph ''),
  (New-Paragraph '15. Kết luận' 'Heading1'),
  (New-Paragraph 'Đề tài có tính ứng dụng rõ ràng, phù hợp với định hướng đồ án tốt nghiệp kỹ sư vì vừa có thành phần hệ thống phần mềm, vừa có thành phần nghiên cứu trí tuệ nhân tạo. Hệ thống không chỉ dừng ở mức quản lý trạm sạc mà còn cung cấp chức năng đề xuất vị trí đặt trạm mới dựa trên dữ liệu và mô hình học máy, qua đó thể hiện được tính thực tiễn, tính nghiên cứu và khả năng mở rộng của đề tài.' 'Normal')
)

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

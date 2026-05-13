import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
}

interface SectionMapping {
  folder_name: string;
  target_table: string;
  display_name: string;
}

interface SectionStats {
  name: string;
  table: string;
  postsFound: number;
  postsCreated: number;
  skipped: number;
  errors: string[];
  details: PostDetail[];
}

interface PostDetail {
  name: string;
  status: 'created' | 'skipped' | 'error';
  contentSource: string | null;
  contentLength: number;
  imagesFound: number;
  imagesUploaded: number;
  mainImage: string | null;
  error?: string;
}

interface SyncResult {
  success: boolean;
  foldersProcessed: number;
  postsCreated: number;
  postsSkipped: number;
  errors: string[];
  sections: SectionStats[];
  skippedSections: string[];
}

// Cache for section mappings
let cachedMappings: SectionMapping[] | null = null;

// Load section mappings from database
async function loadSectionMappings(supabase: any): Promise<SectionMapping[]> {
  if (cachedMappings) {
    return cachedMappings;
  }
  
  const { data, error } = await supabase
    .from('drive_section_mappings')
    .select('folder_name, target_table, display_name')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error loading section mappings:', error);
    return [];
  }
  
  cachedMappings = data || [];
  console.log(`Loaded ${cachedMappings.length} section mappings from database`);
  return cachedMappings;
}

// Normalize folder name for matching
function normalizeFolderName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

// Find matching section for a folder name
async function findSectionMapping(
  supabase: any,
  folderName: string
): Promise<{ table: string; displayName: string } | null> {
  const mappings = await loadSectionMappings(supabase);
  const normalized = normalizeFolderName(folderName);
  
  // Try exact match first
  const exactMatch = mappings.find(m => normalizeFolderName(m.folder_name) === normalized);
  if (exactMatch) {
    return { table: exactMatch.target_table, displayName: exactMatch.display_name };
  }
  
  // Try partial match
  for (const mapping of mappings) {
    const mappingNormalized = normalizeFolderName(mapping.folder_name);
    if (normalized.includes(mappingNormalized) || mappingNormalized.includes(normalized)) {
      return { table: mapping.target_table, displayName: mapping.display_name };
    }
  }
  
  return null;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  const data = await response.json();
  return data.access_token;
}

async function listFolders(accessToken: string, parentId: string): Promise<DriveFile[]> {
  const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,parents)`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  const data = await response.json();
  return data.files || [];
}

async function listFilesInFolder(accessToken: string, folderId: string): Promise<DriveFile[]> {
  const query = `'${folderId}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  const data = await response.json();
  return data.files || [];
}

async function downloadFile(accessToken: string, fileId: string): Promise<ArrayBuffer> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.arrayBuffer();
}

async function exportGoogleDoc(accessToken: string, fileId: string): Promise<string> {
  // Try HTML first for better formatting, fallback to plain text
  try {
    const htmlUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html`;
    const htmlResponse = await fetch(htmlUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (htmlResponse.ok) {
      const html = await htmlResponse.text();
      // Convert HTML to clean text while preserving structure
      const cleanText = convertHtmlToText(html);
      if (cleanText && cleanText.length > 20) {
        console.log(`📄 Exported Google Doc as HTML (${cleanText.length} chars)`);
        return cleanText;
      }
    }
  } catch (e) {
    console.log('HTML export failed, trying plain text');
  }
  
  // Fallback to plain text
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.text();
}

// Convert HTML to clean text while preserving paragraph structure
function convertHtmlToText(html: string): string {
  // Remove style and script tags
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  
  // Convert block elements to newlines
  text = text
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n');
  
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lrm;/g, '')
    .replace(/&rlm;/g, '');
  
  // Clean up whitespace
  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  return text;
}


// Improved DOCX extraction - properly unzips and parses XML
async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log(`📄 Extracting DOCX content (${buffer.byteLength} bytes)`);
    
    // DOCX files are ZIP archives - we need to find and extract document.xml
    const uint8Array = new Uint8Array(buffer);
    
    // Find the document.xml file within the ZIP
    // ZIP files have a specific structure - look for the file entry
    const documentXml = await extractFileFromZip(uint8Array, 'word/document.xml');
    
    if (!documentXml) {
      console.log('❌ Could not find word/document.xml in DOCX');
      return extractTextFallback(buffer);
    }
    
    console.log(`✅ Found document.xml (${documentXml.length} chars)`);
    
    // Parse the XML to extract text from w:t tags
    const text = parseWordXml(documentXml);
    
    if (text && text.length > 10) {
      console.log(`✅ Extracted ${text.length} chars from DOCX`);
      return text;
    }
    
    return extractTextFallback(buffer);
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    return extractTextFallback(buffer);
  }
}

// Extract a specific file from a ZIP archive (simple implementation)
async function extractFileFromZip(zipData: Uint8Array, targetFile: string): Promise<string | null> {
  try {
    // Find the Local File Header for the target file
    // ZIP Local File Header signature: 0x04034b50 (PK\x03\x04)
    const signature = [0x50, 0x4B, 0x03, 0x04];
    
    let pos = 0;
    while (pos < zipData.length - 30) {
      // Check for local file header signature
      if (zipData[pos] === signature[0] && 
          zipData[pos + 1] === signature[1] &&
          zipData[pos + 2] === signature[2] &&
          zipData[pos + 3] === signature[3]) {
        
        // Read header fields
        const compressionMethod = zipData[pos + 8] | (zipData[pos + 9] << 8);
        const compressedSize = zipData[pos + 18] | (zipData[pos + 19] << 8) | 
                               (zipData[pos + 20] << 16) | (zipData[pos + 21] << 24);
        const uncompressedSize = zipData[pos + 22] | (zipData[pos + 23] << 8) | 
                                  (zipData[pos + 24] << 16) | (zipData[pos + 25] << 24);
        const fileNameLength = zipData[pos + 26] | (zipData[pos + 27] << 8);
        const extraFieldLength = zipData[pos + 28] | (zipData[pos + 29] << 8);
        
        // Extract filename
        const fileNameBytes = zipData.slice(pos + 30, pos + 30 + fileNameLength);
        const fileName = new TextDecoder('utf-8').decode(fileNameBytes);
        
        // Check if this is the file we're looking for
        if (fileName === targetFile || fileName.endsWith('document.xml')) {
          console.log(`📁 Found ${fileName} (compression: ${compressionMethod}, size: ${compressedSize}/${uncompressedSize})`);
          
          const dataStart = pos + 30 + fileNameLength + extraFieldLength;
          const dataEnd = dataStart + (compressedSize > 0 ? compressedSize : uncompressedSize);
          const fileData = zipData.slice(dataStart, dataEnd);
          
          // Handle compression
          if (compressionMethod === 0) {
            // No compression (stored)
            return new TextDecoder('utf-8').decode(fileData);
          } else if (compressionMethod === 8) {
            // Deflate compression - use DecompressionStream
            try {
              const decompressed = await decompressDeflate(fileData);
              return new TextDecoder('utf-8').decode(decompressed);
            } catch (e) {
              console.error('Decompression failed:', e);
              // Try reading as-is
              return new TextDecoder('utf-8').decode(fileData);
            }
          }
        }
        
        // Move to next file entry
        pos = pos + 30 + fileNameLength + extraFieldLength + compressedSize;
      } else {
        pos++;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting from ZIP:', error);
    return null;
  }
}

// Decompress deflate data using Web Streams API
async function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  // Add zlib header for raw deflate data
  const zlibData = new Uint8Array(data.length + 2);
  zlibData[0] = 0x78; // CMF
  zlibData[1] = 0x9C; // FLG
  zlibData.set(data, 2);
  
  try {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();
    
    writer.write(data);
    writer.close();
    
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Concatenate chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  } catch (e) {
    // Fallback: try without raw deflate
    try {
      const ds = new DecompressionStream('deflate');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      
      writer.write(zlibData);
      writer.close();
      
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    } catch (e2) {
      throw new Error(`Decompression failed: ${e}`);
    }
  }
}

// Parse Word XML to extract text
function parseWordXml(xml: string): string {
  // Remove XML declaration and namespaces for easier parsing
  let content = xml;
  
  // Extract text from w:t tags (Word text elements)
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  // Split by paragraph tags
  const paraMatches = content.split(/<w:p[^>]*>/);
  
  for (const para of paraMatches) {
    // Extract all w:t content from this paragraph
    const textMatches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches && textMatches.length > 0) {
      const paraText = textMatches
        .map(match => {
          // Extract text between tags
          const textMatch = match.match(/>([^<]*)</);
          return textMatch ? textMatch[1] : '';
        })
        .join('');
      
      if (paraText.trim()) {
        paragraphs.push(paraText.trim());
      }
    }
  }
  
  // Join paragraphs with newlines
  const result = paragraphs.join('\n\n');
  
  console.log(`📝 Parsed ${paragraphs.length} paragraphs from Word XML`);
  
  return result;
}

// Fallback text extraction for corrupted/unsupported files
function extractTextFallback(buffer: ArrayBuffer): string {
  try {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    
    // Try to find any readable Hebrew/English text
    const cleanText = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/[^\u0020-\u007E\u0590-\u05FF\u0600-\u06FF\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Only return if we found substantial text
    if (cleanText.length > 50) {
      // Filter out XML/binary garbage
      const words = cleanText.split(' ').filter(w => 
        w.length > 1 && 
        !/^[A-Z_]+$/.test(w) && 
        !w.includes('xml') &&
        !w.includes('Content') &&
        !w.includes('Types')
      );
      
      if (words.length > 10) {
        return words.join(' ');
      }
    }
    
    return '';
  } catch {
    return '';
  }
}


// Extract text from RTF files
async function extractTextFromRtf(buffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(buffer);
    
    // Remove RTF control words and groups
    text = text
      // Remove RTF header
      .replace(/^\{\\rtf1[^}]*\}?/, '')
      // Remove font tables
      .replace(/\{\\fonttbl[^}]*\}/g, '')
      // Remove color tables
      .replace(/\{\\colortbl[^}]*\}/g, '')
      // Remove style sheets
      .replace(/\{\\stylesheet[^}]*\}/g, '')
      // Remove control words with arguments
      .replace(/\\[a-z]+(-?\d+)?[ ]?/g, '')
      // Remove remaining braces
      .replace(/[{}]/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Handle Hebrew encoded characters (\'XX format)
    text = text.replace(/\\'([0-9a-fA-F]{2})/g, (match, hex) => {
      const charCode = parseInt(hex, 16);
      return String.fromCharCode(charCode);
    });
    
    // Handle Unicode characters (\uNNNN format)
    text = text.replace(/\\u(\d+)\??/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 10));
    });
    
    return text;
  } catch (error) {
    console.error('Error extracting RTF text:', error);
    return '';
  }
}

async function getFileContent(accessToken: string, file: DriveFile): Promise<{ content: string; source: string }> {
  try {
    if (file.mimeType === 'application/vnd.google-apps.document') {
      const content = await exportGoogleDoc(accessToken, file.id);
      return { content, source: `Google Doc: ${file.name}` };
    }
    
    if (file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const buffer = await downloadFile(accessToken, file.id);
      const content = await extractTextFromDocx(buffer);
      return { content, source: `DOCX: ${file.name}` };
    }
    
    // RTF support
    if (file.mimeType === 'application/rtf' || file.name.toLowerCase().endsWith('.rtf')) {
      const buffer = await downloadFile(accessToken, file.id);
      const content = await extractTextFromRtf(buffer);
      return { content, source: `RTF: ${file.name}` };
    }
    
    // Old Word format
    if (file.mimeType === 'application/msword' || file.name.toLowerCase().endsWith('.doc')) {
      const buffer = await downloadFile(accessToken, file.id);
      // Try to extract plain text from DOC (basic support)
      const decoder = new TextDecoder('utf-8');
      let text = decoder.decode(buffer);
      // Remove binary garbage and keep readable text
      text = text.replace(/[^\u0020-\u007E\u0590-\u05FF\u0600-\u06FF\s]/g, ' ');
      text = text.replace(/\s+/g, ' ').trim();
      return { content: text.length > 50 ? text : '', source: `DOC: ${file.name}` };
    }
    
    if (file.mimeType === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      const buffer = await downloadFile(accessToken, file.id);
      // Try multiple encodings for Hebrew
      let content = '';
      
      try {
        const decoder = new TextDecoder('utf-8');
        content = decoder.decode(buffer);
      } catch {
        try {
          const decoder = new TextDecoder('windows-1255'); // Hebrew Windows encoding
          content = decoder.decode(buffer);
        } catch {
          const decoder = new TextDecoder('iso-8859-8'); // Hebrew ISO encoding
          content = decoder.decode(buffer);
        }
      }
      
      return { content, source: `Text: ${file.name}` };
    }
    
    return { content: '', source: 'לא נמצא קובץ תוכן' };
  } catch (error) {
    console.error('Error getting file content:', error);
    return { content: '', source: `שגיאה: ${String(error)}` };
  }
}

function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

function isContentFile(file: DriveFile): boolean {
  const contentTypes = [
    'application/vnd.google-apps.document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/msword',
    'application/rtf',
  ];
  
  // Also check file extension for RTF
  if (file.name.toLowerCase().endsWith('.rtf')) {
    return true;
  }
  if (file.name.toLowerCase().endsWith('.txt')) {
    return true;
  }
  if (file.name.toLowerCase().endsWith('.doc')) {
    return true;
  }
  if (file.name.toLowerCase().endsWith('.docx')) {
    return true;
  }
  
  return contentTypes.includes(file.mimeType);
}

// ============================================
// SMART FILE DETECTION - זיהוי חכם של קבצים
// ============================================

interface SmartFileClassification {
  captionsFile: DriveFile | null;      // קובץ כיתובים
  articleFile: DriveFile | null;       // קובץ מאמר/תוכן
  imageFiles: DriveFile[];             // תמונות ממוספרות
  otherFiles: DriveFile[];             // קבצים אחרים
}

interface ParsedCaption {
  imageNumber: string;                 // מספר התמונה (01, 04, 07...)
  caption: string;                     // הכיתוב
  photographer: string;                // שם הצלם
}

interface ParsedArticle {
  title: string;                       // כותרת
  content: string;                     // תוכן
  subtitle?: string;                   // כותרת משנה
  paragraphs: string[];                // פסקאות נפרדות
}

interface ImageWithCaption {
  url: string;
  caption: string;
  photographer: string;
  imageNumber: string;
}

// Content block type for database storage
interface ContentBlockData {
  id: string;
  type: 'text' | 'image' | 'subtitle' | 'quote';
  content?: string;
  imageUrl?: string;
  caption?: string;
  photographer?: string;
  quoteSource?: string;
}


// זיהוי חכם של סוג הקובץ
function classifyFiles(files: DriveFile[]): SmartFileClassification {
  const result: SmartFileClassification = {
    captionsFile: null,
    articleFile: null,
    imageFiles: [],
    otherFiles: []
  };
  
  const contentFiles: DriveFile[] = [];
  
  for (const file of files) {
    const nameLower = file.name.toLowerCase();
    
    // זיהוי תמונות
    if (isImageFile(file.mimeType)) {
      result.imageFiles.push(file);
      continue;
    }
    
    // זיהוי קבצי תוכן
    if (isContentFile(file)) {
      contentFiles.push(file);
      continue;
    }
    
    result.otherFiles.push(file);
  }
  
  // מיון קבצי התוכן - זיהוי קובץ כיתובים וקובץ מאמר
  for (const file of contentFiles) {
    const nameLower = file.name.toLowerCase();
    
    // זיהוי קובץ כיתובים
    if (nameLower.includes('כיתוב') || 
        nameLower.includes('caption') ||
        nameLower.includes('כיתובים') ||
        nameLower.includes('תיאור תמונ') ||
        nameLower.includes('תיאורים')) {
      result.captionsFile = file;
      console.log(`📝 זוהה קובץ כיתובים: ${file.name}`);
      continue;
    }
    
    // זיהוי קובץ מאמר/תוכן
    if (nameLower.includes('מאמר') || 
        nameLower.includes('כתבה') ||
        nameLower.includes('תוכן') ||
        nameLower.includes('article') ||
        nameLower.includes('content') ||
        nameLower.includes('טקסט')) {
      result.articleFile = file;
      console.log(`📄 זוהה קובץ מאמר: ${file.name}`);
      continue;
    }
  }
  
  // אם לא זוהה קובץ מאמר - ניקח את הראשון שנשאר
  if (!result.articleFile) {
    const remainingContent = contentFiles.filter(f => f !== result.captionsFile);
    if (remainingContent.length > 0) {
      // בחר את הקובץ עם השם הארוך ביותר (סביר שזה המאמר)
      result.articleFile = remainingContent.reduce((a, b) => 
        a.name.length > b.name.length ? a : b
      );
      console.log(`📄 נבחר קובץ מאמר (אוטומטי): ${result.articleFile.name}`);
    }
  }
  
  // מיון תמונות לפי מספר
  result.imageFiles.sort((a, b) => {
    const numA = extractImageNumber(a.name);
    const numB = extractImageNumber(b.name);
    return (numA || 999) - (numB || 999);
  });
  
  console.log(`📊 סיווג קבצים: כיתובים=${result.captionsFile?.name || 'אין'}, מאמר=${result.articleFile?.name || 'אין'}, תמונות=${result.imageFiles.length}`);
  
  return result;
}

// חילוץ מספר תמונה משם הקובץ
function extractImageNumber(filename: string): number | null {
  // נסה למצוא מספר בסוף השם (לפני הסיומת)
  // דוגמאות: jpg.01, JPG.04, 07.jpg, image_08.png
  
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  
  // חפש מספרים בסוף
  const endMatch = nameWithoutExt.match(/(\d+)$/);
  if (endMatch) {
    return parseInt(endMatch[1], 10);
  }
  
  // חפש מספרים בתבנית jpg.XX או XX.jpg
  const patterns = [
    /\.(\d+)$/i,           // .01, .04
    /(\d+)\./,             // 01., 04.
    /_(\d+)$/,             // _01, _04
    /-(\d+)$/,             // -01, -04
    /(\d+)$/,              // 01, 04 בסוף
    /^(\d+)/,              // 01, 04 בהתחלה
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

// פענוח קובץ כיתובים - כולל חילוץ שם צלם
function parseCaptionsContent(content: string): ParsedCaption[] {
  const captions: ParsedCaption[] = [];
  
  // נקה את התוכן
  const cleanContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  
  const lines = cleanContent.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmed = line.trim();
    let imageNumber = '';
    let captionText = '';
    let photographer = '';
    
    // תבנית: "תמונה X:" או "תמונה X -"
    let match = trimmed.match(/תמונה\s*(\d+)\s*[:;-]\s*(.+)/i);
    if (match) {
      imageNumber = match[1].padStart(2, '0');
      captionText = match[2].trim();
    }
    
    // תבנית: "X:" או "X -" או "X." בהתחלה
    if (!imageNumber) {
      match = trimmed.match(/^(\d+)\s*[:;.\-–]\s*(.+)/);
      if (match) {
        imageNumber = match[1].padStart(2, '0');
        captionText = match[2].trim();
      }
    }
    
    // תבנית: "(X)" בהתחלה
    if (!imageNumber) {
      match = trimmed.match(/^\((\d+)\)\s*(.+)/);
      if (match) {
        imageNumber = match[1].padStart(2, '0');
        captionText = match[2].trim();
      }
    }
    
    // תבנית: "image X" או "img X"
    if (!imageNumber) {
      match = trimmed.match(/(?:image|img|photo|pic)\s*(\d+)\s*[:;-]\s*(.+)/i);
      if (match) {
        imageNumber = match[1].padStart(2, '0');
        captionText = match[2].trim();
      }
    }
    
    // אם מצאנו מספר תמונה, נחלץ גם את שם הצלם
    if (imageNumber && captionText) {
      // חפש תבניות של קרדיט צלם בתוך הכיתוב
      // תבנית 1: "כיתוב - צילום: שם צלם" או "כיתוב - צילום שם צלם"
      let photographerMatch = captionText.match(/[-–]\s*צילום:?\s*(.+?)$/i);
      if (photographerMatch) {
        photographer = photographerMatch[1].trim();
        captionText = captionText.replace(/[-–]\s*צילום:?\s*.+$/i, '').trim();
      }
      
      // תבנית 2: "כיתוב (צילום: שם צלם)" או "כיתוב (צילום שם צלם)"
      if (!photographer) {
        photographerMatch = captionText.match(/\(צילום:?\s*(.+?)\)$/i);
        if (photographerMatch) {
          photographer = photographerMatch[1].trim();
          captionText = captionText.replace(/\(צילום:?\s*.+?\)$/i, '').trim();
        }
      }
      
      // תבנית 3: "כיתוב | צילום: שם צלם"
      if (!photographer) {
        photographerMatch = captionText.match(/\|\s*צילום:?\s*(.+?)$/i);
        if (photographerMatch) {
          photographer = photographerMatch[1].trim();
          captionText = captionText.replace(/\|\s*צילום:?\s*.+$/i, '').trim();
        }
      }
      
      // תבנית 4: "צלם: שם" או "photographer: name" בסוף
      if (!photographer) {
        photographerMatch = captionText.match(/(?:צלם|photographer|photo by):?\s*(.+?)$/i);
        if (photographerMatch) {
          photographer = photographerMatch[1].trim();
          captionText = captionText.replace(/(?:צלם|photographer|photo by):?\s*.+$/i, '').trim();
        }
      }
      
      captions.push({
        imageNumber,
        caption: captionText,
        photographer
      });
    }
  }
  
  console.log(`📝 נפענחו ${captions.length} כיתובים:`);
  captions.forEach(c => {
    console.log(`   ${c.imageNumber}: "${c.caption.substring(0, 30)}..." צלם: "${c.photographer || 'לא צוין'}"`);
  });
  
  return captions;
}


// ============================================
// ניקוי תוכן חכם - הסרת תווים לא רצויים
// ============================================
function cleanContentText(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // הסרת תגיות HTML שבורות
  cleaned = cleaned
    .replace(/&gt;/g, '')
    .replace(/&lt;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // הסרת תגיות HTML חלקיות או שבורות בתחילת שורה
  cleaned = cleaned.replace(/^[<>]+/gm, '');
  cleaned = cleaned.replace(/[<>]+$/gm, '');
  
  // הסרת כוכביות המשמשות לעיצוב (לא חלק ממילה)
  // שומר על כוכביות שהן חלק מטקסט כמו "כוכב*"
  cleaned = cleaned
    .replace(/^\s*\*+\s*/gm, '')  // כוכביות בתחילת שורה
    .replace(/\s*\*+\s*$/gm, '')  // כוכביות בסוף שורה
    .replace(/\s+\*\s+/g, ' ')    // כוכבית בודדת בין מילים
    .replace(/\*{2,}/g, '')       // כוכביות מרובות רצופות
    .replace(/^\*\s*/gm, '')      // כוכבית בתחילת שורה
    .replace(/\s*\*$/gm, '');     // כוכבית בסוף שורה
  
  // הסרת תבליטים ורשימות
  cleaned = cleaned
    .replace(/^[\s]*[•●○◦▪▫‣⁃]\s*/gm, '')  // תבליטים
    .replace(/^[\s]*[-–—]\s+/gm, '')        // מקף כתבליט
    .replace(/^[\s]*\d+\.\s+/gm, '')        // מספור (1. 2. 3.)
    .replace(/^[\s]*[א-ת]\.\s+/gm, '');     // מספור עברי (א. ב. ג.)
  
  // הסרת סימני עריכה נפוצים
  cleaned = cleaned
    .replace(/\[.*?\]/g, '')       // סוגריים מרובעים עם תוכן
    .replace(/\{.*?\}/g, '')       // סוגריים מסולסלים עם תוכן
    .replace(/<<.*?>>/g, '')       // סימני ציטוט כפולים
    .replace(/>>/g, '')
    .replace(/<</g, '');
  
  // ניקוי רווחים ופיסוק
  cleaned = cleaned
    .replace(/\s{3,}/g, '  ')      // יותר מ-2 רווחים
    .replace(/\n{3,}/g, '\n\n')    // יותר מ-2 שורות ריקות
    .replace(/\t+/g, ' ')          // טאבים לרווח
    .replace(/^\s+$/gm, '')        // שורות עם רווחים בלבד
    .replace(/([.!?])\s*\1+/g, '$1')  // פיסוק כפול
    .replace(/\s+([.,;:!?])/g, '$1'); // רווח לפני פיסוק
  
  // הסרת שורות שמכילות רק סימנים
  cleaned = cleaned
    .replace(/^[*\-=_~#]+$/gm, '')
    .replace(/^[.\s]+$/gm, '');
  
  // ניקוי סופי
  cleaned = cleaned
    .replace(/^\s+/gm, '')         // רווחים בתחילת שורה
    .replace(/\s+$/gm, '')         // רווחים בסוף שורה
    .trim();
  
  return cleaned;
}

// פענוח קובץ מאמר - חילוץ כותרת ותוכן ופסקאות נפרדות
function parseArticleContent(content: string): ParsedArticle {
  // ניקוי ראשוני
  let cleanContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // הפעלת ניקוי חכם
  cleanContent = cleanContentText(cleanContent);
  
  const lines = cleanContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return { title: '', content: '', paragraphs: [] };
  }
  
  // מצא את השורה הראשונה שאינה ריקה - זו הכותרת
  let titleIndex = 0;
  while (titleIndex < lines.length && !lines[titleIndex].trim()) {
    titleIndex++;
  }
  
  // נקה את הכותרת
  const title = cleanContentText(lines[titleIndex] || '');
  let subtitle = '';
  let contentStartIndex = titleIndex + 1;
  
  // אם השורה השנייה קצרה יחסית - זו כותרת משנה
  if (contentStartIndex < lines.length) {
    const nextLine = cleanContentText(lines[contentStartIndex] || '');
    if (nextLine.length > 0 && nextLine.length < 100) {
      // בדוק אם זו לא פסקה רגילה
      if (!nextLine.endsWith('.') || nextLine.length < 60) {
        subtitle = nextLine;
        contentStartIndex++;
      }
    }
  }
  
  // חלק את שאר התוכן לפסקאות
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  for (let i = contentStartIndex; i < lines.length; i++) {
    const trimmed = cleanContentText(lines[i]);
    
    if (!trimmed) {
      // שורה ריקה - סיום פסקה
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
    } else {
      // הוסף לפסקה הנוכחית
      if (currentParagraph) {
        currentParagraph += ' ' + trimmed;
      } else {
        currentParagraph = trimmed;
      }
    }
  }
  
  // סגור פסקה אחרונה
  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }
  
  // סינון פסקאות ריקות או קצרות מדי
  const filteredParagraphs = paragraphs
    .map(p => cleanContentText(p))
    .filter(p => p.length > 2);
  
  // צור HTML מהפסקאות
  const htmlContent = filteredParagraphs.map(p => '<p>' + p + '</p>').join('\n');
  
  console.log(`📄 נפענח מאמר:`);
  console.log(`   - כותרת: "${title.substring(0, 50)}..."`);
  console.log(`   - כותרת משנה: "${subtitle}"`);
  console.log(`   - ${filteredParagraphs.length} פסקאות`);
  
  return {
    title,
    subtitle,
    content: htmlContent,
    paragraphs: filteredParagraphs
  };
}




// התאמת תמונות לכיתובים (כולל צלם)
function matchImagesWithCaptions(
  imageFiles: DriveFile[],
  captions: ParsedCaption[],
  uploadedUrls: Map<string, string>
): ImageWithCaption[] {
  const result: ImageWithCaption[] = [];
  
  for (const imageFile of imageFiles) {
    const imageNum = extractImageNumber(imageFile.name);
    const imageNumStr = imageNum?.toString().padStart(2, '0') || '';
    
    // חפש כיתוב מתאים
    let caption = '';
    let photographer = '';
    
    if (imageNumStr) {
      const matchingCaption = captions.find(c => {
        const captionNum = parseInt(c.imageNumber, 10);
        return captionNum === imageNum;
      });
      if (matchingCaption) {
        caption = matchingCaption.caption;
        photographer = matchingCaption.photographer;
        console.log(`🔗 התאמה: תמונה ${imageFile.name} (${imageNum}) ← כיתוב: "${caption.substring(0, 30)}..." צלם: "${photographer || 'לא צוין'}"`);
      }
    }
    
    const url = uploadedUrls.get(imageFile.id);
    if (url) {
      result.push({
        url,
        caption,
        photographer,
        imageNumber: imageNumStr
      });
    }
  }
  
  return result;
}


// יצירת מערך בלוקים מסודר מפסקאות ותמונות
function createContentBlocks(
  paragraphs: string[],
  imagesWithCaptions: ImageWithCaption[]
): ContentBlockData[] {
  const blocks: ContentBlockData[] = [];
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  if (paragraphs.length === 0 && imagesWithCaptions.length === 0) {
    // בלוק טקסט ריק ברירת מחדל
    return [{ id: generateId(), type: 'text', content: '' }];
  }
  
  const totalParagraphs = paragraphs.length;
  const totalImages = imagesWithCaptions.length;
  
  if (totalImages === 0) {
    // אין תמונות - רק בלוקי טקסט
    for (const para of paragraphs) {
      if (para.trim()) {
        blocks.push({
          id: generateId(),
          type: 'text',
          content: '<p>' + para + '</p>'
        });
      }
    }
    return blocks;
  }
  
  if (totalParagraphs === 0) {
    // אין פסקאות - רק תמונות
    for (const img of imagesWithCaptions) {
      blocks.push({
        id: generateId(),
        type: 'image',
        imageUrl: img.url,
        caption: img.caption,
        photographer: img.photographer
      });
    }
    return blocks;
  }
  
  // יש גם פסקאות וגם תמונות - שלב ביניהם
  const interval = Math.max(1, Math.floor(totalParagraphs / (totalImages + 1)));
  let imageIndex = 0;
  let paragraphsInCurrentBlock: string[] = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    if (para.trim()) {
      paragraphsInCurrentBlock.push(para);
    }
    
    // הוסף תמונה אחרי כל interval פסקאות
    const shouldAddImage = imageIndex < totalImages && 
      (i + 1) % interval === 0 && 
      paragraphsInCurrentBlock.length > 0;
    
    if (shouldAddImage || i === paragraphs.length - 1) {
      // סגור את בלוק הטקסט הנוכחי
      if (paragraphsInCurrentBlock.length > 0) {
        blocks.push({
          id: generateId(),
          type: 'text',
          content: paragraphsInCurrentBlock.map(p => '<p>' + p + '</p>').join('\n')
        });
        paragraphsInCurrentBlock = [];
      }
      
      // הוסף תמונה
      if (shouldAddImage) {
        const img = imagesWithCaptions[imageIndex];
        blocks.push({
          id: generateId(),
          type: 'image',
          imageUrl: img.url,
          caption: img.caption,
          photographer: img.photographer
        });
        imageIndex++;
      }
    }
  }
  
  // הוסף תמונות שנשארו בסוף
  while (imageIndex < totalImages) {
    const img = imagesWithCaptions[imageIndex];
    blocks.push({
      id: generateId(),
      type: 'image',
      imageUrl: img.url,
      caption: img.caption,
      photographer: img.photographer
    });
    imageIndex++;
  }
  
  console.log(`📦 נוצרו ${blocks.length} בלוקים: ${blocks.filter(b => b.type === 'text').length} טקסט, ${blocks.filter(b => b.type === 'image').length} תמונות`);
  
  return blocks;
}

// יצירת תוכן HTML עם תמונות וכיתובים משולבים (כולל צלם)
function createRichContent(
  articleContent: string,
  imagesWithCaptions: ImageWithCaption[]
): string {
  if (imagesWithCaptions.length === 0) {
    return articleContent;
  }
  
  // אם אין תוכן - רק תמונות עם כיתובים
  if (!articleContent.trim()) {
    return imagesWithCaptions
      .map(img => {
        let figcaption = '';
        if (img.caption || img.photographer) {
          const captionText = img.caption || '';
          const photographerText = img.photographer ? ' - צילום: ' + img.photographer : '';
          figcaption = '<figcaption>' + captionText + photographerText + '</figcaption>';
        }
        return '<figure class="content-image"><img src="' + img.url + '" alt="' + (img.caption || '') + '" />' + figcaption + '</figure>';
      })
      .join('\n');
  }
  
  // שלב תמונות בתוך התוכן באופן שווה
  const paragraphs = articleContent.split('</p>').filter(p => p.trim());
  const totalParagraphs = paragraphs.length;
  const totalImages = imagesWithCaptions.length;
  
  if (totalParagraphs <= 1 || totalImages === 0) {
    // אם מעט פסקאות - שים את כל התמונות בסוף
    const imagesHtml = imagesWithCaptions
      .map(img => {
        let figcaption = '';
        if (img.caption || img.photographer) {
          const captionText = img.caption || '';
          const photographerText = img.photographer ? ' - צילום: ' + img.photographer : '';
          figcaption = '<figcaption>' + captionText + photographerText + '</figcaption>';
        }
        return '<figure class="content-image"><img src="' + img.url + '" alt="' + (img.caption || '') + '" />' + figcaption + '</figure>';
      })
      .join('\n');
    return articleContent + '\n' + imagesHtml;
  }
  
  // פזר תמונות בין הפסקאות
  const interval = Math.floor(totalParagraphs / (totalImages + 1));
  let result = '';
  let imageIndex = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    result += paragraphs[i] + '</p>\n';
    
    // הוסף תמונה אחרי כל interval פסקאות
    if (imageIndex < totalImages && (i + 1) % interval === 0) {
      const img = imagesWithCaptions[imageIndex];
      let figcaption = '';
      if (img.caption || img.photographer) {
        const captionText = img.caption || '';
        const photographerText = img.photographer ? ' - צילום: ' + img.photographer : '';
        figcaption = '<figcaption>' + captionText + photographerText + '</figcaption>';
      }
      result += '<figure class="content-image"><img src="' + img.url + '" alt="' + (img.caption || '') + '" />' + figcaption + '</figure>\n';
      imageIndex++;
    }
  }
  
  // הוסף תמונות שנשארו בסוף
  while (imageIndex < totalImages) {
    const img = imagesWithCaptions[imageIndex];
    let figcaption = '';
    if (img.caption || img.photographer) {
      const captionText = img.caption || '';
      const photographerText = img.photographer ? ' - צילום: ' + img.photographer : '';
      figcaption = '<figcaption>' + captionText + photographerText + '</figcaption>';
    }
    result += '<figure class="content-image"><img src="' + img.url + '" alt="' + (img.caption || '') + '" />' + figcaption + '</figure>\n';
    imageIndex++;
  }
  
  return result;
}

// ============================================
// END SMART FILE DETECTION
// ============================================


// Upload image to Supabase Storage and return URL
async function uploadImageToStorage(
  supabase: any,
  accessToken: string,
  file: DriveFile,
  sectionName: string,
  postName: string
): Promise<{ url: string | null; error?: string; uploaded: boolean }> {
  try {
    console.log(`📥 Downloading image from Drive: ${file.name} (${file.mimeType})`);
    
    // Download image from Google Drive
    const imageArrayBuffer = await downloadFile(accessToken, file.id);
    
    if (!imageArrayBuffer || imageArrayBuffer.byteLength === 0) {
      console.error(`❌ Failed to download image: ${file.name} - empty response`);
      return { url: null, error: 'קובץ ריק מהדרייב', uploaded: false };
    }
    
    console.log(`📦 Downloaded ${file.name}: ${imageArrayBuffer.byteLength} bytes`);
    
    // Convert ArrayBuffer to Uint8Array (required for Supabase Storage in Deno)
    const imageData = new Uint8Array(imageArrayBuffer);
    
    // Generate unique filename - ONLY ASCII characters allowed in Storage paths!
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    
    // Remove ALL non-ASCII characters from folder names
    const safeSection = sectionName
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
      .replace(/[^a-zA-Z0-9]/g, '_') // Keep only alphanumeric
      .substring(0, 20) || 'section';
    
    const safePost = postName
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII  
      .replace(/[^a-zA-Z0-9]/g, '_') // Keep only alphanumeric
      .substring(0, 30) || 'post';
    
    // Use simple path structure: timestamp_randomid.ext
    const filename = `sync/${timestamp}_${randomId}.${ext}`;
    
    // Determine content type
    let contentType = file.mimeType;
    if (!contentType || !contentType.startsWith('image/')) {
      const extMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
      };
      contentType = extMap[ext] || 'image/jpeg';
    }
    
    console.log(`📤 Uploading to Storage: ${filename} (${contentType}, ${imageData.length} bytes)`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('synced-images')
      .upload(filename, imageData, {
        contentType,
        upsert: true,
        cacheControl: '3600',
      });
    
    if (error) {
      console.error(`❌ Upload error for ${file.name}:`, error);
      return { url: null, error: `שגיאת העלאה: ${error.message}`, uploaded: false };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('synced-images')
      .getPublicUrl(filename);
    
    if (!urlData?.publicUrl) {
      console.error(`❌ Failed to get public URL for ${filename}`);
      return { url: null, error: 'לא ניתן לקבל URL ציבורי', uploaded: false };
    }
    
    console.log(`✅ Image uploaded successfully: ${urlData.publicUrl}`);
    return { url: urlData.publicUrl, uploaded: true };
    
  } catch (error) {
    console.error(`❌ Exception uploading image ${file.name}:`, error);
    return { url: null, error: `שגיאה: ${String(error)}`, uploaded: false };
  }
}

async function createPost(
  supabase: any,
  table: string,
  title: string,
  content: string,
  imageUrl: string | null,
  additionalImages: string[]
): Promise<string | null> {
  const now = new Date().toISOString();
  
  let postData: any = {
    title,
    created_at: now,
  };
  
  switch (table) {
    case 'articles':
      postData = {
        ...postData,
        content,
        image_url: imageUrl,
        status: 'draft',
        slug: title.replace(/\s+/g, '-').toLowerCase(),
      };
      break;
      
    case 'siah_hatzibur':
      postData = {
        ...postData,
        content,
        cover_image_url: imageUrl,
        is_published: false,
        gregorian_date: now.split('T')[0],
      };
      break;
      
    case 'events':
      postData = {
        ...postData,
        description: content,
        image_url: imageUrl,
        status: 'draft',
        event_date: now.split('T')[0],
      };
      break;
      
    case 'galleries':
      postData = {
        ...postData,
        description: content,
        cover_image_url: imageUrl,
        images: additionalImages.map((url) => ({ url, caption: '' })),
        is_published: false,
      };
      break;
      
    case 'bein_hatzibur':
      postData = {
        ...postData,
        description: content || '',
        image_url: imageUrl || 'https://via.placeholder.com/400',
        is_published: false,
        gregorian_date: now.split('T')[0],
      };
      break;
      
    case 'news_batzibur':
      postData = {
        ...postData,
        content: content || '',
        image_url: imageUrl,
        is_published: false,
        gregorian_date: now.split('T')[0],
      };
      break;
      
    case 'before_18_years':
      const allImages = imageUrl 
        ? [{ url: imageUrl, caption: '' }, ...additionalImages.map(url => ({ url, caption: '' }))]
        : additionalImages.map(url => ({ url, caption: '' }));
      
      postData = {
        ...postData,
        description: content || '',
        images: allImages,
        is_published: false,
        week_parasha: '',
        year_gregorian: new Date().getFullYear() - 18,
        year_hebrew: '',
      };
      break;
      
    case 'historical_events':
      postData = {
        ...postData,
        description: content || '',
        content: null,
        cover_image_url: imageUrl,
        images: additionalImages.map((url) => ({ url, caption: '' })),
        is_published: false,
      };
      break;
      
    case 'videos':
      postData = {
        ...postData,
        description: content,
        thumbnail_url: imageUrl,
        is_published: false,
      };
      break;
      
    case 'newspaper_issues':
      postData = {
        ...postData,
        description: content || '',
        cover_image_url: imageUrl,
        is_published: false,
        gregorian_date: now.split('T')[0],
        issue_number: 0,
      };
      break;
      
    default:
      console.error(`Unknown table: ${table}`);
      return null;
  }
  
  console.log(`Inserting into ${table}:`, JSON.stringify(postData, null, 2));
  
  const { data, error } = await supabase
    .from(table)
    .insert(postData)
    .select('id')
    .single();
    
  if (error) {
    console.error(`Error creating post in ${table}:`, error);
    return null;
  }
  
  return data?.id;
  return data?.id;
}

// Smart version of createPost - uses parsed data with captions
async function createPostSmart(
  supabase: any,
  table: string,
  title: string,
  subtitle: string,
  content: string,
  contentBlocks: ContentBlockData[],
  imageUrl: string | null,
  imagesWithCaptions: ImageWithCaption[]
): Promise<string | null> {
  const now = new Date().toISOString();
  
  // Convert imagesWithCaptions to the format expected by each table
  const imagesArray = imagesWithCaptions.map(img => ({
    url: img.url,
    caption: img.caption || '',
    photographer: img.photographer || ''
  }));
  
  let postData: any = {
    title,
    created_at: now,
  };
  
  switch (table) {
    case 'articles':
      postData = {
        ...postData,
        excerpt: subtitle || '',
        content,
        content_blocks: contentBlocks,
        image_url: imageUrl,
        status: 'draft',
        slug: title.replace(/[^\w\u0590-\u05FF]+/g, '-').toLowerCase().substring(0, 100),
      };
      break;
      
    case 'siah_hatzibur':
      postData = {
        ...postData,
        subtitle: subtitle || null,
        content,
        content_blocks: contentBlocks,
        cover_image_url: imageUrl,
        is_published: false,
        gregorian_date: now.split('T')[0],
      };
      break;
      
    case 'events':
      postData = {
        ...postData,
        description: content,
        image_url: imageUrl,
        status: 'draft',
        event_date: now.split('T')[0],
      };
      break;
      
    case 'galleries':
      postData = {
        ...postData,
        description: content || subtitle || '',
        cover_image_url: imageUrl,
        images: imagesArray,
        is_published: false,
      };
      break;
      
    case 'bein_hatzibur':
      postData = {
        ...postData,
        short_text: subtitle || '',
        description: content || '',
        image_url: imageUrl || 'https://via.placeholder.com/400',
        caption: imagesArray[0]?.caption || '',
        is_published: false,
        gregorian_date: now.split('T')[0],
      };
      break;
      
    case 'news_batzibur':
      postData = {
        ...postData,
        subtitle: subtitle || null,
        content: content || '',
        content_blocks: contentBlocks,
        image_url: imageUrl,
        is_published: false,
        gregorian_date: now.split('T')[0],
      };
      break;
      
    case 'before_18_years':
      postData = {
        ...postData,
        description: content || '',
        images: imagesArray,
        is_published: false,
        week_parasha: '',
        year_gregorian: new Date().getFullYear() - 18,
        year_hebrew: '',
      };
      break;
      
    case 'historical_events':
      postData = {
        ...postData,
        description: subtitle || '',
        content: content || null,
        content_blocks: contentBlocks,
        cover_image_url: imageUrl,
        images: imagesArray,
        is_published: false,
      };
      break;
      
    case 'videos':
      postData = {
        ...postData,
        description: content || subtitle || '',
        thumbnail_url: imageUrl,
        is_published: false,
      };
      break;
      
    case 'newspaper_issues':
      postData = {
        ...postData,
        description: content || subtitle || '',
        cover_image_url: imageUrl,
        is_published: false,
        gregorian_date: now.split('T')[0],
        issue_number: 0,
      };
      break;
      
    default:
      console.error(`Unknown table: ${table}`);
      return null;
  }

  
  console.log(`📥 Smart insert into ${table}:`, JSON.stringify({
    title: postData.title,
    subtitle: postData.subtitle,
    contentLength: postData.content?.length || 0,
    imagesCount: imagesArray.length,
    captionsCount: imagesArray.filter(i => i.caption).length,
  }, null, 2));
  
  const { data, error } = await supabase
    .from(table)
    .insert(postData)
    .select('id')
    .single();
    
  if (error) {
    console.error(`Error creating post in ${table}:`, error);
    return null;
  }
  
  console.log(`✅ Post created successfully in ${table}: ${data?.id}`);
  return data?.id;
}


async function syncFolder(
  supabase: any,
  accessToken: string,
  configId: string,
  sectionFolder: DriveFile,
  postFolder: DriveFile,
  targetTable: string,
  forceSync: boolean = false
): Promise<{ 
  success: boolean; 
  error?: string; 
  recordId?: string; 
  skipped?: boolean; 
  details?: string;
  postDetail?: PostDetail;
}> {
  const postDetail: PostDetail = {
    name: postFolder.name,
    status: 'error',
    contentSource: null,
    contentLength: 0,
    imagesFound: 0,
    imagesUploaded: 0,
    mainImage: null,
  };
  
  try {
    // Check if already synced
    const { data: existing } = await supabase
      .from('drive_synced_items')
      .select('id, target_record_id')
      .eq('config_id', configId)
      .eq('drive_folder_id', postFolder.id)
      .single();
      
    if (existing && !forceSync) {
      console.log(`Skipping ${postFolder.name} - already synced`);
      postDetail.status = 'skipped';
      return { success: true, skipped: true, details: 'כבר סונכרן בעבר', postDetail };
    }
    
    // If forceSync and existing, delete old record first
    if (existing && forceSync) {
      console.log(`Force re-syncing ${postFolder.name}`);
      await supabase.from('drive_synced_items').delete().eq('id', existing.id);
      if (existing.target_record_id) {
        await supabase.from(targetTable).delete().eq('id', existing.target_record_id);
      }
    }
    
    // Get files in the post folder
    const files = await listFilesInFolder(accessToken, postFolder.id);
    console.log(`Found ${files.length} files in ${postFolder.name}:`, files.map(f => `${f.name} (${f.mimeType})`));
    
    if (files.length === 0) {
      postDetail.error = 'התיקייה ריקה - אין קבצים';
      return { success: false, error: 'התיקייה ריקה - אין קבצים', postDetail };
    }
    
    // ============================================
    // SMART FILE CLASSIFICATION - זיהוי חכם
    // ============================================
    const classified = classifyFiles(files);
    const imageFiles = classified.imageFiles;
    
    postDetail.imagesFound = imageFiles.length;
    
    console.log(`📊 Smart classification results:`);
    console.log(`   - Captions file: ${classified.captionsFile?.name || 'לא נמצא'}`);
    console.log(`   - Article file: ${classified.articleFile?.name || 'לא נמצא'}`);
    console.log(`   - Images: ${imageFiles.length} files`);
    
    // ============================================
    // PARSE CAPTIONS FILE - פענוח כיתובים
    // ============================================
    let captions: ParsedCaption[] = [];
    if (classified.captionsFile) {
      const captionsResult = await getFileContent(accessToken, classified.captionsFile);
      if (captionsResult.content) {
        captions = parseCaptionsContent(captionsResult.content);
        console.log(`📝 Parsed ${captions.length} captions from ${classified.captionsFile.name}`);
      }
    }
    
    // ============================================
    // PARSE ARTICLE FILE - פענוח מאמר
    // ============================================
    let articleTitle = postFolder.name; // ברירת מחדל - שם התיקייה
    let articleContent = '';
    let articleSubtitle = '';
    
    if (classified.articleFile) {
      const articleResult = await getFileContent(accessToken, classified.articleFile);
      postDetail.contentSource = articleResult.source;
      
      if (articleResult.content) {
        const parsed = parseArticleContent(articleResult.content);
        if (parsed.title) {
          articleTitle = parsed.title;
        }
        articleContent = parsed.content;
        articleSubtitle = parsed.subtitle || '';
        postDetail.contentLength = articleContent.length;
        
        console.log(`📄 Parsed article:`);
        console.log(`   - Title: "${articleTitle.substring(0, 50)}..."`);
        console.log(`   - Subtitle: "${articleSubtitle}"`);
        console.log(`   - Content: ${articleContent.length} chars`);
      }
    } else {
      // נסה למצוא כל קובץ תוכן
      const anyContentFile = files.find(f => isContentFile(f));
      if (anyContentFile) {
        const contentResult = await getFileContent(accessToken, anyContentFile);
        articleContent = contentResult.content;
        postDetail.contentSource = contentResult.source;
        postDetail.contentLength = articleContent.length;
      } else {
        postDetail.contentSource = 'לא נמצא קובץ תוכן';
        console.log('No content file found in folder');
      }
    }
    
    // ============================================
    // UPLOAD IMAGES - העלאת תמונות
    // ============================================
    const uploadedUrls = new Map<string, string>();
    let mainImageUrl: string | null = null;
    const additionalImages: string[] = [];
    let uploadedCount = 0;
    const imageErrors: string[] = [];
    
    // מיין תמונות לפי מספר
    const sortedImages = [...imageFiles].sort((a, b) => {
      const numA = extractImageNumber(a.name) || 999;
      const numB = extractImageNumber(b.name) || 999;
      return numA - numB;
    });
    
    for (const img of sortedImages) {
      console.log(`  📷 Processing image: ${img.name}`);
      const uploadResult = await uploadImageToStorage(
        supabase,
        accessToken,
        img,
        sectionFolder.name,
        postFolder.name
      );
      
      if (!uploadResult.uploaded || !uploadResult.url) {
        console.log(`  ⚠️ Failed to upload: ${img.name} - ${uploadResult.error}`);
        imageErrors.push(`${img.name}: ${uploadResult.error}`);
        continue;
      }
      
      uploadedCount++;
      uploadedUrls.set(img.id, uploadResult.url);
      
      const imgNum = extractImageNumber(img.name);
      const lowerName = img.name.toLowerCase();
      
      // Determine main image - image 01 or first image or marked as main
      if (!mainImageUrl) {
        if (imgNum === 1 || lowerName.includes('main') || lowerName.includes('ראשי') || 
            lowerName.includes('cover') || lowerName.includes('ראשית')) {
          mainImageUrl = uploadResult.url;
          console.log(`  🖼️ Set as main image: ${img.name}`);
        } else if (additionalImages.length === 0) {
          mainImageUrl = uploadResult.url;
          console.log(`  🖼️ First image as main: ${img.name}`);
        } else {
          additionalImages.push(uploadResult.url);
        }
      } else {
        additionalImages.push(uploadResult.url);
      }
    }
    
    postDetail.imagesUploaded = uploadedCount;
    postDetail.mainImage = mainImageUrl;
    
    // ============================================
    // MATCH IMAGES WITH CAPTIONS - התאמת כיתובים
    // ============================================
    const imagesWithCaptions = matchImagesWithCaptions(sortedImages, captions, uploadedUrls);
    console.log(`🔗 Matched ${imagesWithCaptions.filter(i => i.caption).length}/${imagesWithCaptions.length} images with captions`);
    console.log(`📸 Matched ${imagesWithCaptions.filter(i => i.photographer).length}/${imagesWithCaptions.length} images with photographers`);
    
    // ============================================
    // CREATE CONTENT BLOCKS - יצירת בלוקי תוכן מסודרים
    // ============================================
    const contentBlocks = createContentBlocks(parsedArticle.paragraphs, imagesWithCaptions.slice(1)); // skip main image
    console.log(`📦 Created ${contentBlocks.length} content blocks`);
    
    // ============================================
    // CREATE RICH CONTENT (HTML) - יצירת תוכן עשיר
    // ============================================
    const finalContent = createRichContent(articleContent, imagesWithCaptions.slice(1)); // skip main image
    
    // Log image upload errors if any
    if (imageErrors.length > 0) {
      console.log(`⚠️ Image upload errors: ${imageErrors.join(', ')}`);
    }
    
    console.log(`Image upload summary: ${uploadedCount}/${imageFiles.length} uploaded, main: ${mainImageUrl ? 'YES' : 'NO'}`);
    
    // Create the post with smart-parsed data
    const recordId = await createPostSmart(
      supabase,
      targetTable,
      articleTitle,           // כותרת מפוענחת (או שם התיקייה)
      articleSubtitle,        // כותרת משנה
      finalContent,           // תוכן עשיר עם תמונות וכיתובים (HTML)
      contentBlocks,          // בלוקי תוכן מסודרים
      mainImageUrl,
      imagesWithCaptions      // תמונות עם כיתובים וצלמים
    );

    
    if (!recordId) {
      postDetail.error = `נכשל ביצירת פוסט בטבלה ${targetTable}`;
      return { success: false, error: `נכשל ביצירת פוסט בטבלה ${targetTable}`, postDetail };
    }
    
    // Log the sync with more details
    await supabase.from('drive_synced_items').insert({
      config_id: configId,
      drive_folder_id: postFolder.id,
      drive_folder_name: postFolder.name,
      target_table: targetTable,
      target_record_id: recordId,
      sync_status: 'success',
      sync_details: {
        contentSource: postDetail.contentSource,
        contentLength: postDetail.contentLength,
        imagesFound: postDetail.imagesFound,
        imagesUploaded: postDetail.imagesUploaded,
        mainImage: postDetail.mainImage ? true : false,
        captionsMatched: imagesWithCaptions.filter(i => i.caption).length,
        smartParsed: true,
      },
    });
    
    postDetail.status = 'created';
    return { success: true, recordId, details: `נוצר בהצלחה (${imagesWithCaptions.filter(i => i.caption).length} כיתובים)`, postDetail };
    
  } catch (error) {
    console.error('Error syncing folder:', postFolder.name, error);
    postDetail.error = String(error);
    return { success: false, error: String(error), postDetail };
  }
}

// Check if a record has a valid (non-Drive) image
function hasValidImage(record: any, tableConfig: { imageField: string | null; hasImages?: boolean }): boolean {
  // Check main image field
  if (tableConfig.imageField) {
    const url = record[tableConfig.imageField];
    if (url && !url.includes('drive.google.com') && !url.includes('placeholder') && url.startsWith('http')) {
      return true;
    }
  }
  
  // Check images array
  if (tableConfig.hasImages && record.images && Array.isArray(record.images) && record.images.length > 0) {
    for (const img of record.images) {
      const imgUrl = typeof img === 'string' ? img : img.url;
      if (imgUrl && !imgUrl.includes('drive.google.com') && !imgUrl.includes('placeholder') && imgUrl.startsWith('http')) {
        return true;
      }
    }
  }
  
  return false;
}

// Migrate a single image URL from Drive to Storage
async function migrateImageUrl(
  supabase: any, 
  driveUrl: string, 
  tableName: string, 
  recordId: string
): Promise<string | null> {
  try {
    // Extract file ID from various Drive URL formats
    let fileId: string | null = null;
    
    // Format: https://drive.google.com/uc?export=view&id=FILE_ID
    const ucMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) {
      fileId = ucMatch[1];
    }
    
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      fileId = fileMatch[1];
    }
    
    // Format: https://lh3.googleusercontent.com/d/FILE_ID
    const lhMatch = driveUrl.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (lhMatch) {
      fileId = lhMatch[1];
    }
    
    if (!fileId) {
      console.error(`Could not extract file ID from URL: ${driveUrl}`);
      return null;
    }
    
    console.log(`  📥 Downloading from Drive: ${fileId}`);
    
    // Try to download directly (public files)
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await fetch(directUrl);
    
    if (!response.ok) {
      console.error(`  ❌ Failed to download: ${response.status}`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      console.error(`  ❌ Empty file downloaded`);
      return null;
    }
    
    console.log(`  📦 Downloaded: ${arrayBuffer.byteLength} bytes`);
    
    // Convert to Uint8Array
    const imageData = new Uint8Array(arrayBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const ext = 'jpg'; // Default to jpg since we don't know the original extension
    const filename = `migrated/${timestamp}_${randomId}.${ext}`;
    
    // Upload to Storage
    const { data, error } = await supabase.storage
      .from('synced-images')
      .upload(filename, imageData, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (error) {
      console.error(`  ❌ Upload error:`, error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('synced-images')
      .getPublicUrl(filename);
    
    console.log(`  ✅ Migrated to: ${urlData.publicUrl}`);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error(`  ❌ Migration error:`, error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Clear cache on each request to get fresh mappings
    cachedMappings = null;
    
    const body = await req.json();
    const { action, configId, code, redirectUri, folderId, folderName, forceSync } = body;
    
    // Action: Get all mappings
    if (action === 'getMappings') {
      const { data, error } = await supabase
        .from('drive_section_mappings')
        .select('*')
        .order('folder_name');
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, mappings: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Action: Add new mapping
    if (action === 'addMapping') {
      const { folderName: newFolderName, targetTable, displayName } = body;
      
      const { data, error } = await supabase
        .from('drive_section_mappings')
        .insert({
          folder_name: newFolderName,
          target_table: targetTable,
          display_name: displayName || newFolderName,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, mapping: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Action: Delete mapping
    if (action === 'deleteMapping') {
      const { mappingId } = body;
      
      const { error } = await supabase
        .from('drive_section_mappings')
        .delete()
        .eq('id', mappingId);
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'sync') {
      // Get config
      const { data: config, error: configError } = await supabase
        .from('drive_sync_config')
        .select('*')
        .eq('id', configId)
        .single();
        
      if (configError || !config) {
        throw new Error('Config not found');
      }
      
      // Refresh token if needed
      let accessToken = config.access_token;
      if (config.token_expires_at && new Date(config.token_expires_at) < new Date()) {
        accessToken = await refreshAccessToken(config.refresh_token);
        await supabase
          .from('drive_sync_config')
          .update({ 
            access_token: accessToken,
            token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
          })
          .eq('id', configId);
      }
      
      const result: SyncResult = {
        success: true,
        foldersProcessed: 0,
        postsCreated: 0,
        postsSkipped: 0,
        errors: [],
        sections: [],
        skippedSections: [],
      };
      
      // Get section folders (first level under main folder)
      const sectionFolders = await listFolders(accessToken, config.folder_id);
      console.log('=== SYNC START ===');
      console.log('Root folder:', config.folder_id, config.folder_name);
      console.log('Force sync:', forceSync ? 'YES' : 'NO');
      console.log('Found', sectionFolders.length, 'section folders:', sectionFolders.map(f => f.name));
      
      for (const sectionFolder of sectionFolders) {
        // Find mapping from database
        const mapping = await findSectionMapping(supabase, sectionFolder.name);
        
        if (!mapping) {
          result.skippedSections.push(sectionFolder.name);
          console.log('⏭️ Skipping section (no mapping):', sectionFolder.name);
          continue;
        }
        
        console.log(`📁 Processing section: ${sectionFolder.name} -> ${mapping.table}`);
        
        const sectionStats: SectionStats = {
          name: sectionFolder.name,
          table: mapping.table,
          postsFound: 0,
          postsCreated: 0,
          skipped: 0,
          errors: [],
          details: [],
        };
        
        // Get post folders (second level)
        const postFolders = await listFolders(accessToken, sectionFolder.id);
        sectionStats.postsFound = postFolders.length;
        console.log(`  Found ${postFolders.length} post folders`);
        
        for (const postFolder of postFolders) {
          console.log(`  📄 Processing: ${postFolder.name}`);
          
          const syncResult = await syncFolder(
            supabase,
            accessToken,
            configId,
            sectionFolder,
            postFolder,
            mapping.table,
            forceSync
          );
          
          result.foldersProcessed++;
          
          // Add post detail to section stats
          if (syncResult.postDetail) {
            sectionStats.details.push(syncResult.postDetail);
          }
          
          if (syncResult.skipped) {
            sectionStats.skipped++;
            result.postsSkipped++;
            console.log(`    ⏭️ Skipped: ${syncResult.details}`);
          } else if (syncResult.success) {
            sectionStats.postsCreated++;
            result.postsCreated++;
            console.log(`    ✅ Created: ${syncResult.recordId}`);
          } else {
            sectionStats.errors.push(`${postFolder.name}: ${syncResult.error}`);
            result.errors.push(`${sectionFolder.name}/${postFolder.name}: ${syncResult.error}`);
            console.log(`    ❌ Error: ${syncResult.error}`);
          }
        }
        
        result.sections.push(sectionStats);
      }
      
      console.log('=== SYNC COMPLETE ===');
      console.log('Folders processed:', result.foldersProcessed);
      console.log('Posts created:', result.postsCreated);
      console.log('Posts skipped:', result.postsSkipped);
      console.log('Errors:', result.errors.length);
      
      // Log the sync
      await supabase.from('drive_sync_logs').insert({
        config_id: configId,
        sync_type: forceSync ? 'force' : 'normal',
        folders_found: result.foldersProcessed,
        posts_created: result.postsCreated,
        posts_skipped: result.postsSkipped,
        errors: result.errors,
        status: result.errors.length === 0 ? 'success' : 'partial',
      });
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'exchange_code') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      
      const tokens = await response.json();
      
      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }
      
      // Get user email
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userData = await userResponse.json();
      
      // Save config
      const { data: config, error } = await supabase
        .from('drive_sync_config')
        .upsert({
          google_email: userData.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          folder_id: folderId || null,
          folder_name: folderName || null,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, config }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'save_folder') {
      const { data, error } = await supabase
        .from('drive_sync_config')
        .update({ folder_id: folderId, folder_name: folderName })
        .eq('id', configId)
        .select()
        .single();
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, config: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Action: Migrate old Drive URLs to Storage
    if (action === 'migrate_images') {
      console.log('=== MIGRATE IMAGES START ===');
      
      const tables = [
        { name: 'articles', imageField: 'image_url' },
        { name: 'siah_hatzibur', imageField: 'cover_image_url' },
        { name: 'events', imageField: 'image_url' },
        { name: 'galleries', imageField: 'cover_image_url', hasImages: true },
        { name: 'bein_hatzibur', imageField: 'image_url' },
        { name: 'news_batzibur', imageField: 'image_url' },
        { name: 'before_18_years', imageField: null, hasImages: true },
        { name: 'historical_events', imageField: 'cover_image_url' },
      ];
      
      const result = {
        success: true,
        tablesProcessed: 0,
        recordsUpdated: 0,
        imagesUploaded: 0,
        errors: [] as string[],
        details: [] as { table: string; updated: number; errors: number }[],
      };
      
      for (const table of tables) {
        console.log(`📋 Processing table: ${table.name}`);
        let tableUpdated = 0;
        let tableErrors = 0;
        
        try {
          // Get records with Drive URLs
          const { data: records, error: fetchError } = await supabase
            .from(table.name)
            .select('*');
          
          if (fetchError) {
            console.error(`Error fetching ${table.name}:`, fetchError);
            result.errors.push(`${table.name}: ${fetchError.message}`);
            continue;
          }
          
          result.tablesProcessed++;
          
          for (const record of records || []) {
            let needsUpdate = false;
            const updates: any = {};
            
            // Check main image field
            if (table.imageField && record[table.imageField]) {
              const url = record[table.imageField];
              if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
                console.log(`  🖼️ Migrating ${table.imageField} for record ${record.id}`);
                const newUrl = await migrateImageUrl(supabase, url, table.name, record.id);
                if (newUrl) {
                  updates[table.imageField] = newUrl;
                  needsUpdate = true;
                  result.imagesUploaded++;
                } else {
                  tableErrors++;
                }
              }
            }
            
            // Check images array (for galleries, before_18_years, historical_events)
            if (table.hasImages && record.images && Array.isArray(record.images)) {
              const newImages = [];
              let imagesChanged = false;
              
              for (const img of record.images) {
                const imgUrl = typeof img === 'string' ? img : img.url;
                if (imgUrl && (imgUrl.includes('drive.google.com') || imgUrl.includes('googleusercontent.com'))) {
                  console.log(`  🖼️ Migrating array image for record ${record.id}`);
                  const newUrl = await migrateImageUrl(supabase, imgUrl, table.name, record.id);
                  if (newUrl) {
                    if (typeof img === 'string') {
                      newImages.push(newUrl);
                    } else {
                      newImages.push({ ...img, url: newUrl });
                    }
                    imagesChanged = true;
                    result.imagesUploaded++;
                  } else {
                    newImages.push(img);
                    tableErrors++;
                  }
                } else {
                  newImages.push(img);
                }
              }
              
              if (imagesChanged) {
                updates.images = newImages;
                needsUpdate = true;
              }
            }
            
            // Update record if needed
            if (needsUpdate) {
              const { error: updateError } = await supabase
                .from(table.name)
                .update(updates)
                .eq('id', record.id);
              
              if (updateError) {
                console.error(`Error updating ${table.name} ${record.id}:`, updateError);
                tableErrors++;
              } else {
                tableUpdated++;
                result.recordsUpdated++;
              }
            }
          }
        } catch (err) {
          console.error(`Error processing ${table.name}:`, err);
          result.errors.push(`${table.name}: ${String(err)}`);
        }
        
        result.details.push({
          table: table.name,
          updated: tableUpdated,
          errors: tableErrors,
        });
      }
      
      console.log('=== MIGRATE IMAGES COMPLETE ===');
      console.log(`Records updated: ${result.recordsUpdated}`);
      console.log(`Images uploaded: ${result.imagesUploaded}`);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Action: Remove duplicate posts (keep ones with images)
    if (action === 'remove_duplicates') {
      console.log('=== REMOVE DUPLICATES START ===');
      
      const tables = [
        { name: 'articles', imageField: 'image_url' },
        { name: 'siah_hatzibur', imageField: 'cover_image_url' },
        { name: 'events', imageField: 'image_url' },
        { name: 'galleries', imageField: 'cover_image_url' },
        { name: 'bein_hatzibur', imageField: 'image_url' },
        { name: 'news_batzibur', imageField: 'image_url' },
        { name: 'before_18_years', imageField: null, hasImages: true },
        { name: 'historical_events', imageField: 'cover_image_url' },
      ];
      
      const result = {
        success: true,
        tablesProcessed: 0,
        duplicatesRemoved: 0,
        errors: [] as string[],
        details: [] as { table: string; duplicates: number; kept: number }[],
      };
      
      for (const table of tables) {
        console.log(`📋 Processing table: ${table.name}`);
        let duplicatesRemoved = 0;
        let kept = 0;
        
        try {
          // Get all records
          const { data: records, error: fetchError } = await supabase
            .from(table.name)
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fetchError) {
            console.error(`Error fetching ${table.name}:`, fetchError);
            result.errors.push(`${table.name}: ${fetchError.message}`);
            continue;
          }
          
          result.tablesProcessed++;
          
          // Group by title
          const byTitle: Record<string, any[]> = {};
          for (const record of records || []) {
            const title = record.title?.trim() || '';
            if (!title) continue;
            
            if (!byTitle[title]) {
              byTitle[title] = [];
            }
            byTitle[title].push(record);
          }
          
          // Find duplicates and decide which to keep
          for (const [title, duplicates] of Object.entries(byTitle)) {
            if (duplicates.length <= 1) continue;
            
            console.log(`  Found ${duplicates.length} duplicates for: ${title}`);
            
            // Sort: prefer ones with images, then newer
            duplicates.sort((a, b) => {
              // Check for images
              const aHasImage = hasValidImage(a, table);
              const bHasImage = hasValidImage(b, table);
              
              if (aHasImage && !bHasImage) return -1;
              if (!aHasImage && bHasImage) return 1;
              
              // Both have or don't have images - keep newer
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            
            // Keep first, delete rest
            const toKeep = duplicates[0];
            const toDelete = duplicates.slice(1);
            
            console.log(`  Keeping: ${toKeep.id} (has image: ${hasValidImage(toKeep, table)})`);
            
            for (const dup of toDelete) {
              const { error: deleteError } = await supabase
                .from(table.name)
                .delete()
                .eq('id', dup.id);
              
              if (deleteError) {
                console.error(`  Error deleting ${dup.id}:`, deleteError);
              } else {
                duplicatesRemoved++;
                result.duplicatesRemoved++;
                console.log(`  Deleted: ${dup.id}`);
              }
            }
            
            kept++;
          }
        } catch (err) {
          console.error(`Error processing ${table.name}:`, err);
          result.errors.push(`${table.name}: ${String(err)}`);
        }
        
        result.details.push({
          table: table.name,
          duplicates: duplicatesRemoved,
          kept,
        });
      }
      
      // Also clean up synced items tracking
      console.log('Cleaning up drive_synced_items...');
      const { error: cleanupError } = await supabase
        .from('drive_synced_items')
        .delete()
        .not('target_record_id', 'is', null);
      
      if (cleanupError) {
        console.error('Error cleaning synced items:', cleanupError);
      }
      
      console.log('=== REMOVE DUPLICATES COMPLETE ===');
      console.log(`Duplicates removed: ${result.duplicatesRemoved}`);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    throw new Error('Invalid action');
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

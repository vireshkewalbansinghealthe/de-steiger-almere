#!/usr/bin/env python3
"""
Read Word .docx files without external dependencies
.docx files are ZIP archives containing XML files
"""

import zipfile
import xml.etree.ElementTree as ET
import re
from pathlib import Path

# Namespaces used in Word XML
WORD_NAMESPACE = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def extract_text_from_docx(docx_path):
    """Extract text from .docx file"""
    try:
        # Open the .docx file as a ZIP archive
        with zipfile.ZipFile(docx_path, 'r') as docx_zip:
            # Read the main document XML
            xml_content = docx_zip.read('word/document.xml')
            
            # Parse XML
            tree = ET.fromstring(xml_content)
            
            # Extract all text elements
            paragraphs = []
            variables = []
            
            # Find all paragraphs
            for paragraph in tree.findall('.//w:p', WORD_NAMESPACE):
                para_text = []
                
                # Find all text runs in the paragraph
                for run in paragraph.findall('.//w:r', WORD_NAMESPACE):
                    # Get text content
                    text_elem = run.find('.//w:t', WORD_NAMESPACE)
                    if text_elem is not None and text_elem.text:
                        text = text_elem.text
                        
                        # Check if this run has color formatting (indicating a variable)
                        color_elem = run.find('.//w:color', WORD_NAMESPACE)
                        is_red = False
                        
                        if color_elem is not None:
                            color_value = color_elem.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
                            # Check if color is red-ish (FF0000, etc.)
                            if color_value and color_value.upper() in ['FF0000', 'FF0000', 'C00000', 'E00000', 'FF0000']:
                                is_red = True
                                variables.append(text.strip())
                        
                        if is_red:
                            para_text.append(f"{{{{VAR: {text}}}}}")
                        else:
                            para_text.append(text)
                
                # Add paragraph if it has content
                if para_text:
                    paragraphs.append(''.join(para_text))
            
            return paragraphs, variables
            
    except Exception as e:
        print(f"❌ Error reading {docx_path}: {e}")
        return [], []

def main():
    """Main function to read contract documents"""
    docx_files = [
        "Reserveringsovereenkomst bedrijfsunit 25-11.docx",
        "Reserveringsovereenkomst garagebox 25-11.docx"
    ]
    
    for docx_file in docx_files:
        print("\n" + "=" * 80)
        print(f"READING: {docx_file}")
        print("=" * 80 + "\n")
        
        if not Path(docx_file).exists():
            print(f"❌ File not found: {docx_file}")
            continue
        
        try:
            paragraphs, variables = extract_text_from_docx(docx_file)
            
            # Print contract text
            print("📄 CONTRACT TEXT:")
            print("-" * 80)
            for para in paragraphs:
                if para.strip():
                    print(para)
                    print()
            
            # Print variables found
            print("\n" + "=" * 80)
            print(f"🔴 VARIABLES FOUND: {len(set(variables))}")
            print("=" * 80)
            for var in sorted(set(variables)):
                print(f"  • {var}")
            
            # Save to text file
            output_file = docx_file.replace('.docx', '-extracted.txt')
            with open(output_file, 'w', encoding='utf-8') as f:
                for para in paragraphs:
                    if para.strip():
                        f.write(para + '\n\n')
            
            print(f"\n✅ Saved to: {output_file}\n")
            
        except Exception as e:
            print(f"❌ Error processing {docx_file}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()


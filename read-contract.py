#!/usr/bin/env python3
"""
Read Word document and extract text with formatting information
"""

try:
    from docx import Document
    from docx.shared import RGBColor
except ImportError:
    print("ERROR: python-docx not installed")
    print("Please run: pip install python-docx")
    exit(1)

def is_red_text(run):
    """Check if text is red (indicating a variable)"""
    if run.font.color and run.font.color.rgb:
        r, g, b = run.font.color.rgb
        # Check if it's red-ish (high red, low green/blue)
        return r > 200 and g < 100 and b < 100
    return False

def read_contract(docx_path):
    """Read contract document and identify variables"""
    doc = Document(docx_path)
    
    contract_text = []
    variables = []
    
    print("=" * 80)
    print("CONTRACT DOCUMENT ANALYSIS")
    print("=" * 80)
    print()
    
    for para in doc.paragraphs:
        para_text = []
        for run in para.runs:
            text = run.text
            if text.strip():
                if is_red_text(run):
                    # This is a variable
                    variables.append(text.strip())
                    para_text.append(f"{{{{VAR: {text.strip()}}}}}")
                    print(f"🔴 VARIABLE FOUND: {text.strip()}")
                else:
                    para_text.append(text)
        
        full_para = ''.join(para_text)
        if full_para.strip():
            contract_text.append(full_para)
    
    print()
    print("=" * 80)
    print("FULL CONTRACT TEXT")
    print("=" * 80)
    print()
    
    for line in contract_text:
        print(line)
        print()
    
    print()
    print("=" * 80)
    print(f"FOUND {len(variables)} VARIABLES")
    print("=" * 80)
    for var in set(variables):
        print(f"  - {var}")
    print()
    
    return contract_text, variables

if __name__ == "__main__":
    import sys
    
    docx_files = [
        "Reserveringsovereenkomst bedrijfsunit 25-11.docx",
        "Reserveringsovereenkomst garagebox 25-11.docx"
    ]
    
    for docx_file in docx_files:
        print(f"\n{'='*80}")
        print(f"READING: {docx_file}")
        print(f"{'='*80}\n")
        
        try:
            contract_text, variables = read_contract(docx_file)
            
            # Save to text file
            output_file = docx_file.replace('.docx', '-extracted.txt')
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write('\n\n'.join(contract_text))
            print(f"✅ Saved to: {output_file}")
            
        except FileNotFoundError:
            print(f"❌ File not found: {docx_file}")
        except Exception as e:
            print(f"❌ Error reading {docx_file}: {e}")


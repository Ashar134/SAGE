import os
import json
from pathlib import Path
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from ..config import QUESTION_FILES, BASE_DIR

EMBEDDING_MODEL = None


def _get_embedding_model():
    global EMBEDDING_MODEL
    if EMBEDDING_MODEL is None:
        print("Loading HuggingFace embedding model")
        EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        print("Embedding model loaded.")
    return EMBEDDING_MODEL

def ingest_all_json_questions():
    print("Starting JSON Question Ingestion...")
    
    # Set up the database directory
    base_dir = Path(__file__).resolve().parent
    persist_dir = str(base_dir / "db" / "chroma_question_bank")
    
    all_documents = []
    
    # Iterate through all configured question files
    for domain, mapping in QUESTION_FILES.items():
        if isinstance(mapping, list):
            # It's a flat list of paths like analytical, english, physics, maths
            for file_path in mapping:
                docs = _load_and_process_json(BASE_DIR / file_path, domain)
                all_documents.extend(docs)
        elif isinstance(mapping, dict):
            # It's a nested dictionary like cs
            for sub_domain, file_paths in mapping.items():
                for file_path in file_paths:
                    docs = _load_and_process_json(BASE_DIR / file_path, domain, sub_domain)
                    all_documents.extend(docs)
                    
    print(f"Total questions loaded into memory: {len(all_documents)}")
    
    if not all_documents:
        print(" No questions loaded. Please check file paths.")
        return None
        
    print(" Building Chroma Vector Store... This may take a few minutes...")
    vector_db = Chroma.from_documents(
        documents=all_documents,
        embedding=_get_embedding_model(),
        persist_directory=persist_dir,
        collection_metadata={"hnsw:space": "cosine"}
    )
    
    print(f"Ingestion complete. DB saved in: {persist_dir}")
    return vector_db

def _load_and_process_json(file_path: Path, domain: str, sub_domain: str = None) -> list:
    """Helper to parse a single JSON file and extract Document objects"""
    docs = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            for item in data:
                # We embed the question and justification as context
                question_text = item.get("question", "")
                justification = item.get("justification", "")
                options = item.get("answers", {})
                if isinstance(options, dict):
                    options_str = ", ".join([f"{k}: {v}" for k, v in options.items()])
                elif isinstance(options, list):
                    options_str = ", ".join(options)
                else:
                    options_str = str(options)
                    
                context = f"Domain: {domain}\nSub-domain: {sub_domain or 'General'}\nQuestion: {question_text}\nOptions: {options_str}\nJustification: {justification}"
                
                # Metadata stores info that will help in retrieval tracing if needed
                metadata = {
                    "domain": domain,
                    "sub_domain": sub_domain or "General",
                    "file_source": file_path.name
                }
                
                docs.append(Document(page_content=context, metadata=metadata))
    except Exception as e:
        print(f" Error reading {file_path}: {e}")
        
    return docs

if __name__ == "__main__":
    ingest_all_json_questions()